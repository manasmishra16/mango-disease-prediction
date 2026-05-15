import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

REGIONS = ['Hassan', 'Kolar', 'Ramanagara']
VARIETIES = ['Raspuri', 'Banganapalli']
YEARS = list(range(2015, 2025))

def generate_mock_yield():
    records = []
    
    # Base yields per variety
    base_yield = {
        'Raspuri': 6.5, # t/ha
        'Banganapalli': 8.0
    }
    
    for year in YEARS:
        # Yearly climate factor (random fluctuation)
        climate_factor = np.random.normal(1.0, 0.15)
        
        for region in REGIONS:
            # Regional factor
            regional_factor = np.random.normal(1.0, 0.05)
            
            for variety in VARIETIES:
                yield_val = base_yield[variety] * climate_factor * regional_factor
                # Add some random noise
                yield_val += np.random.normal(0, 0.5)
                
                # Ensure no negative yield
                yield_val = max(0.5, yield_val)
                
                records.append({
                    'year': year,
                    'region': region,
                    'variety': variety,
                    'yield_t_ha': round(yield_val, 2)
                })
                
    df = pd.DataFrame(records)
    
    output_dir = Path('data/raw')
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / 'nhb_yield_mock_2015_2024.csv'
    
    df.to_csv(output_path, index=False)
    print(f"Saved mock yield data to {output_path} (Shape: {df.shape})")

if __name__ == '__main__':
    generate_mock_yield()
