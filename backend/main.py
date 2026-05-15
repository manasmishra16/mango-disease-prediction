import base64
from io import BytesIO
import json
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import pandas as pd
import torch
import cv2
from PIL import Image
import xgboost as xgb
from sklearn.preprocessing import StandardScaler
from torchcam.methods import SmoothGradCAMpp
from torchcam.utils import overlay_mask
from torchvision.transforms.functional import to_pil_image

from src.models.disease_cnn import MangoLeafXNetMultiTask
from src.dataset import MangoLeafDataset
from src.augment import get_transforms
from src.models.yield_model import build_yield_dataset_monthly, prepare_Xy
from src.economics import generate_report, EconomicReport

def isolate_leaf(img_bgr):
    """
    Removes background using HSV thresholding and OpenCV GrabCut.
    Ensures model focuses only on the leaf, mitigating domain shift from background noise.
    """
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    lower_green = np.array([20, 20, 20])
    upper_green = np.array([100, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return img_bgr 
        
    largest_contour = max(contours, key=cv2.contourArea)
    clean_mask = np.zeros_like(mask)
    cv2.drawContours(clean_mask, [largest_contour], -1, 255, thickness=cv2.FILLED)
    
    x, y, w, h = cv2.boundingRect(largest_contour)
    pad = 10
    x = max(0, x - pad)
    y = max(0, y - pad)
    w = min(img_bgr.shape[1] - x, w + 2*pad)
    h = min(img_bgr.shape[0] - y, h + 2*pad)
    rect = (x, y, w, h)
    
    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)
    
    gc_mask = np.zeros(img_bgr.shape[:2], np.uint8)
    gc_mask[:] = cv2.GC_BGD
    gc_mask[y:y+h, x:x+w] = cv2.GC_PR_FGD
    gc_mask[clean_mask == 255] = cv2.GC_FGD
    
    try:
        cv2.grabCut(img_bgr, gc_mask, rect, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_MASK)
        final_mask = np.where((gc_mask == 2) | (gc_mask == 0), 0, 1).astype('uint8')
        return img_bgr * final_mask[:, :, np.newaxis]
    except Exception:
        return img_bgr

app = FastAPI(title="Mango DL API", description="Phase 6 API for Disease, Yield, and Economics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Global State & Startup
# ──────────────────────────────────────────────
model_disease = None
model_yield = None
scaler = None
feature_cols = None
classes = [
    'Anthracnose', 'Bacterial Canker', 'Cutting Weevil', 'Die Back',
    'Gall Midge', 'Healthy', 'Powdery Mildew', 'Sooty Mould'
]

@app.on_event("startup")
def load_models():
    global model_disease, model_yield, scaler, feature_cols
    
    print("Loading Disease CNN...")
    device = torch.device('cpu')
    model_disease = MangoLeafXNetMultiTask(num_classes=8)
    ckpt_path = Path("models/multitask_best.pt")
    if ckpt_path.exists():
        ckpt = torch.load(ckpt_path, map_location=device, weights_only=False)
        model_disease.load_state_dict(ckpt['model_state_dict'])
    model_disease.eval()
    
    print("Loading XGBoost & Scaler...")
    model_yield = xgb.XGBRegressor()
    xgb_path = Path("models/xgb_yield_best.json")
    if xgb_path.exists():
        model_yield.load_model(str(xgb_path))
        
    # Recreate scaler
    df = build_yield_dataset_monthly('data/raw/climate_daily_2015_2024.csv', 'data/raw/nhb_yield_mock_2015_2024.csv')
    X, _, cols = prepare_Xy(df)
    feature_cols = cols
    scaler = StandardScaler()
    scaler.fit(X)
    print("Models loaded successfully.")


# ──────────────────────────────────────────────
# Schemas
# ──────────────────────────────────────────────
class YieldRequest(BaseModel):
    month: int = 5
    rain_mean: float = 2.0
    rain_cumul: float = 60.0
    rain_max: float = 15.0
    rain_days: int = 5
    tmax_mean: float = 35.0
    tmax_max: float = 40.0
    tmin_mean: float = 25.0
    tmin_min: float = 20.0
    temp_delta_mean: float = 10.0
    temp_var: float = 4.0
    humidity_mean: float = 60.0
    humidity_min: float = 40.0
    vpd_mean: float = 1.5
    vpd_max: float = 2.5
    disease_severity: float = 1.0
    variety: str = "Banganapalli"  # Banganapalli, Raspuri, or Totapuri

class YieldResponse(BaseModel):
    yield_t_ha: float
    shap_values: dict

class RevenueRequest(BaseModel):
    disease: str
    severity: float
    yield_predicted: float
    variety: str = 'Banganapalli'
    season: str = 'peak'
    hectares: float = 1.0


# ──────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────

@app.post("/predict/disease")
async def predict_disease(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Isolate leaf (Remove background to fix internet image domain gap)
    img_cv_clean = isolate_leaf(img_cv)
    img_rgb = cv2.cvtColor(img_cv_clean, cv2.COLOR_BGR2RGB)
    
    # Preprocess
    transform = get_transforms(train=False)
    tensor = transform(image=img_rgb)['image'].unsqueeze(0)
    
    # Predict
    with torch.no_grad():
        cls_out, sev_out = model_disease(tensor)
        probs = torch.softmax(cls_out, dim=1)[0]
        conf, pred_idx = torch.max(probs, dim=0)
        
        disease_name = classes[pred_idx.item()]
        confidence = conf.item()
        severity = sev_out.item()
        
    class CamWrapper(torch.nn.Module):
        def __init__(self, model):
            super().__init__()
            self.model = model
        def forward(self, x):
            cls, _ = self.model(x)
            return cls

    wrapper = CamWrapper(model_disease)
    cam_extractor = SmoothGradCAMpp(wrapper, target_layer=model_disease.block6)
    cls_out = wrapper(tensor)
    activation_map = cam_extractor(cls_out[0].argmax().item(), cls_out)
    
    pil_img = Image.fromarray(img_rgb)
    result_img = overlay_mask(pil_img, to_pil_image(activation_map[0].squeeze(0), mode='F'), alpha=0.5)
    cam_extractor.clear_hooks()
    
    # Encode base64
    buffered = BytesIO()
    result_img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "disease": disease_name,
        "confidence": confidence,
        "severity": min(max(severity, 0.0), 3.0),
        "heatmap_b64": img_str
    }


@app.post("/predict/yield", response_model=YieldResponse)
def predict_yield(req: YieldRequest):
    # Construct feature vector exactly as feature_cols
    req_dict = req.dict()
    
    # Handle variety one-hot
    req_dict['var_Banganapalli'] = 1 if req.variety == 'Banganapalli' else 0
    req_dict['var_Raspuri'] = 1 if req.variety == 'Raspuri' else 0
    
    # Extract in order
    features = [req_dict.get(c, 0.0) for c in feature_cols]
    
    # Scale and Predict
    X_arr = np.array([features], dtype=np.float32)
    X_scaled = scaler.transform(X_arr)
    
    pred_yield = model_yield.predict(X_scaled)[0]
    
    # Quick SHAP approx for response (use simple weight-based or TreeExplainer)
    # Note: TreeExplainer on one instance can be fast
    import shap
    explainer = shap.TreeExplainer(model_yield)
    shap_vals = explainer.shap_values(X_scaled)[0]
    
    shap_dict = {col: float(val) for col, val in zip(feature_cols, shap_vals)}
    
    return {
        "yield_t_ha": float(pred_yield),
        "shap_values": shap_dict
    }


@app.post("/predict/revenue")
def predict_revenue(req: RevenueRequest):
    report = generate_report(
        disease=req.disease,
        severity=req.severity,
        yield_predicted=req.yield_predicted,
        variety=req.variety,
        season=req.season,
        hectares=req.hectares
    )
    
    return {
        "disease": report.disease,
        "quality_grade": report.quality_grade,
        "yield_after_loss": report.yield_after_loss,
        "revenue_market": report.revenue_market,
        "revenue_pulp": report.revenue_pulp,
        "total_cost": report.total_cost,
        "net_revenue_market": report.net_revenue_market,
        "net_revenue_pulp": report.net_revenue_pulp,
        "recommendation": report.recommendation,
        "treatment": report.treatment
    }
