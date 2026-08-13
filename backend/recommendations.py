from typing import List, Dict, Any

# In-memory actioned state
actioned_ids = set()

def generate_dynamic_recommendations(history: List[Dict[str, Any]], climate_temp: float, humidity: float) -> List[Dict[str, Any]]:
    recs = []
    
    # Check latest scan history for disease alerts
    latest_disease = "Healthy"
    latest_severity = "None"
    if history and len(history) > 0:
        latest_disease = history[0].get("disease", "Healthy")
        latest_severity = history[0].get("severity", "None")
        
    if latest_disease != "Healthy" and latest_severity in ("High", "Medium"):
        recs.append({
            "id": 1,
            "type": "alert",
            "severity": "high" if latest_severity == "High" else "medium",
            "title": f"{latest_disease} Risk Alert",
            "description": f"Recent scan detected {latest_disease} with {latest_severity} severity. Immediate targeted fungicide/pesticide treatment advised.",
            "action": "Apply recommended treatment within 48 hours",
            "icon": "AlertTriangle",
            "color": "mango",
            "actioned": 1 in actioned_ids
        })

    # Humidity / fungal alert
    if humidity > 80:
        recs.append({
            "id": 2,
            "type": "irrigation",
            "severity": "high",
            "title": "High Humidity Fungal Risk",
            "description": f"Relative humidity is {humidity}%. High humidity creates ideal spore germination conditions for Anthracnose & Powdery Mildew.",
            "action": "Reduce drip irrigation & inspect dense canopy sectors",
            "icon": "Droplets",
            "color": "cyan",
            "actioned": 2 in actioned_ids
        })
    else:
        recs.append({
            "id": 2,
            "type": "irrigation",
            "severity": "medium",
            "title": "Irrigation Optimization",
            "description": "Soil moisture dropping in Hassan orchards. AI recommends adjusting drip schedule for fruit sizing.",
            "action": "Increase irrigation by 15% for next 3 days",
            "icon": "Droplets",
            "color": "cyan",
            "actioned": 2 in actioned_ids
        })

    # Harvest timing
    recs.append({
        "id": 3,
        "type": "harvest",
        "severity": "low",
        "title": "Optimal Harvest Window",
        "description": "Temperature and solar radiation indicate peak maturity for Banganapalli variety.",
        "action": "Schedule harvest team for Orchard Sector 4 within 5 days",
        "icon": "Leaf",
        "color": "neon",
        "actioned": 3 in actioned_ids
    })

    # Soil & Nutrient
    recs.append({
        "id": 4,
        "type": "fertilizer",
        "severity": "medium",
        "title": "Post-Harvest Nutrient Replenishment",
        "description": "Spectral imaging indicates low Nitrogen reserves after fruit set.",
        "action": "Apply NPK 20-10-10 at 150kg/hectare after pruning",
        "icon": "FlaskConical",
        "color": "violet",
        "actioned": 4 in actioned_ids
    })

    # Pest control
    recs.append({
        "id": 5,
        "type": "pesticide",
        "severity": "low",
        "title": "Gall Midge / Weevil Prevention",
        "description": "Early seasonal shoot emergence requires proactive pest monitoring.",
        "action": "Deploy yellow sticky traps & monitor new flushes",
        "icon": "Bug",
        "color": "cyan",
        "actioned": 5 in actioned_ids
    })

    # Climate warning
    if climate_temp > 35:
        recs.append({
            "id": 6,
            "type": "climate",
            "severity": "high",
            "title": "Heat Stress Risk Warning",
            "description": f"Peak temperatures reaching {climate_temp}°C. Sunburn and fruit drop risk elevated.",
            "action": "Maintain soil moisture cover & apply kaolin clay spray if needed",
            "icon": "Wind",
            "color": "mango",
            "actioned": 6 in actioned_ids
        })
    else:
        recs.append({
            "id": 6,
            "type": "climate",
            "severity": "low",
            "title": "Favorable Climate Conditions",
            "description": f"Ambient temperature ({climate_temp}°C) is well within optimal growth envelope.",
            "action": "Continue routine orchard monitoring",
            "icon": "Wind",
            "color": "mango",
            "actioned": 6 in actioned_ids
        })

    return recs

def toggle_action(rec_id: int) -> bool:
    if rec_id in actioned_ids:
        actioned_ids.remove(rec_id)
    else:
        actioned_ids.add(rec_id)
    return True
