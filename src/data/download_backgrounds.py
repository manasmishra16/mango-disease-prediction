import os
import requests
from pathlib import Path

def download_backgrounds():
    output_dir = Path("data/raw/backgrounds")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Direct high-quality CC0 image URLs representing field, soil, and hands
    urls = [
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800", # Farm field
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800", # Dirt/Soil
        "https://images.unsplash.com/photo-1592982537447-6f233496bc0e?w=800", # Leaves/Soil
        "https://images.unsplash.com/photo-1598444146059-4f3640b8a4f4?w=800", # Crop field
        "https://images.unsplash.com/photo-1585406734790-2804c7d01be2?w=800"  # Hands holding soil
    ]
    
    print(f"Downloading {len(urls)} background images...")
    for i, url in enumerate(urls):
        file_path = output_dir / f"bg_{i}.jpg"
        if file_path.exists():
            continue
            
        try:
            response = requests.get(url, stream=True, timeout=10)
            response.raise_for_status()
            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"Downloaded bg_{i}.jpg")
        except Exception as e:
            print(f"Failed to download {url}: {e}")

if __name__ == "__main__":
    download_backgrounds()
