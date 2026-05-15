# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.16.1
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
# ---

# %% [markdown]
# # Yield Prediction Training (Phase 4)
#
# Train RF, XGBoost (Optuna), LSTM, and Ensemble models.
# Compare with/without disease severity feature.

# %%
import os
import json
from pathlib import Path
import numpy as np
import pandas as pd
import torch
import matplotlib.pyplot as plt

if Path.cwd().name == 'notebooks':
    os.chdir('..')

from src.models.yield_model import (
    build_yield_dataset, prepare_Xy, build_lstm_sequences,
    train_rf_baseline, optuna_xgboost, train_lstm,
    ensemble_predict, optuna_ensemble_weights, evaluate_metrics
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# %% [markdown]
# ## 1. Build Feature Dataset

# %%
DAILY_CSV = 'data/raw/climate_daily_2015_2024.csv'
YIELD_CSV = 'data/raw/nhb_yield_mock_2015_2024.csv'

df = build_yield_dataset(DAILY_CSV, YIELD_CSV)
print(f"Dataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(df.head())

# %%
X, y, feature_cols = prepare_Xy(df)
print(f"\nFeatures ({len(feature_cols)}): {feature_cols}")
print(f"X shape: {X.shape}, y shape: {y.shape}")

# %% [markdown]
# ## 2. Train/Test Split

# %%
# Time-based split: 2015-2021 train, 2022-2024 test (prevent future leak)
train_mask = df['year'] <= 2021
test_mask = df['year'] > 2021

X_train, X_test = X[train_mask], X[test_mask]
y_train, y_test = y[train_mask], y[test_mask]

# Further split train into train/val for Optuna
X_tr, X_val, y_tr, y_val = train_test_split(
    X_train, y_train, test_size=0.2, random_state=42
)

# Scale
scaler = StandardScaler()
X_tr_s = scaler.fit_transform(X_tr)
X_val_s = scaler.transform(X_val)
X_test_s = scaler.transform(X_test)

print(f"Train: {X_tr.shape}, Val: {X_val.shape}, Test: {X_test.shape}")

# %% [markdown]
# ## 3. Random Forest Baseline

# %%
rf_model, rf_metrics = train_rf_baseline(X_tr_s, y_tr, X_test_s, y_test)
print("RF Baseline:", rf_metrics)

# %% [markdown]
# ## 4. XGBoost + Optuna

# %%
xgb_model, xgb_best_params = optuna_xgboost(X_tr_s, y_tr, X_val_s, y_val, n_trials=100)
xgb_preds = xgb_model.predict(X_test_s)
xgb_metrics = evaluate_metrics(y_test, xgb_preds)
print("XGBoost:", xgb_metrics)
print("Best params:", xgb_best_params)

# %% [markdown]
# ## 5. LSTM

# %%
sequences, seq_targets = build_lstm_sequences(DAILY_CSV, YIELD_CSV, seq_len=30)

seq_train = sequences[train_mask]
seq_test = sequences[test_mask]
y_seq_train = seq_targets[train_mask]
y_seq_test = seq_targets[test_mask]

# Split train for val
idx = int(len(seq_train) * 0.8)
seq_tr, seq_val = seq_train[:idx], seq_train[idx:]
y_seq_tr, y_seq_val = y_seq_train[:idx], y_seq_train[idx:]

lstm_model = train_lstm(seq_tr, y_seq_tr, seq_val, y_seq_val, epochs=200)

lstm_model.eval()
with torch.no_grad():
    lstm_preds = lstm_model(torch.tensor(seq_test)).numpy()
lstm_metrics = evaluate_metrics(y_seq_test, lstm_preds)
print("LSTM:", lstm_metrics)

# %% [markdown]
# ## 6. Ensemble (XGBoost + LSTM)

# %%
w_xgb = optuna_ensemble_weights(xgb_preds, lstm_preds, y_test, n_trials=50)
ensemble_preds = ensemble_predict(xgb_preds, lstm_preds, w_xgb)
ensemble_metrics = evaluate_metrics(y_test, ensemble_preds)
print(f"Ensemble (w_xgb={w_xgb:.2f}):", ensemble_metrics)

# %% [markdown]
# ## 7. Comparison Table

# %%
results = {
    'RF Baseline': rf_metrics,
    'XGBoost (Optuna)': xgb_metrics,
    'LSTM': lstm_metrics,
    f'Ensemble (w={w_xgb:.2f})': ensemble_metrics,
}

results_df = pd.DataFrame(results).T
print(results_df.to_string())

# Save
results_df.to_csv('models/yield_results.csv')

# Plot
fig, ax = plt.subplots(figsize=(8, 5))
results_df['MAE'].plot(kind='bar', ax=ax, color=['#4E79A7', '#F28E2B', '#E15759', '#76B7B2'])
ax.set_ylabel('MAE (t/ha)')
ax.set_title('Yield Prediction — Model Comparison')
ax.axhline(y=2.9, color='red', linestyle='--', label='RS2023 baseline (2.9 t/ha)')
ax.legend()
plt.tight_layout()
plt.savefig('reports/figures/yield_comparison.png')
print("Saved to reports/figures/yield_comparison.png")
