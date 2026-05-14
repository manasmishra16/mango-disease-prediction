# MangoDL: Mango Yield and Disease Prediction

Deep Learning Approach for Mango Yield and Disease Prediction Using Climate Data.

## Project Overview
Unified precision agriculture platform with three integrated ML modules:
1. **Disease Detection**: CNN-based classification with SE-blocks and Grad-CAM/LIME explainability.
2. **Yield Prediction**: XGBoost + LSTM fusion using vegetation indices and NASA POWER weather data.
3. **Economic Module**: Profit estimation and decision support for farmers.

## Tech Stack
- **Framework**: PyTorch 2.x
- **Models**: Enhanced MangoLeafXNet, XGBoost, LSTM
- **Explainability**: torchcam, SHAP, LIME
- **API**: FastAPI
- **Frontend**: React + Tailwind + Recharts

## Project Structure
- `data/`: Datasets and climate records.
- `src/`: Core logic and model definitions.
- `notebooks/`: EDA and training experiments.
- `backend/`: FastAPI server.
- `frontend/`: React dashboard.

## Setup
This project uses `uv` for dependency management.

```bash
# Install dependencies
uv sync
```

## Roadmap
See [ROADMAP.md](ROADMAP.md) for detailed phase-by-phase development plans.
