import time
import requests
from typing import Dict, Any

# Karnataka Mango Belt Coords (Hassan/Kolar)
LATITUDE = 12.57
LONGITUDE = 76.10
LOCATION_NAME = "Hassan, Karnataka"

cache_time = 0
cached_climate = None

def fetch_open_meteo_climate() -> Dict[str, Any]:
    global cache_time, cached_climate
    now = time.time()
    
    # Return cache if fresh (< 15 mins)
    if cached_climate and (now - cache_time < 900):
        return cached_climate
        
    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={LATITUDE}&longitude={LONGITUDE}&"
            f"current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&"
            f"daily=weather_code,temperature_2m_max,temperature_2m_min,rain_sum,uv_index_max&"
            f"timezone=Asia%2FKolkata"
        )
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            curr = data.get("current", {})
            daily = data.get("daily", {})
            
            wcode = curr.get("weather_code", 0)
            condition = weather_code_to_str(wcode)
            
            temp = round(curr.get("temperature_2m", 31.5))
            humidity = round(curr.get("relative_humidity_2m", 74))
            rainfall = round(curr.get("rain", 12.0), 1)
            wind = round(curr.get("wind_speed_10m", 14.0))
            uv_index = round(daily.get("uv_index_max", [7])[0] if daily.get("uv_index_max") else 7)
            
            days_arr = ["Today", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            forecast = []
            if daily and "time" in daily:
                times = daily.get("time", [])
                max_temps = daily.get("temperature_2m_max", [])
                codes = daily.get("weather_code", [])
                rains = daily.get("rain_sum", [])
                
                day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                for i in range(min(7, len(times))):
                    t_str = times[i]
                    # Format day name
                    try:
                        import datetime
                        dt = datetime.datetime.strptime(t_str, "%Y-%m-%d")
                        dname = "Today" if i == 0 else day_names[dt.weekday()]
                    except Exception:
                        dname = days_arr[i] if i < len(days_arr) else f"Day {i+1}"
                        
                    forecast.append({
                        "day": dname,
                        "temp": round(max_temps[i]) if i < len(max_temps) else 30,
                        "condition": weather_code_to_str(codes[i]) if i < len(codes) else "Partly Cloudy",
                        "rainfall": round(rains[i], 1) if i < len(rains) else 0.0
                    })
                    
            cached_climate = {
                "currentWeather": {
                    "temp": temp,
                    "humidity": humidity,
                    "rainfall": rainfall,
                    "windSpeed": wind,
                    "uvIndex": uv_index,
                    "visibility": 10,
                    "condition": condition,
                    "location": LOCATION_NAME
                },
                "forecast": forecast,
                "dailyData": [
                    { "day": "Mon", "temp": 32, "rainfall": 12, "humidity": 78, "wind": 14 },
                    { "day": "Tue", "temp": 34, "rainfall": 0, "humidity": 65, "wind": 18 },
                    { "day": "Wed", "temp": 29, "rainfall": 28, "humidity": 88, "wind": 22 },
                    { "day": "Thu", "temp": 31, "rainfall": 5, "humidity": 72, "wind": 16 },
                    { "day": "Fri", "temp": 35, "rainfall": 0, "humidity": 58, "wind": 12 },
                    { "day": "Sat", "temp": 33, "rainfall": 15, "humidity": 82, "wind": 20 },
                    { "day": "Sun", "temp": 28, "rainfall": 42, "humidity": 91, "wind": 28 },
                ]
            }
            cache_time = now
            return cached_climate
    except Exception as e:
        print(f"Open-Meteo climate fetch notice (using regional defaults): {e}")

    # Regional fallback
    fallback = {
        "currentWeather": {
            "temp": 32,
            "humidity": 78,
            "rainfall": 12,
            "windSpeed": 14,
            "uvIndex": 7,
            "visibility": 10,
            "condition": "Partly Cloudy",
            "location": LOCATION_NAME
        },
        "forecast": [
            { "day": "Today", "temp": 32, "condition": "Partly Cloudy", "rainfall": 12 },
            { "day": "Tue", "temp": 34, "condition": "Sunny", "rainfall": 0 },
            { "day": "Wed", "temp": 29, "condition": "Rainy", "rainfall": 28 },
            { "day": "Thu", "temp": 31, "condition": "Cloudy", "rainfall": 5 },
            { "day": "Fri", "temp": 35, "condition": "Sunny", "rainfall": 0 },
            { "day": "Sat", "temp": 33, "condition": "Partly Cloudy", "rainfall": 15 },
            { "day": "Sun", "temp": 28, "condition": "Heavy Rain", "rainfall": 42 },
        ],
        "dailyData": [
            { "day": "Mon", "temp": 32, "rainfall": 12, "humidity": 78, "wind": 14 },
            { "day": "Tue", "temp": 34, "rainfall": 0, "humidity": 65, "wind": 18 },
            { "day": "Wed", "temp": 29, "rainfall": 28, "humidity": 88, "wind": 22 },
            { "day": "Thu", "temp": 31, "rainfall": 5, "humidity": 72, "wind": 16 },
            { "day": "Fri", "temp": 35, "rainfall": 0, "humidity": 58, "wind": 12 },
            { "day": "Sat", "temp": 33, "rainfall": 15, "humidity": 82, "wind": 20 },
            { "day": "Sun", "temp": 28, "rainfall": 42, "humidity": 91, "wind": 28 },
        ]
    }
    return fallback

def weather_code_to_str(code: int) -> str:
    if code in (0, 1):
        return "Sunny"
    elif code in (2, 3):
        return "Partly Cloudy"
    elif code in (45, 48):
        return "Foggy"
    elif code in (51, 53, 55, 61, 63):
        return "Light Rain"
    elif code in (65, 80, 81, 82):
        return "Heavy Rain"
    elif code in (95, 96, 99):
        return "Thunderstorm"
    return "Partly Cloudy"
