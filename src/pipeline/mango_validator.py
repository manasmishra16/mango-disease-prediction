"""
Simple, Robust Mango Leaf Domain Validator & Disease Inference Pipeline.

Primary Architecture:
1. Basic Image Integrity Check (decoding, dimensions, basic blur check)
2. Hard Mango Leaf Domain Gate (MangoDomainGate - MobileNetV3-Small Binary Classifier)
   -> If P(Mango Leaf) < 0.70: REJECT IMMEDIATELY (Disease model is NEVER called)
3. Existing PyTorch Disease Model (MangoLeafXNetSE / MultiTask - Unmodified)
   -> If Disease Confidence < 75.0%: REJECT as LOW_DISEASE_CONFIDENCE
4. Return Successful Disease Diagnosis (Prediction, Confidence, Severity, Treatment, Grad-CAM)
"""

import io
import time
import logging
from typing import Dict, Any, Optional, Tuple

import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
import torchvision.transforms as T

from backend import config
from src.models.domain_gate import MangoDomainGate, domain_gate_transform
from src.economics import TREATMENT_COST

logger = logging.getLogger("MangoPipeline")
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] [%(levelname)s] [MangoPipeline] %(message)s")

DISEASE_CLASSES = [
    "Anthracnose",
    "Bacterial Canker",
    "Cutting Weevil",
    "Die Back",
    "Gall Midge",
    "Healthy",
    "Powdery Mildew",
    "Sooty Mould",
]

DISEASE_DESCRIPTIONS = {
    "Anthracnose": "Colletotrichum gloeosporioides fungal infection causing dark brown/black necrotic lesions with yellow halos.",
    "Bacterial Canker": "Xanthomonas citri pv. mangiferaeindicae causing raised, water-soaked leaf lesions with bacterial ooze.",
    "Cutting Weevil": "Deporaus marginatus pest causing irregular leaf cut-outs and premature leaf drop.",
    "Die Back": "Lasiodiplodia theobromae causing twig drying and tip necrosis progressing downwards.",
    "Gall Midge": "Erosomyia indica larvae forming blister-like leaf galls, leaf curling, and tissue necrosis.",
    "Healthy": "Healthy mango foliage with uniform chlorophyll distribution and no pathological lesions.",
    "Powdery Mildew": "Oidium mangiferae fungal coating forming white powdery spore patches on foliage.",
    "Sooty Mould": "Meliola mangiferae superficial black fungal layer covering leaf surfaces.",
}

disease_eval_transform = T.Compose([
    T.Resize((227, 227)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def validate_basic_image(image_pil: Image.Image) -> Tuple[bool, Optional[str]]:
    """Basic image dimension and blur validation."""
    w, h = image_pil.size
    if w < config.MIN_IMAGE_DIMENSION or h < config.MIN_IMAGE_DIMENSION:
        return False, f"Image resolution too small ({w}x{h}). Minimum required is 64x64."

    img_gray = np.array(image_pil.convert("L"))
    lap_var = cv2.Laplacian(img_gray, cv2.CV_64F).var()
    if lap_var < config.IMAGE_BLUR_THRESHOLD:
        return False, f"Image is too blurry (Laplacian variance {lap_var:.1f} < {config.IMAGE_BLUR_THRESHOLD})."

    return True, None


def predict_mango_disease_pipeline(
    image_bytes: bytes,
    disease_model: Any,
    domain_gate_model: Optional[MangoDomainGate],
    gradcam_generator_fn: Optional[Any],
    device: torch.device,
    filename: str = "upload.jpg"
) -> Dict[str, Any]:
    """
    Hard Domain Gate Pipeline:
    NO MANGO GATE PASS = NO DISEASE MODEL CALL.
    """
    t_start = time.time()
    logger.info(f"--- Processing: '{filename}' ---")

    # 1. Decode Image
    try:
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        logger.warning(f"Image decoding failed: {e}")
        return {
            "status": "rejected",
            "is_mango_leaf": False,
            "prediction": None,
            "disease": None,
            "confidence": 0.0,
            "message": "Invalid or corrupted image format. Please upload a clear photo of a mango leaf.",
            "rejection_reason": "INVALID_IMAGE",
            "severity": None,
            "severity_score": 0.0,
            "treatment": None,
            "description": "Please upload a valid JPG, PNG, or WebP photo of a mango leaf.",
            "heatmap_b64": "",
        }

    # 2. Basic Quality Validation
    is_valid, quality_err = validate_basic_image(image_pil)
    if not is_valid:
        logger.info(f"Rejected: {quality_err}")
        return {
            "status": "rejected",
            "is_mango_leaf": False,
            "prediction": None,
            "disease": None,
            "confidence": 0.0,
            "message": quality_err or "Please upload a clear mango leaf image.",
            "rejection_reason": "INVALID_IMAGE_QUALITY",
            "severity": None,
            "severity_score": 0.0,
            "treatment": None,
            "description": quality_err or "Please upload a sharp, focused photo of a mango leaf.",
            "heatmap_b64": "",
        }

    # 3. Hard Mango Leaf Domain Gate
    if domain_gate_model is None:
        # Attempt auto-load if not passed
        gate_path = config.DOMAIN_GATE_MODEL_PATH
        if gate_path.exists():
            try:
                domain_gate_model = MangoDomainGate(pretrained=False).to(device)
                ckpt = torch.load(gate_path, map_location=device, weights_only=False)
                state = ckpt.get("model_state_dict", ckpt)
                domain_gate_model.load_state_dict(state)
                domain_gate_model.eval()
                logger.info(f"Auto-loaded MangoDomainGate from {gate_path}")
            except Exception as e:
                logger.error(f"Failed to auto-load domain gate: {e}")
                domain_gate_model = None

    if domain_gate_model is not None:
        tensor_gate = domain_gate_transform(image_pil).unsqueeze(0).to(device)
        domain_gate_model.eval()
        with torch.no_grad():
            mango_prob = float(domain_gate_model.predict_proba(tensor_gate)[0].item())

        logger.info(f"Domain Gate P(Mango Leaf): {mango_prob*100:.2f}% (Threshold: {config.MANGO_LEAF_THRESHOLD*100:.0f}%)")

        if mango_prob < config.MANGO_LEAF_THRESHOLD:
            logger.info(f"HARD REJECTION: Not a mango leaf (P={mango_prob*100:.1f}%)")
            return {
                "status": "rejected",
                "is_mango_leaf": False,
                "prediction": None,
                "disease": None,
                "confidence": 0.0,
                "message": "Please upload a clear mango leaf image.",
                "rejection_reason": "NOT_MANGO_LEAF",
                "mango_leaf_prob": round(mango_prob, 4),
                "severity": None,
                "severity_score": 0.0,
                "treatment": None,
                "description": "The uploaded image does not appear to be a mango leaf. Please upload a clear photo of a mango leaf for disease diagnosis.",
                "heatmap_b64": "",
            }
    else:
        logger.error("Domain gate model could not be loaded. Refusing inference on unverified image.")
        return {
            "status": "rejected",
            "is_mango_leaf": False,
            "prediction": None,
            "disease": None,
            "confidence": 0.0,
            "message": "Domain validation gate is temporarily unavailable. Please verify model weights.",
            "rejection_reason": "GATE_UNAVAILABLE",
            "mango_leaf_prob": 0.0,
            "severity": None,
            "severity_score": 0.0,
            "treatment": None,
            "description": "Domain validation gate could not verify this leaf. Refusing inference for safety.",
            "heatmap_b64": "",
        }

    # 4. Existing PyTorch Mango Disease Model
    if disease_model is None:
        raise RuntimeError("Disease classification model is not available.")

    tensor_disease = disease_eval_transform(image_pil).unsqueeze(0).to(device)
    disease_model.eval()

    with torch.no_grad():
        out = disease_model(tensor_disease)
        if isinstance(out, tuple):
            cls_logits, sev_out = out
            sev_val = float(sev_out[0].item())
        else:
            cls_logits = out
            sev_val = None

        probs = F.softmax(cls_logits, dim=1)[0]
        pred_idx = int(torch.argmax(probs).item())
        raw_conf = float(probs[pred_idx].item()) * 100.0
        predicted_disease = DISEASE_CLASSES[pred_idx]

    logger.info(f"Disease Model Output: {predicted_disease} ({raw_conf:.1f}%)")

    # 5. Disease Confidence Threshold Check
    if raw_conf < config.DISEASE_CONFIDENCE_THRESHOLD:
        logger.info(f"Rejected: Low Disease Confidence ({raw_conf:.1f}% < {config.DISEASE_CONFIDENCE_THRESHOLD}%)")
        return {
            "status": "rejected",
            "is_mango_leaf": True,
            "prediction": None,
            "disease": None,
            "confidence": 0.0,
            "message": "The mango leaf could not be classified reliably.",
            "rejection_reason": "LOW_DISEASE_CONFIDENCE",
            "mango_leaf_prob": round(mango_prob, 4),
            "severity": None,
            "severity_score": 0.0,
            "treatment": None,
            "description": "The mango leaf could not be classified reliably. Please upload a closer, well-lit photo of the affected leaf section.",
            "heatmap_b64": "",
        }

    # 6. Accepted Disease Result & Pathologist Advisory
    confidence = round(min(raw_conf, 99.8), 1)

    if predicted_disease == "Healthy":
        severity_num = 0.0
        severity_cat = "None"
        lesion_pct = 0.0
    elif sev_val is not None:
        severity_num = min(max(sev_val, 0.8), 2.8)
        severity_cat = "High" if severity_num >= 2.0 else "Medium" if severity_num >= 1.2 else "Low"
        lesion_pct = round(severity_num * 10.0, 1)
    else:
        severity_map = {
            "Anthracnose": (2.4, "High", 24.0),
            "Bacterial Canker": (2.2, "High", 22.0),
            "Die Back": (2.5, "High", 25.0),
            "Cutting Weevil": (1.6, "Medium", 16.0),
            "Gall Midge": (1.5, "Medium", 15.0),
            "Powdery Mildew": (1.8, "Medium", 18.0),
            "Sooty Mould": (1.7, "Medium", 17.0),
        }
        severity_num, severity_cat, lesion_pct = severity_map.get(predicted_disease, (1.8, "Medium", 18.0))

    # Grad-CAM Overlay
    heatmap_b64 = ""
    if gradcam_generator_fn is not None:
        try:
            heatmap_b64, sev_info = gradcam_generator_fn(image_pil, pred_idx, predicted_disease)
            if sev_info:
                severity_cat = sev_info.get("severity_cat", severity_cat)
                severity_num = sev_info.get("severity_score", severity_num)
                lesion_pct = sev_info.get("lesion_pct", lesion_pct)
        except Exception as e:
            logger.warning(f"GradCAM generation notice: {e}")

    treatment_info = TREATMENT_COST.get(predicted_disease, TREATMENT_COST["Healthy"])
    treatment_str = f"Apply {treatment_info.get('chemical', 'treatment')} at {treatment_info.get('dosage', 'dosage')}."

    elapsed = (time.time() - t_start) * 1000.0
    logger.info(f"ACCEPTED: {predicted_disease} ({confidence}%) in {elapsed:.1f}ms")

    return {
        "status": "success",
        "is_mango_leaf": True,
        "prediction": predicted_disease,
        "disease": predicted_disease,
        "confidence": confidence,
        "severity": severity_cat,
        "severity_score": round(severity_num, 2),
        "lesion_pct": lesion_pct,
        "treatment": treatment_str,
        "description": DISEASE_DESCRIPTIONS.get(predicted_disease, ""),
        "rejection_reason": None,
        "mango_leaf_prob": round(mango_prob, 4),
        "heatmap_b64": heatmap_b64,
    }
