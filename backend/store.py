import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.auth import hash_password

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

SCAN_HISTORY_FILE = DATA_DIR / "scan_history.json"
SETTINGS_FILE = DATA_DIR / "settings.json"
OPERATIONAL_STATS_FILE = DATA_DIR / "operational_stats.json"
USERS_FILE = DATA_DIR / "users.json"

# Seed default demo users
demo_hash, demo_salt = hash_password("password123", "demosalt12345678")
manas_hash, manas_salt = hash_password("password123", "manassalt1234567")

DEFAULT_USERS = [
    {
        "id": "USR-001",
        "email": "demo@mangodl.ai",
        "fullName": "Demo Agronomist",
        "passwordHash": demo_hash,
        "salt": demo_salt,
        "role": "Orchard Manager",
        "organization": "Karnataka Mango Development Board",
        "createdAt": "2026-05-01"
    },
    {
        "id": "USR-002",
        "email": "manas@mangodl.ai",
        "fullName": "Manas Kumar",
        "passwordHash": manas_hash,
        "salt": manas_salt,
        "role": "Senior Agricultural Technologist",
        "organization": "MangoDL AI Research",
        "createdAt": "2026-05-01"
    }
]

DEFAULT_HISTORY = [
    { "id": 1, "date": "2026-05-27", "image": "leaf_001.jpg", "disease": "Anthracnose", "confidence": 94.2, "severity": "High" },
    { "id": 2, "date": "2026-05-26", "image": "leaf_002.jpg", "disease": "Healthy", "confidence": 98.7, "severity": "None" },
    { "id": 3, "date": "2026-05-25", "image": "leaf_003.jpg", "disease": "Powdery Mildew", "confidence": 87.3, "severity": "Medium" },
    { "id": 4, "date": "2026-05-24", "image": "leaf_004.jpg", "disease": "Bacterial Canker", "confidence": 91.5, "severity": "High" },
    { "id": 5, "date": "2026-05-23", "image": "leaf_005.jpg", "disease": "Healthy", "confidence": 96.4, "severity": "None" }
]

DEFAULT_SETTINGS = {
    "profile": {
        "fullName": "Manas Kumar",
        "email": "manas@mangodl.ai",
        "phone": "+91 98765 43210",
        "location": "Karnataka, India",
        "organization": "Karnataka Mango Development Board",
        "role": "Senior Agricultural Technologist"
    },
    "aiConfig": {
        "autoScanFrequency": "Every 6 hours",
        "detectionThreshold": "75%",
        "yieldModelVersion": "v3.2 (Latest)",
        "autoNotifications": True,
        "gradcamVisualization": True,
        "revenueForecasting": True,
        "betaFeatures": False
    }
}

DEFAULT_STATS = {
    "imagesProcessed": 12847,
    "inferencesMade": 94230,
    "avgLatency": "28ms",
    "modelAccuracy": "99.0%"
}

def load_json(filepath: Path, default_data: Any) -> Any:
    if not filepath.exists():
        save_json(filepath, default_data)
        return default_data
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return default_data

def save_json(filepath: Path, data: Any):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# Users
def get_users() -> List[Dict[str, Any]]:
    return load_json(USERS_FILE, DEFAULT_USERS)

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    users = get_users()
    email_clean = email.strip().lower()
    for u in users:
        if u.get("email", "").strip().lower() == email_clean:
            return u
    return None

def create_user(full_name: str, email: str, password_hash: str, salt: str, role: str = "Orchard Manager", organization: str = "MangoDL AI Platform") -> Dict[str, Any]:
    users = get_users()
    user = {
        "id": f"USR-00{len(users) + 1}",
        "email": email.strip().lower(),
        "fullName": full_name.strip(),
        "passwordHash": password_hash,
        "salt": salt,
        "role": role,
        "organization": organization,
        "createdAt": "2026-08-06"
    }
    users.append(user)
    save_json(USERS_FILE, users)
    return user

# Scan History
def get_scan_history() -> List[Dict[str, Any]]:
    return load_json(SCAN_HISTORY_FILE, DEFAULT_HISTORY)

def add_scan_history(record: Dict[str, Any]):
    history = get_scan_history()
    record["id"] = len(history) + 1
    history.insert(0, record)
    save_json(SCAN_HISTORY_FILE, history)

# Settings
def get_settings() -> Dict[str, Any]:
    return load_json(SETTINGS_FILE, DEFAULT_SETTINGS)

def save_settings(settings: Dict[str, Any]):
    save_json(SETTINGS_FILE, settings)

# Stats
def get_operational_stats() -> Dict[str, Any]:
    return load_json(OPERATIONAL_STATS_FILE, DEFAULT_STATS)

def increment_inference_stat():
    stats = get_operational_stats()
    stats["imagesProcessed"] = stats.get("imagesProcessed", 12847) + 1
    stats["inferencesMade"] = stats.get("inferencesMade", 94230) + 1
    save_json(OPERATIONAL_STATS_FILE, stats)
