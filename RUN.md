# Phase 6: Integration Walkthrough (Local)

## What Was Built

### 1. Backend (FastAPI)
- `backend/main.py`
- Exposes 3 main routes:
  - `POST /predict/disease`: Accepts an image upload. Runs the Phase 3 MultiTask model. Returns predicted disease, severity score, and a Grad-CAM heatmap. Includes a wrapper fix for `SmoothGradCAMpp` to handle multi-output models.
  - `POST /predict/yield`: Accepts JSON climate features + disease severity. Scales features using standard scaler fit on monthly data and returns XGBoost predicted yield (t/ha) along with feature SHAP values.
  - `POST /predict/revenue`: Takes the output from the first two models, runs the Phase 5 economics rules, and returns a sales recommendation + treatment costs.
- Integrates `CORSMiddleware` to accept cross-origin requests from the frontend.

### 2. Frontend (React + Vite + Tailwind v3)
- `frontend/src/App.jsx`
- Scaffolding complete with Lucide icons and Axios for API requests.
- Contains 3 main tabs representing the pipeline:
  - **Disease Tab**: Drag-and-drop file upload. Shows the image overlayed with Grad-CAM and severity score.
  - **Yield Tab**: Input form for climate metrics. Pulls severity context from the previous tab and displays a large yield forecast with SHAP value breakdown.
  - **Revenue Tab**: Calculates the final net profit vs pulp profit and issues clear decisions (e.g., Grade C/D alert banners).

## What Was Left Out (Per User Request)
- Deployment to Render (Backend) and Vercel (Frontend) has been postponed. 
- However, the codebase is fully optimized for it:
  - The frontend relies on a single configurable `API_BASE` variable.
  - The backend loads model weights conditionally and is `uvicorn` ready.

## How to Run Locally
Open two separate terminal windows:

**Terminal 1 (Backend):**
```bash
PYTHONPATH=. uv run uvicorn backend.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Then navigate to `http://localhost:5173`.
