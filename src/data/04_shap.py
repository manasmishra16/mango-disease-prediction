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
# # SHAP Analysis v2 (Phase 4)
#
# Feature importance via SHAP for the XGBoost yield model on monthly data.

# %%
import os
from pathlib import Path
import numpy as np
import pandas as pd
import shap
import matplotlib.pyplot as plt

if Path.cwd().name == 'notebooks':
    os.chdir('..')

from src.models.yield_model import (
    build_yield_dataset_monthly, prepare_Xy
)
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# %% [markdown]
# ## Load Monthly Data and Train XGBoost

# %%
DAILY_CSV = 'data/raw/climate_daily_2015_2024.csv'
YIELD_CSV = 'data/raw/nhb_yield_mock_2015_2024.csv'

df = build_yield_dataset_monthly(DAILY_CSV, YIELD_CSV)
X, y, feature_cols = prepare_Xy(df)

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = xgb.XGBRegressor(n_estimators=200, max_depth=5, learning_rate=0.1, random_state=42)
model.fit(X_scaled, y, verbose=False)
model.save_model('models/xgb_yield_best.json')

# %% [markdown]
# ## SHAP Waterfall Plot

# %%
explainer = shap.Explainer(model, feature_names=feature_cols)
shap_values = explainer(X_scaled)

plt.figure()
shap.plots.waterfall(shap_values[0], show=False)
plt.tight_layout()
plt.savefig('reports/figures/shap_waterfall.png', dpi=150, bbox_inches='tight')
print("Saved shap_waterfall.png")

# %% [markdown]
# ## SHAP Beeswarm Plot

# %%
plt.figure()
shap.plots.beeswarm(shap_values, show=False)
plt.tight_layout()
plt.savefig('reports/figures/shap_beeswarm.png', dpi=150, bbox_inches='tight')
print("Saved shap_beeswarm.png")

# %% [markdown]
# ## Feature Importance Ranking

# %%
importance = pd.DataFrame({
    'feature': feature_cols,
    'mean_abs_shap': np.abs(shap_values.values).mean(axis=0)
}).sort_values('mean_abs_shap', ascending=False)

print("Feature Importance (SHAP):")
print(importance.to_string(index=False))

# %% [markdown]
# ## Key Finding
#
# Does `disease_severity` appear in the top features?
# If yes → confirms the **novel contribution** of coupling disease detection with yield prediction.
