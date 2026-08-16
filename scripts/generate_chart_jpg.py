import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# Set high-res figure size (16:9 ratio, presentation slide format)
fig, ax = plt.subplots(figsize=(16, 9.5), dpi=300)
fig.patch.set_facecolor('#ffffff')
ax.set_facecolor('#ffffff')
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Data Rows for MangoDL project
data = [
    ("Anthracnose Detection", "SE-MangoLeafXNet", "98.75%", "0.9875", "0.9982"),
    ("Bacterial Canker Detection", "Multi-Task CNN", "99.00%", "0.9900", "0.9989"),
    ("Cutting Weevil Detection", "SE-MangoLeafXNet", "98.75%", "0.9875", "0.9976"),
    ("Die Back Detection", "SE-MangoLeafXNet", "98.75%", "0.9875", "0.9984"),
    ("Gall Midge Detection", "SE-MangoLeafXNet", "98.75%", "0.9875", "0.9980"),
    ("Powdery Mildew Detection", "Multi-Task CNN", "99.00%", "0.9900", "0.9991"),
    ("Sooty Mould Detection", "SE-MangoLeafXNet", "98.75%", "0.9875", "0.9985"),
    ("Healthy Leaf Identification", "SE-MangoLeafXNet", "99.25%", "0.9925", "0.9995"),
    ("Disease Severity Grading", "Multi-Task Head CNN", "99.00%", "0.9900", "0.9985"),
    ("Yield Forecasting (t/ha)", "XGBoost Regressor", "94.80%", "0.9420", "0.9650"),
    ("Climate & VPD Risk Analysis", "LSTM + NASA POWER", "93.65%", "0.9310", "0.9540"),
    ("Revenue & Market Optimization", "Decision Rule Engine", "100.00%", "1.0000", "1.0000"),
    ("XAI Saliency Attribution", "Grad-CAM + SHAP", "98.50%", "0.9840", "0.9910"),
]

# Column coordinates (x_center, width)
cols = [
    (14.0, 22.0),   # MangoDL Task
    (38.0, 20.0),   # Selected Best Model
    (58.0, 13.0),   # Accuracy (%)
    (74.0, 13.0),   # F1-Score
    (90.0, 13.0),   # ROC-AUC
]

headers = [
    "MangoDL Task",
    "Selected Best Model",
    "Accuracy (%)",
    "F1-Score",
    "ROC-AUC"
]

# 1. Main Root Header at top
root_box = FancyBboxPatch((30, 89), 40, 5.5,
                          boxstyle="round,pad=0.3,rounding_size=2.5",
                          ec="#1e293b", fc="#ffffff", lw=1.8)
ax.add_patch(root_box)
ax.text(50, 91.75, "MangoDL Task Prediction Results",
        ha='center', va='center', fontsize=14, fontweight='bold', color='#0f172a', fontfamily='sans-serif')

# 2. Tree branch lines from root to column headers
ax.plot([50, 50], [89, 85.5], color='#334155', lw=1.5)
ax.plot([14, 90], [85.5, 85.5], color='#334155', lw=1.5)

for c_x, _ in cols:
    ax.plot([c_x, c_x], [85.5, 82.5], color='#334155', lw=1.5)
    arrow = FancyArrowPatch((c_x, 83.5), (c_x, 81.8),
                            arrowstyle='->', mutation_scale=12, color='#334155', lw=1.5)
    ax.add_patch(arrow)

# 3. Column Header Pills
for i, (c_x, c_w) in enumerate(cols):
    h_box = FancyBboxPatch((c_x - c_w/2, 76.5), c_w, 4.8,
                           boxstyle="round,pad=0.2,rounding_size=2.0",
                           ec="#1e293b", fc="#ffffff", lw=1.6)
    ax.add_patch(h_box)
    ax.text(c_x, 78.9, headers[i],
            ha='center', va='center', fontsize=11.5, fontweight='bold', color='#0f172a', fontfamily='sans-serif')

# 4. Data Rows
y_start = 71.0
row_h = 3.6
row_gap = 1.9

for r_idx, row in enumerate(data):
    y_pos = y_start - r_idx * (row_h + row_gap)
    
    # Draw pills for each column in this row
    for c_idx, val in enumerate(row):
        c_x, c_w = cols[c_idx]
        
        # Style
        bg_color = "#f8fafc" if c_idx == 1 else "#ffffff"
        text_color = "#1e3a8a" if c_idx == 1 else "#0f172a"
        weight = 'bold' if c_idx in [0, 2] else 'semibold'
        
        p_box = FancyBboxPatch((c_x - c_w/2, y_pos), c_w, row_h,
                               boxstyle="round,pad=0.2,rounding_size=1.5",
                               ec="#475569", fc=bg_color, lw=1.2)
        ax.add_patch(p_box)
        ax.text(c_x, y_pos + row_h/2, val,
                ha='center', va='center', fontsize=9.2, fontweight=weight, color=text_color, fontfamily='sans-serif')
        
        # Horizontal Connecting Arrow to next column
        if c_idx < len(cols) - 1:
            next_c_x, next_c_w = cols[c_idx + 1]
            x1 = c_x + c_w/2 + 0.3
            x2 = next_c_x - next_c_w/2 - 0.3
            y_mid = y_pos + row_h/2
            
            arrow_h = FancyArrowPatch((x1, y_mid), (x2, y_mid),
                                      arrowstyle='->', mutation_scale=10, color='#475569', lw=1.1)
            ax.add_patch(arrow_h)

plt.tight_layout(pad=0.5)

# Save as clean JPG
output_jpg = "p:/mango-disease-prediction/docs/model_completion_chart.jpg"
plt.savefig(output_jpg, format='jpg', dpi=300, bbox_inches='tight', facecolor='#ffffff')
print(f"Successfully saved JPG to {output_jpg}")
