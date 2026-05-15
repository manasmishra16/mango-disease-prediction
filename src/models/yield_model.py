"""
Yield Prediction Module (Phase 4).

Models:
- RandomForest baseline (RS2023 replication)
- XGBoost with Optuna tuning
- LSTM for temporal sequences
- Ensemble: XGBoost + LSTM weighted blend

Features:
- Climate: 30-day rolling (mean rain, temp variance, cumulative ET, humidity)
- Disease: severity_score from Phase 3 multitask model
- Variety: one-hot (Raspuri, Banganapalli, Totapuri)
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import optuna
from pathlib import Path
import json
import joblib

optuna.logging.set_verbosity(optuna.logging.WARNING)


# ──────────────────────────────────────────────
# Feature Engineering
# ──────────────────────────────────────────────

def compute_rolling_features(daily_csv, window=30):
    """
    Compute 30-day rolling features from daily climate data.
    Returns one row per (year, region) with rolling aggregates.
    """
    df = pd.read_csv(daily_csv, parse_dates=['date'])
    df['year'] = df['date'].dt.year
    df['temp_delta'] = df['tmax'] - df['tmin']

    # VPD approximation: saturation vapor pressure deficit
    # es = 0.6108 * exp(17.27 * T / (T + 237.3))
    es_max = 0.6108 * np.exp(17.27 * df['tmax'] / (df['tmax'] + 237.3))
    es_min = 0.6108 * np.exp(17.27 * df['tmin'] / (df['tmin'] + 237.3))
    ea = (df['humidity'] / 100.0) * (es_max + es_min) / 2
    df['vpd'] = ((es_max + es_min) / 2) - ea

    # Rolling features per region
    features = []
    for (year, region), group in df.groupby(['year', 'region']):
        group = group.sort_values('date')
        row = {
            'year': year,
            'region': region,
            'rain_mean_30d': group['rain'].rolling(window, min_periods=1).mean().iloc[-1],
            'rain_cumul': group['rain'].sum(),
            'tmax_mean': group['tmax'].mean(),
            'tmin_mean': group['tmin'].mean(),
            'temp_delta_mean': group['temp_delta'].mean(),
            'temp_var_30d': group['tmax'].rolling(window, min_periods=1).var().iloc[-1],
            'humidity_mean': group['humidity'].mean(),
            'vpd_mean': group['vpd'].mean(),
        }
        features.append(row)

    return pd.DataFrame(features)


def build_yield_dataset(daily_csv, yield_csv, disease_severity=None):
    """
    Build full feature matrix for yield prediction.

    Args:
        daily_csv: path to daily climate CSV
        yield_csv: path to yield CSV (with year, region, variety, yield_t_ha)
        disease_severity: dict mapping (year, region) -> severity score (from Phase 3)
    """
    rolling = compute_rolling_features(daily_csv)
    yields = pd.read_csv(yield_csv)

    # Merge on year + region
    df = yields.merge(rolling, on=['year', 'region'], how='left')

    # Add disease severity score (key novelty)
    if disease_severity is not None:
        df['disease_severity'] = df.apply(
            lambda r: disease_severity.get((r['year'], r['region']), 1.0), axis=1
        )
    else:
        # Mock severity: random 0-3 correlated with yield
        np.random.seed(42)
        df['disease_severity'] = np.clip(
            3.0 - (df['yield_t_ha'] / df['yield_t_ha'].max()) * 3.0 + np.random.normal(0, 0.3, len(df)),
            0, 3
        )

    # One-hot variety
    variety_dummies = pd.get_dummies(df['variety'], prefix='var')
    df = pd.concat([df, variety_dummies], axis=1)

    return df


def prepare_Xy(df):
    """Split feature matrix into X, y."""
    feature_cols = [c for c in df.columns if c not in
                    ['year', 'region', 'variety', 'yield_t_ha']]
    X = df[feature_cols].values.astype(np.float32)
    y = df['yield_t_ha'].values.astype(np.float32)
    return X, y, feature_cols


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────

class YieldLSTM(nn.Module):
    """Simple LSTM for yield regression from climate sequence."""
    def __init__(self, input_dim, hidden_dim=64, num_layers=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers,
                            batch_first=True, dropout=dropout)
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        # x: (B, seq_len, input_dim)
        _, (h_n, _) = self.lstm(x)
        out = self.fc(h_n[-1])  # Last layer hidden state
        return out.squeeze(-1)


def build_lstm_sequences(daily_csv, yield_csv, seq_len=30):
    """
    Build (sequence, target) pairs for LSTM.
    Each sequence = last `seq_len` days of climate for a (year, region).
    Target = yield for that (year, region, variety).
    """
    daily = pd.read_csv(daily_csv, parse_dates=['date'])
    daily['year'] = daily['date'].dt.year
    daily['temp_delta'] = daily['tmax'] - daily['tmin']

    yields = pd.read_csv(yield_csv)
    climate_cols = ['tmax', 'tmin', 'rain', 'humidity', 'temp_delta']

    sequences = []
    targets = []

    for _, row in yields.iterrows():
        yr, reg = row['year'], row['region']
        subset = daily[(daily['year'] == yr) & (daily['region'] == reg)]
        subset = subset.sort_values('date')

        if len(subset) < seq_len:
            # Pad with zeros
            pad = np.zeros((seq_len - len(subset), len(climate_cols)))
            seq = np.vstack([pad, subset[climate_cols].values])
        else:
            seq = subset[climate_cols].values[-seq_len:]

        sequences.append(seq)
        targets.append(row['yield_t_ha'])

    return np.array(sequences, dtype=np.float32), np.array(targets, dtype=np.float32)


# ──────────────────────────────────────────────
# Training Functions
# ──────────────────────────────────────────────

def train_rf_baseline(X_train, y_train, X_test, y_test, seed=42):
    """Random Forest baseline (RS2023 replication)."""
    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=seed)
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    return model, evaluate_metrics(y_test, preds)


def optuna_xgboost(X_train, y_train, X_val, y_val, n_trials=100, seed=42):
    """Optuna-tuned XGBoost."""
    def objective(trial):
        params = {
            'max_depth': trial.suggest_int('max_depth', 3, 10),
            'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
            'n_estimators': trial.suggest_int('n_estimators', 50, 500),
            'subsample': trial.suggest_float('subsample', 0.6, 1.0),
            'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
            'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
            'reg_lambda': trial.suggest_float('reg_lambda', 1e-8, 10.0, log=True),
            'random_state': seed,
        }
        model = xgb.XGBRegressor(**params)
        model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=False)
        preds = model.predict(X_val)
        return mean_absolute_error(y_val, preds)

    study = optuna.create_study(direction='minimize',
                                 sampler=optuna.samplers.TPESampler(seed=seed))
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    best = study.best_params
    best['random_state'] = seed
    model = xgb.XGBRegressor(**best)
    model.fit(X_train, y_train)

    return model, study.best_params


def train_lstm(sequences_train, y_train, sequences_val, y_val,
               epochs=100, lr=1e-3, seed=42):
    """Train LSTM model."""
    torch.manual_seed(seed)
    input_dim = sequences_train.shape[2]

    model = YieldLSTM(input_dim=input_dim)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()

    X_t = torch.tensor(sequences_train)
    y_t = torch.tensor(y_train)
    X_v = torch.tensor(sequences_val)

    best_loss = float('inf')
    best_state = None

    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        pred = model(X_t)
        loss = criterion(pred, y_t)
        loss.backward()
        optimizer.step()

        model.eval()
        with torch.no_grad():
            val_pred = model(X_v)
            val_loss = criterion(val_pred, torch.tensor(y_val)).item()

        if val_loss < best_loss:
            best_loss = val_loss
            best_state = model.state_dict().copy()

    model.load_state_dict(best_state)
    return model


def ensemble_predict(xgb_preds, lstm_preds, w_xgb=0.6):
    """Weighted ensemble blend."""
    return w_xgb * xgb_preds + (1 - w_xgb) * lstm_preds


def optuna_ensemble_weights(xgb_preds, lstm_preds, y_true, n_trials=50):
    """Find optimal ensemble weights via Optuna."""
    def objective(trial):
        w = trial.suggest_float('w_xgb', 0.0, 1.0)
        blended = ensemble_predict(xgb_preds, lstm_preds, w)
        return mean_absolute_error(y_true, blended)

    study = optuna.create_study(direction='minimize')
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)
    return study.best_params['w_xgb']


# ──────────────────────────────────────────────
# Metrics
# ──────────────────────────────────────────────

def evaluate_metrics(y_true, y_pred):
    """Compute yield prediction metrics."""
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    nmae = (mae / np.mean(y_true)) * 100
    return {'MAE': float(mae), 'RMSE': float(rmse), 'R2': float(r2), 'NMAE%': float(nmae)}
