# Dataset Card: MangoDL Phase 1

## Overview
This dataset collection supports the MangoDL precision agriculture platform for disease detection and yield prediction in Karnataka mango crops.

## 1. MangoLeafBD (Image Data)
**Source**: Kaggle (`aryashah2k/mango-leaf-disease-dataset`)
**Description**: Primary training dataset for disease classification.
**Classes**: 8 (Anthracnose, Bacterial Canker, Cutting Weevil, Die Back, Gall Midge, Healthy, Powdery Mildew, Sooty Mould)
**Size**: 4,000 images (500 per class, perfectly balanced).
**Format**: `.jpg` (varying resolutions, preprocessing required).

## 2. Karnataka Climate Data (Tabular)
**Source**: NASA POWER API
**Description**: Daily weather metrics for Hassan, Kolar, and Ramanagara.
**Date Range**: Jan 1, 2015 – Dec 31, 2024
**Schema**:
- `region`: (string) Hassan, Kolar, Ramanagara
- `date`: (YYYY-MM-DD)
- `tmax`: Maximum temperature at 2m (°C)
- `tmin`: Minimum temperature at 2m (°C)
- `rain`: Total precipitation (mm)
- `humidity`: Relative humidity at 2m (%)

## 3. NHB Yield Data (Tabular - Mocked)
**Source**: Mock generated based on typical NHB yield distributions (t/ha).
**Description**: Yearly yield per hectare for Raspuri and Banganapalli varieties.
**Date Range**: 2015 – 2024
**Schema**:
- `year`: (int)
- `region`: (string)
- `variety`: (string)
- `yield_t_ha`: (float) Yield in tons per hectare.

## Unified Processed Schema (`tabular_schema.csv`)
Aggregates daily climate into yearly metrics and joins with yield data.
**Columns**: `year, region, variety, yield_t_ha, tmax, tmin, rain, humidity`
**Rows**: 60

## Known Limitations
- Yield data is mocked for Phase 1 EDA purposes. Real NHB data should be swapped in when available.
- Climate aggregation is currently yearly means/sums. Phenological staging (e.g., flowering vs fruiting month metrics) should be engineered in Phase 2.
