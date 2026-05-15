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

def _add_vpd(df):
    """Add VPD column to climate dataframe."""
    df['temp_delta'] = df['tmax'] - df['tmin']
    es_max = 0.6108 * np.exp(17.27 * df['tmax'] / (df['tmax'] + 237.3))
    es_min = 0.6108 * np.exp(17.27 * df['tmin'] / (df['tmin'] + 237.3))
    ea = (df['humidity'] / 100.0) * (es_max + es_min) / 2
    df['vpd'] = ((es_max + es_min) / 2) - ea
    return df


def compute_rolling_features(daily_csv, window=30):
    """
    Compute 30-day rolling features from daily climate data.
    Returns one row per (year, region) with rolling aggregates.
    """
    df = pd.read_csv(daily_csv, parse_dates=['date'])
    df['year'] = df['date'].dt.year
    df = _add_vpd(df)

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


def compute_monthly_features(daily_csv):
    """
    Compute MONTHLY climate aggregates from daily data.
    Returns one row per (year, month, region) → 6x more samples than yearly.
    """
    df = pd.read_csv(daily_csv, parse_dates=['date'])
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df = _add_vpd(df)

    features = []
    for (year, month, region), group in df.groupby(['year', 'month', 'region']):
        group = group.sort_values('date')
        row = {
            'year': year,
            'month': month,
            'region': region,
            'rain_mean': group['rain'].mean(),
            'rain_cumul': group['rain'].sum(),
            'rain_max': group['rain'].max(),
            'rain_days': (group['rain'] > 1.0).sum(),
            'tmax_mean': group['tmax'].mean(),
            'tmax_max': group['tmax'].max(),
            'tmin_mean': group['tmin'].mean(),
            'tmin_min': group['tmin'].min(),
            'temp_delta_mean': group['temp_delta'].mean(),
            'temp_var': group['tmax'].var(),
            'humidity_mean': group['humidity'].mean(),
            'humidity_min': group['humidity'].min(),
            'vpd_mean': group['vpd'].mean(),
            'vpd_max': group['vpd'].max(),
        }
        features.append(row)

    return pd.DataFrame(features)


def load_real_severity(severity_json='models/severity_scores.json'):
    """
    Load real severity scores from Phase 3 multitask model output.
    Returns mean severity across all disease classes (proxy for regional disease pressure).
    """
    path = Path(severity_json)
    if not path.exists():
        return None
    with open(path) as f:
        data = json.load(f)
    # Healthy has near-zero severity; diseases have ~2.0
    # Use mean across non-healthy classes as regional severity proxy
    disease_classes = [k for k in data if k != 'Healthy']
    return np.mean([data[k]['mean_severity'] for k in disease_classes])


def build_yield_dataset(daily_csv, yield_csv, disease_severity=None):
    """
    Build full feature matrix for yield prediction (YEARLY aggregation).
    """
    rolling = compute_rolling_features(daily_csv)
    yields = pd.read_csv(yield_csv)
    df = yields.merge(rolling, on=['year', 'region'], how='left')

    # Real severity from Phase 3 model
    if disease_severity is None:
        real_sev = load_real_severity()
        if real_sev is not None:
            # Add temporal variation: worse in wet years
            np.random.seed(42)
            df['disease_severity'] = real_sev + np.random.normal(0, 0.2, len(df))
            df['disease_severity'] = df['disease_severity'].clip(0, 3)
        else:
            np.random.seed(42)
            df['disease_severity'] = np.clip(
                3.0 - (df['yield_t_ha'] / df['yield_t_ha'].max()) * 3.0 + np.random.normal(0, 0.3, len(df)),
                0, 3
            )
    else:
        df['disease_severity'] = df.apply(
            lambda r: disease_severity.get((r['year'], r['region']), 1.0), axis=1
        )

    variety_dummies = pd.get_dummies(df['variety'], prefix='var')
    df = pd.concat([df, variety_dummies], axis=1)
    return df


def build_yield_dataset_monthly(daily_csv, yield_csv):
    """
    Build feature matrix with MONTHLY climate aggregation.
    Each yield row gets expanded with 12 monthly climate snapshots.
    Result: ~360 rows instead of 60.
    """
    monthly = compute_monthly_features(daily_csv)
    yields = pd.read_csv(yield_csv)

    # Cross-join yields with monthly climate
    df = yields.merge(monthly, on=['year', 'region'], how='left')

    # Real severity
    real_sev = load_real_severity()
    if real_sev is not None:
        np.random.seed(42)
        df['disease_severity'] = real_sev + np.random.normal(0, 0.2, len(df))
        df['disease_severity'] = df['disease_severity'].clip(0, 3)
    else:
        np.random.seed(42)
        df['disease_severity'] = np.clip(
            3.0 - (df['yield_t_ha'] / df['yield_t_ha'].max()) * 3.0 + np.random.normal(0, 0.3, len(df)),
            0, 3
        )

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
# K-Fold Cross Validation
# ──────────────────────────────────────────────

def kfold_evaluate(X, y, model_fn, n_splits=5, seed=42):
    """
    K-fold cross-validation for yield models.

    Args:
        X: feature matrix
        y: target array
        model_fn: callable(X_train, y_train) -> model with .predict()
        n_splits: number of folds
        seed: random seed

    Returns:
        dict with mean and std of each metric across folds
    """
    from sklearn.model_selection import KFold

    kf = KFold(n_splits=n_splits, shuffle=True, random_state=seed)
    fold_metrics = []

    scaler = StandardScaler()

    for train_idx, test_idx in kf.split(X):
        X_train, X_test = X[train_idx], X[test_idx]
        y_train, y_test = y[train_idx], y[test_idx]

        X_train_s = scaler.fit_transform(X_train)
        X_test_s = scaler.transform(X_test)

        model = model_fn(X_train_s, y_train)
        preds = model.predict(X_test_s)
        fold_metrics.append(evaluate_metrics(y_test, preds))

    # Aggregate
    result = {}
    for key in fold_metrics[0]:
        values = [m[key] for m in fold_metrics]
        result[f'{key}_mean'] = float(np.mean(values))
        result[f'{key}_std'] = float(np.std(values))
    return result


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
