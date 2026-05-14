# MangoDL — Deep Learning Approach for Mango Yield and Disease Prediction Using Climate Data

**Project**: BCS685 Phase I/II — KSIT, Dept. of CSE, Batch 2026_CSE_34  
**Team**: Manas (1KS23CS078), Manish Kumar (1KS23CS081), Muhammed Hamza (1KS23CS088)  
**Guide**: Prof. Mrs. Beena K., Assistant Professor

---

## What You're Building

Unified precision agriculture platform with 3 ML modules:

1. **Disease Detection** — Enhanced MangoLeafXNet CNN (SE-blocks + multi-task head) → classify mango leaf diseases (Anthracnose, Powdery Mildew, Sooty Mould, etc.) + Grad-CAM / LIME explainability
2. **Yield Prediction** — XGBoost + LSTM on vegetation indices + weather vars (based on Torgbor et al., Remote Sensing 2023) → tons/hectare forecast for Karnataka varieties (Raspuri, Banganapalli)
3. **Economic Module** — rule/model-based profit estimation → market price × predicted yield × disease-adjusted loss rate → sell-to-market vs pulp-factory decision

**Output**: React web dashboard — farmer uploads leaf image → disease + severity + yield forecast + revenue estimate + actionable advice (irrigation, fertilizer, treatment)

---

## Novel Contributions Over Base Papers

Base MangoLeafXNet: 6-layer CNN, trained on MangoLeafBD (Bangladesh), no climate fusion.  
Base RS paper (Torgbor et al.): tabular ML only, no image fusion, no disease coupling.

**Your novel contributions (what makes this a research paper):**

- **Multi-modal fusion** — image features (CNN) + climate tabular features; neither base paper does this
- **Karnataka-specific fine-tuning** — Raspuri/Banganapalli varieties vs Bangladesh orchards; domain shift addressed
- **Disease-to-yield coupling** — disease severity score from CNN fed as input feature into yield regressor (neither base paper links these two tasks)
- **Severity grading** — not just classify disease but estimate % infection area → quantify yield reduction %
- **Revenue optimization layer** — economic decision model on top (no base paper has this)
- **Explainability on yield** — SHAP for yield model (RS paper has zero XAI), Grad-CAM for disease

---

## Tech Stack

| Layer | Tool |
|---|---|
| DL framework | PyTorch 2.x |
| CNN base | MangoLeafXNet → SE-block enhanced |
| Augmentation | Albumentations |
| Yield ML | XGBoost + LSTM (PyTorch) |
| XAI | torchcam (Grad-CAM), SHAP, LIME |
| Backend API | FastAPI |
| Frontend | React + Tailwind + Recharts |
| ML backend hosting | Render (free tier) |
| Frontend hosting | Vercel (free) |
| Model weights | HuggingFace Hub |
| Experiment tracking | W&B free tier |
| Climate data | NASA POWER API |
| Satellite VI data | Google Earth Engine (Landsat 7/8) |
| Image datasets | MangoLeafBD + MangoPest + MLDID |
| Augmentation (domain) | Albumentations heavy pipeline + CycleGAN (optional) |

**Why PyTorch over TensorFlow**: better research ecosystem, cleaner model surgery for SE-blocks + multi-task heads, torchcam for Grad-CAM, native SHAP integration. RTX 5080 → CUDA 12.x → PyTorch 2.x fully supported.

---

## Datasets

### Disease Detection (Image)

| Dataset | Classes | Images | Notes |
|---|---|---|---|
| **MangoLeafBD** (primary) | 8 (7 disease + healthy) | 4000 | Base paper dataset; well-balanced, 500/class |
| **MangoPest** | 16 pest classes | varies | Cross-validation set |
| **MLDID** | 5 classes | 3000 | High-res; cross-validation |
| **PlantVillage** | multi-crop | 54K+ | General; less mango-specific |
| **Karnataka scraped** | field-matched | ~200–500 | Web-scraped (iNaturalist, Agro-forums); fine-tune set |

**Strategy**: MangoLeafBD as primary training set. Heavy augmentation for Karnataka domain. Validate on MangoPest + MLDID for generalization proof.

### Yield Prediction (Tabular / Climate)

| Source | Data Type | Notes |
|---|---|---|
| **NASA POWER API** | Daily Tmin/Tmax/rain/humidity/ET | Free, Karnataka-specific coords |
| **Google Earth Engine** | Landsat NDVI/EVI/GNDVI/LSWI | Free; Hassan, Kolar, Ramanagara |
| **NHB / data.gov.in** | Karnataka mango yield (t/ha) | Ground truth yield records |
| **APMC / eNAM** | Mango market prices | Revenue module |

**Key Karnataka mango belt coordinates**: Hassan (12.57°N, 76.10°E), Kolar (13.13°N, 78.13°E), Ramanagara (12.72°N, 77.28°E)

### Augmentation Strategy

- Geometric: flip, rotate, zoom, shear, random crop
- Color: brightness, saturation, HSV-shift (Karnataka light conditions differ from Bangladesh)
- CLAHE + Gaussian blur (from base paper, retained)
- Mixup / CutMix for regularization
- CycleGAN domain adaptation: Bangladesh → Karnataka style transfer (optional but recommended; ~1 week GPU work on RTX 5080)

---

## Phase Roadmap

---

### Phase 0 — Foundation ✅ COMPLETE

- Literature survey complete
- Base papers analyzed (MangoLeafXNet IEEE Access 2025, Torgbor et al. Remote Sensing 2023)
- Problem statement, scope, goals defined
- Review 0 + Phase I Review 1 presentations submitted
- Novel contributions identified

**Remaining action**: write contributions list formally → becomes paper's "Contributions" section.

---

### Phase 1 — Data Collection & EDA

**Goal**: build unified dataset, understand distributions before touching models.

**Tasks**:
- Download MangoLeafBD, MangoPest, MLDID from Kaggle/GitHub
- Web-scrape Karnataka mango leaf images (iNaturalist, Google Images, agriculture forums) — tag manually
- Pull Karnataka climate via NASA POWER API (daily Tmin/Tmax/rainfall/humidity, 2015–2024, Hassan + Kolar + Ramanagara)
- Pull Landsat NDVI/EVI/GNDVI/LSWI time series via Google Earth Engine for same coords
- Yield ground truth: NHB area+production tables → convert to t/ha by variety
- EDA: class imbalance check, climate-yield Pearson correlations, missing data audit, seasonal trend plots
- Build unified schema CSV:

```
{image_id, disease_label, severity_grade, date, lat, lon,
 tmin, tmax, rain, humidity, ndvi, evi, gndvi, lswi,
 yield_t_ha, variety}
```

**Deliverables**: `data/` directory, `01_eda.ipynb`, dataset card doc  
**Duration**: ~2 weeks

---

### Phase 2 — Preprocessing & Augmentation Pipeline

**Goal**: bulletproof, reproducible data pipeline. No leakage.

**Tasks**:
- Image pipeline: CLAHE → Gaussian blur → resize 227×227 → normalize (ImageNet mean/std) → Albumentations (flip, rotate, HSV-shift, brightness, coarse dropout, elastic transform)
- CycleGAN domain adaptation (optional): train Bangladesh→Karnataka style transfer on Karnataka scraped images
- Tabular pipeline: rolling 30-day features (mean rain, temp delta, cumulative ET), VPD calculation, StandardScaler, KNN impute missing
- Stratified splits: 80/10/10 by disease class AND season (prevents future-leak in yield time series)
- `MangoLeafDataset(torch.utils.data.Dataset)` + `ClimateDataset` PyTorch classes
- `DataLoader` with reproducible seed

**Deliverables**: `src/dataset.py`, `src/augment.py`, `02_preprocessing.ipynb`, pipeline diagram  
**Duration**: ~1.5 weeks

---

### Phase 3 — Disease Detection Module

**Goal**: build enhanced CNN, beat MangoLeafXNet baseline, generate XAI.

#### Step 3a — Baseline Replication
- Implement vanilla MangoLeafXNet (6 conv layers, ReLU, MaxPool, Dropout, FC) in PyTorch
- Train on MangoLeafBD, 80/10/10 split
- Target: ≥99% accuracy on same split (confirms correct replication)

#### Step 3b — Your Enhancements
- Insert Squeeze-and-Excitation (SE) blocks after conv layers 3 and 5 (squeeze ratio 16)
- Add severity regression head alongside classification head → **multi-task model**
- Multi-task loss: `L = λ·CrossEntropy + (1−λ)·MSE_severity`
- Severity labels: semi-automated via OpenCV lesion area thresholding OR ordinal grades (0–3) on subset
- Fine-tune last 2 blocks on Karnataka scraped images (domain adaptation)

#### Step 3c — Competitor Baselines
- EfficientNetB3 (ImageNet pretrained, fine-tuned on MangoLeafBD)
- VGG16 (fine-tuned)
- Full comparison table

#### Step 3d — XAI
- Grad-CAM via `torchcam` on test set
- LIME on 20 representative samples per class
- Saliency maps
- Qualitative analysis: does heatmap land on actual lesion region?

**Metrics**: accuracy, precision, recall, F1, AUC-ROC per class, confusion matrix. Severity head: MAE + R²

**Deliverables**: `src/models/disease_cnn.py`, `03_disease_training.ipynb`, `03_xai.ipynb`, model weights on HF Hub  
**Duration**: ~3 weeks (1 week baseline, 2 weeks enhancements + XAI)

---

### Phase 4 — Yield Prediction Module

**Goal**: beat RS2023 RF baseline, add disease coupling as novel feature.

#### Step 4a — Baseline Replication
- RF + XGBoost on EVI/GNDVI/NDVI/LSWI + Prec/Tmin (match RS2023 feature set)
- Target: MAE ≤ 2.9 t/ha (RS2023 best result) on test set

#### Step 4b — Your Enhancements
- Add `disease_severity_score` (from Phase 3 model output) as input feature → **key novelty**
- Add `variety` one-hot (Raspuri, Banganapalli, Totapuri)
- Add 30-day temporal rolling features (mean rain, cumulative ET, temp variance)
- LSTM model: 30-day climate sequence → yield scalar → compare MAE vs XGBoost
- Ensemble: XGBoost + LSTM weighted blend (Optuna-tuned weights)
- Optuna hyperparameter search (100 trials each model)

**XAI**: SHAP waterfall + beeswarm plots → feature importance ranking

**Metrics**: MAE (t/ha), NMAE%, RMSE, R²

**Deliverables**: `src/models/yield_model.py`, `04_yield_training.ipynb`, `04_shap.ipynb`, model weights  
**Duration**: ~2.5 weeks

---

### Phase 5 — Economic Module

**Goal**: translate predictions into actionable farmer decisions.

**Tasks**:
- Disease loss lookup table (from literature):

| Disease | Severity Low | Severity High |
|---|---|---|
| Anthracnose | 10% | 30% |
| Powdery Mildew | 5% | 15% |
| Sooty Mould | 5% | 20% |
| Gall Midge | 15% | 35% |

- Revenue formula:
```
net_revenue = (yield_predicted × (1 − loss_factor(disease, severity))) × price_per_ton − input_cost
```
- Market price: static APMC Karnataka table (Banganapalli ~₹25–40/kg) + seasonal multiplier
- Decision logic: if `quality_grade ≥ B AND revenue_market > revenue_pulp` → recommend local market; else → pulp factory
- Input cost model: fixed cost (₹/hectare) + pesticide cost keyed to disease + severity
- Treatment recommendation rules: disease type → fungicide/pesticide + dosage suggestion

**Deliverables**: `src/economics.py`, `05_economics.ipynb`, decision logic doc  
**Duration**: ~1 week

---

### Phase 6 — Integration & Deployment

**Goal**: working hosted app, evaluator-ready.

#### Backend (FastAPI)

Endpoints:
- `POST /predict/disease` — image upload → `{disease, confidence, severity_pct, grad_cam_b64, treatment_advice}`
- `POST /predict/yield` — climate JSON → `{yield_t_ha, confidence_interval, shap_values}`
- `POST /predict/revenue` — yield + disease → `{net_revenue, market_recommendation, profit_breakdown}`

Infrastructure:
- Load model weights from HuggingFace Hub on startup
- Deploy on **Render free tier**
- Add uptime ping (cron job) to prevent sleep during demo

#### Frontend (React + Tailwind + Recharts)

- **Page 1 — Disease Detection**: leaf image upload → disease card (name, confidence badge, severity %) + Grad-CAM heatmap overlay on uploaded image
- **Page 2 — Yield Forecast**: climate input form (date, location dropdown → auto-fetch NASA POWER) → yield gauge chart + SHAP horizontal bar chart
- **Page 3 — Revenue Dashboard**: profit estimate card, sell recommendation (market vs pulp), treatment plan, input cost breakdown
- Alert banner: high-severity disease = red warning with urgency message
- Deploy on **Vercel** (free, instant CDN)

#### Model Hosting
- Push `.pt` weights to HuggingFace Hub repo
- Avoids Render 500MB slug size limit

**Deliverables**: `backend/`, `frontend/`, live Render URL, live Vercel URL, 3-min demo video  
**Duration**: ~2 weeks

---

### Phase 7 — Ablation, Paper Writing & Final Review

**Goal**: academic deliverables for Phase 2 submission.

#### Ablation Study

| Variant | What's removed | Expected metric drop |
|---|---|---|
| No SE blocks | Channel attention | Accuracy ↓ ~1–2% |
| No multi-task head | Severity regression | Severity MAE → undefined |
| No disease-yield coupling | `severity_score` feature | Yield MAE ↑ |
| No Karnataka fine-tuning | Domain adaptation | F1 on Karnataka images ↓ |
| No LSTM | Temporal sequences | Yield R² ↓ |
| No ensemble | XGBoost only | MAE slightly ↑ |

#### Paper

- Format: IEEE double-column, ~8 pages
- Sections: Abstract → Introduction → Related Work → Methodology → Experiments → Results → Discussion → Conclusion
- Cite both base papers prominently (MangoLeafXNet IEEE Access 2025, Torgbor et al. RS 2023)
- Submit targets: ICCCNT / AgriVision Workshop (CVPR) / ICCV Agriculture track

#### Final Deliverables
- Paper draft (PDF)
- Phase 2 Review presentation
- Full ablation table
- GitHub repo (public, clean, README with live demo links)

**Duration**: ~2 weeks

---

## Timeline Summary

| Phase | What | Duration | Parallel? |
|---|---|---|---|
| 0 | Foundation | ✅ Done | — |
| 1 | Data collection + EDA | 2 weeks | — |
| 2 | Preprocessing pipeline | 1.5 weeks | — |
| 3 | Disease CNN + XAI | 3 weeks | Phase 4 (after Phase 2) |
| 4 | Yield model + SHAP | 2.5 weeks | Phase 3 (after Phase 2) |
| 5 | Economic module | 1 week | Overlaps Phase 4 end |
| 6 | Integration + deploy | 2 weeks | Overlaps Phase 7 start |
| 7 | Ablation + paper + review | 2 weeks | — |
| **Total** | | **~14 weeks** | |

> Phases 3 + 4 run in parallel after Phase 2 completes (split between team members). Phases 5 + 6 can overlap Phase 7 writing.

---

## Open Decision

**CycleGAN domain adaptation** (Phase 2) adds ~1 week of GPU work on RTX 5080 and is the hardest preprocessing step. It's optional but strongly recommended since Karnataka scraped images will be small in number (<500) and domain shift from Bangladesh orchards is real (lighting, leaf angle, background).

**Alternative**: skip CycleGAN, use heavy Albumentations color-jitter + RandomShadow + RandomFog as substitute. Still academically defensible — cite augmentation strategy clearly. Saves 1 week.

---

*Document generated: May 2026*