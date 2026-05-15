import requests
import pandas as pd
from pathlib import Path
import time

# Coords for Karnataka mango belt
LOCATIONS = {
    'Hassan': {'lat': 12.57, 'lon': 76.10},
    'Kolar': {'lat': 13.13, 'lon': 78.13},
    'Ramanagara': {'lat': 12.72, 'lon': 77.28}
}

START_DATE = '20150101'
END_DATE = '20241231'
PARAMETERS = 'T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M' # Tmax, Tmin, Rain, Humidity
BASE_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"

def fetch_climate_data(region_name, lat, lon):
    print(f"Fetching NASA POWER data for {region_name}...")
    params = {
        'parameters': PARAMETERS,
        'community': 'AG',
        'longitude': lon,
        'latitude': lat,
        'start': START_DATE,
        'end': END_DATE,
        'format': 'JSON'
    }
    
    response = requests.get(BASE_URL, params=params)
    response.raise_for_status()
    data = response.json()
    
    # Extract timeseries
    df = pd.DataFrame(data['properties']['parameter'])
    df.index = pd.to_datetime(df.index, format='%Y%m%d')
    df.index.name = 'date'
    df = df.reset_index()
    df['region'] = region_name
    
    return df

def main():
    output_dir = Path('data/raw')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    all_dfs = []
    for region, coords in LOCATIONS.items():
        df = fetch_climate_data(region, coords['lat'], coords['lon'])
        all_dfs.append(df)
        time.sleep(1) # Be nice to API
        
    final_df = pd.concat(all_dfs, ignore_index=True)
    
    # Rename columns to match schema
    final_df = final_df.rename(columns={
        'T2M_MAX': 'tmax',
        'T2M_MIN': 'tmin',
        'PRECTOTCORR': 'rain',
        'RH2M': 'humidity'
    })
    
    output_path = output_dir / 'climate_daily_2015_2024.csv'
    final_df.to_csv(output_path, index=False)
    print(f"Saved climate data to {output_path} (Shape: {final_df.shape})")

if __name__ == '__main__':
    main()
