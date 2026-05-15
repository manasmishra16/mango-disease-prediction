import pandas as pd
from pathlib import Path

def merge_data():
    raw_dir = Path('data/raw')
    processed_dir = Path('data/processed')
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    climate_path = raw_dir / 'climate_daily_2015_2024.csv'
    yield_path = raw_dir / 'nhb_yield_mock_2015_2024.csv'
    
    print("Loading raw data...")
    climate_df = pd.read_csv(climate_path, parse_dates=['date'])
    yield_df = pd.read_csv(yield_path)
    
    print("Aggregating climate data to yearly resolution...")
    # Extract year
    climate_df['year'] = climate_df['date'].dt.year
    
    # Aggregate by year and region
    # For rainfall, sum is appropriate. For temps/humidity, mean is better.
    # In practice, phenological stages (flowering, fruiting) matter more, but we use yearly means for initial EDA.
    yearly_climate = climate_df.groupby(['region', 'year']).agg({
        'tmax': 'mean',
        'tmin': 'mean',
        'rain': 'sum',
        'humidity': 'mean'
    }).reset_index()
    
    print("Merging climate and yield data...")
    # Merge
    merged_df = pd.merge(yield_df, yearly_climate, on=['region', 'year'], how='left')
    
    # Ensure correct schema from ROADMAP
    # {date, lat, lon, tmin, tmax, rain, humidity, yield_t_ha, variety}
    # Note: image_id, disease_label, severity_grade are for the image dataset schema. We'll separate tabular yield from image tabular for now, or just have empty columns.
    # The ROADMAP implies a single unified schema, but images are per-leaf, yield is per-region-year.
    # Let's just output the tabular yield schema cleanly.
    
    output_path = processed_dir / 'tabular_schema.csv'
    merged_df.to_csv(output_path, index=False)
    
    print(f"Saved merged schema to {output_path} (Shape: {merged_df.shape})")
    print("\nSample Data:")
    print(merged_df.head())

if __name__ == '__main__':
    merge_data()
