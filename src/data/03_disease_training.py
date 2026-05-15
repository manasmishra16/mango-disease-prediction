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
# # Disease Detection Training (Phase 3)
#
# This notebook documents training results for all model architectures.
# 
# **Training is done via CLI** (designed for GPU outsourcing):
# ```bash
# # On GPU machine:
# PYTHONPATH=. uv run python src/models/train.py --model vanilla --epochs 50 --batch-size 32
# PYTHONPATH=. uv run python src/models/train.py --model se --epochs 50 --batch-size 32
# PYTHONPATH=. uv run python src/models/train.py --model multitask --epochs 50 --batch-size 32 --lambda-mt 0.7
# PYTHONPATH=. uv run python src/models/train.py --model efficientnet --epochs 30 --batch-size 16 --lr 1e-4
# PYTHONPATH=. uv run python src/models/train.py --model vgg16 --epochs 30 --batch-size 16 --lr 1e-4
# ```

# %%
import os
import json
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

if Path.cwd().name == 'notebooks':
    os.chdir('..')

# %% [markdown]
# ## Model Comparison Table

# %%
models_dir = Path('models')
results = []

for f in models_dir.glob('*_results.json'):
    with open(f) as fh:
        r = json.load(fh)
        results.append({
            'Model': r['model'],
            'Params': f"{r['params']:,}",
            'Test Acc': f"{r['test_acc']:.4f}",
            'Test F1': f"{r['test_f1_macro']:.4f}",
            'Test Precision': f"{r['test_precision_macro']:.4f}",
            'Test Recall': f"{r['test_recall_macro']:.4f}",
            'Epochs': r['epochs_trained'],
        })

if results:
    df = pd.DataFrame(results)
    print(df.to_string(index=False))
else:
    print("No results found yet. Run training first.")

# %% [markdown]
# ## Training Curves

# %%
for f in models_dir.glob('*_results.json'):
    with open(f) as fh:
        r = json.load(fh)
    
    if not r.get('history'):
        continue
    
    history = r['history']
    epochs = [h['epoch'] for h in history]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    ax1.plot(epochs, [h['train_loss'] for h in history], label='Train')
    ax1.plot(epochs, [h['val_loss'] for h in history], label='Val')
    ax1.set_title(f"{r['model']} - Loss")
    ax1.set_xlabel('Epoch')
    ax1.legend()
    
    ax2.plot(epochs, [h['train_acc'] for h in history], label='Train')
    ax2.plot(epochs, [h['val_acc'] for h in history], label='Val')
    ax2.set_title(f"{r['model']} - Accuracy")
    ax2.set_xlabel('Epoch')
    ax2.legend()
    
    plt.tight_layout()
    plt.savefig(f'reports/figures/{r["model"]}_curves.png')
    plt.close()

print("Training curve plots saved to reports/figures/")
