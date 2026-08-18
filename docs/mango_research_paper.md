# An Enhanced CNN for Mango Disease Detection and Severity Grading

**Manas, Manish Kumar, Muhammed Hamza**  
*Department of Computer Science and Engineering, KSIT*

***

**ABSTRACT**  
Mango is an economically vital crop in many tropical and subtropical regions; however, its cultivation is frequently hindered by various diseases affecting the foliage and fruit. Timely and precise detection of these diseases is critical for deploying effective management strategies and maintaining optimal agricultural yields. This study presents an enhanced Convolutional Neural Network (CNN) architecture, building upon the baseline MangoLeafXNet by integrating Squeeze-and-Excitation (SE) blocks and a multi-task head. The model is designed to automatically classify eight mango leaf categories—comprising seven disease/pest classes (Anthracnose, Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Powdery Mildew, and Sooty Mould) and a Healthy class—while simultaneously predicting continuous disease severity. Using the unified 14k dataset supplemented with region-specific field images from Karnataka, robust preprocessing and augmentation techniques were applied to ensure domain adaptability. The proposed SE-enhanced model achieved a high validation accuracy of 98.75%. The system also includes an explainability layer utilizing Grad-CAM and LIME to foster trust. This framework provides a practical, automated tool for agricultural practitioners, facilitating early disease intervention, mitigating crop losses, and serving as a foundational input for yield prediction and economic decision support.

**Keywords**—*convolutional neural networks; plant disease detection; mango; deep learning; agricultural image analysis; Squeeze-and-Excitation*

***

## I. INTRODUCTION

Mango is a crucial commercial crop widely cultivated across tropical climates, contributing significantly to the agricultural economies of nations like India. Despite its economic importance, mango productivity is routinely threatened by a spectrum of diseases, leading to substantial financial setbacks for farmers. Early and precise identification of these diseases is imperative to minimize losses and sustain crop quality. 

Traditionally, the identification of plant diseases has relied on manual visual inspection by agricultural experts. This conventional approach is not only labor-intensive and time-consuming but also susceptible to human error and heavily dependent on scarce domain expertise. Several common diseases and pests pose a severe threat to mango cultivation. For instance, Anthracnose causes dark, irregular lesions on leaves and fruit, leading to premature drop. Powdery Mildew manifests as a white, powdery fungal growth that compromises photosynthesis, while pests like the Cutting Weevil and Gall Midge cause severe structural and foliar damage. Other prevalent issues include Bacterial Canker, Die Back, and Sooty Mould, all of which severely stunt plant development.

In recent years, the rapid advancement of artificial intelligence, specifically the evolution of Convolutional Neural Networks (CNNs), has fundamentally transformed plant disease detection. CNNs automate the extraction of critical image features—such as texture, color, and lesion boundaries—by processing inputs through multiple hierarchical layers. The application of CNN-based methodologies for mango disease detection represents a significant leap forward in precision agriculture. While traditional machine learning techniques require extensive manual feature engineering, deep learning excels in learning discriminative features directly from raw agricultural images. This study focuses on developing an enhanced deep learning tool that utilizes an advanced CNN architecture equipped with attention mechanisms (SE-blocks) to detect various mango diseases and grade their severity, ultimately enabling farmers to take proactive measures before infections spread uncontrollably.

## II. METHODOLOGY

The primary objective of this research is to develop a reliable, automated system for the early detection and severity grading of mango diseases using an enhanced CNN. By synergizing deep learning with computer vision, the proposed framework performs accurate analysis of mango leaf images to allow for timely agricultural interventions. 

### A. Data Collection and Annotation

A comprehensive dataset was curated to encompass a wide spectrum of disease symptoms. The primary training corpus utilizes a unified 14k image dataset balanced across eight classes: Anthracnose, Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Powdery Mildew, Sooty Mould, and Healthy. To ensure regional generalization and address domain shift, this base dataset was supplemented with real-time, high-resolution field images collected from mango orchards. This combined dataset ensures the model is exposed to diverse lighting conditions, backgrounds, and specific regional variations of the crop. 

Annotations for disease classification and severity were validated to ensure high reliability. The dataset was stratified into training, validation, and testing subsets, carefully split by disease class to preserve the original distribution.

### B. Data Preprocessing

Data preprocessing is a crucial step to enhance the quality of raw images before they are fed into the CNN. The pipeline utilizes techniques like Contrast Limited Adaptive Histogram Equalization (CLAHE) to improve local image contrast, followed by a Gaussian blur to reduce high-frequency noise. Images are subsequently resized and converted to a uniform 227×227 pixel RGB format to meet the input requirements of the network. Pixel values are then normalized using standard ImageNet mean and standard deviation metrics to accelerate convergence during training. 

To prevent overfitting and improve model robustness against domain shifts, geometric and photometric augmentations were applied. These include random flips, rotations, HSV-shifts, and brightness adjustments using the Albumentations library.

### C. Custom CNN Design

The core of this research is the **Enhanced MangoLeafXNet**, a robust deep learning architecture tailored for this recognition task. The baseline model consists of six convolutional layers that progressively extract hierarchical features. The initial layers capture low-level patterns like edges, while deeper layers isolate complex, disease-specific lesions.

To significantly boost the model's representational power, **Squeeze-and-Excitation (SE) blocks** were integrated after the third and fifth convolutional layers. SE blocks act as a channel attention mechanism, explicitly modeling the interdependencies between channels and adaptively recalibrating channel-wise feature responses. This ensures the network focuses heavily on the most informative features (e.g., the actual disease lesions) while suppressing irrelevant background noise.

Furthermore, a **multi-task head** was implemented (`MangoLeafXNetMultiTask`). While the primary classification head utilizes a Softmax activation to output probabilities across the eight specific disease and pest classes, a parallel regression head predicts the continuous disease severity score (ranging from 0 to 3). The network is optimized using a combined loss function that balances Cross-Entropy Loss (for classification) and Mean Squared Error (for severity regression).

### D. Deployment and Practical Application

Once validated, the CNN is integrated into a unified precision agriculture platform. The end-user system features a React-based web dashboard connected to a FastAPI backend. Farmers can upload images of mango leaves and instantly receive automated disease diagnoses, confidence scores, and severity grades. 

A unique feature of this deployment is the integration of Explainable AI (XAI). The system utilizes **Grad-CAM** (Gradient-weighted Class Activation Mapping) to generate heatmaps overlaid on the uploaded images, visually highlighting the specific lesion areas the CNN focused on to make its prediction. This transparency builds farmer trust in the automated diagnosis. The disease severity output is subsequently fed into a downstream Economic Module to estimate potential yield reduction and provide actionable treatment recommendations based on the diagnosed issue.

## III. RESULTS AND DISCUSSIONS

The proposed multi-task CNN was implemented using the PyTorch framework and optimized over rigorous training epochs. During the training phase, the model demonstrated steady convergence, with training loss consistently decreasing while validation metrics remained stable, indicating effective learning without significant overfitting. 

The inclusion of SE-blocks notably improved the model's ability to distinguish between visually similar fungal infections and pest damages. Based on the evaluation against the unified validation set, the proposed SE-enhanced model achieved an outstanding **validation accuracy of 98.75%**, accompanied by high precision, recall, and F1-scores across all eight categories. 

Ablation studies confirmed that removing the SE-blocks or the multi-task severity head resulted in a measurable drop in classification accuracy, validating the architectural enhancements. Furthermore, qualitative analysis using Grad-CAM saliency maps confirmed that the network was correctly identifying the pathological regions on the leaves rather than relying on background artifacts. This high performance underscores the superiority of the custom-designed, attention-enhanced CNN for practical field conditions.

## IV. CONCLUSION

The enhanced CNN-based disease detection model achieves high accuracy and reliability in identifying and grading diseases and pest damage in mango leaves. By integrating an attention mechanism (SE-blocks) and a multi-task learning approach, the model effectively distinguishes healthy from infected tissue and accurately estimates disease severity with a validated accuracy of 98.75%. The addition of Grad-CAM explainability bridges the gap between complex deep learning models and practical agricultural utility. This system offers significant, actionable benefits to mango farmers and plantation managers, reducing the reliance on manual inspection, facilitating timely targeted treatments, and laying the groundwork for integrated yield forecasting and economic optimization.
