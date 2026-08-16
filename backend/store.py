import json
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.auth import hash_password

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

SCAN_HISTORY_FILE = DATA_DIR / "scan_history.json"
SETTINGS_FILE = DATA_DIR / "settings.json"
OPERATIONAL_STATS_FILE = DATA_DIR / "operational_stats.json"
USERS_FILE = DATA_DIR / "users.json"
HELP_TICKETS_FILE = DATA_DIR / "help_center_tickets.json"

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
        "fullName": "Manas (Admin & Researcher)",
        "passwordHash": manas_hash,
        "salt": manas_salt,
        "role": "Lead System Architect & Admin",
        "organization": "MangoDL AI Research / KSIT CSE",
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
        "fullName": "Manas",
        "email": "manas@mangodl.ai",
        "phone": "+91 98765 43210",
        "location": "Bengaluru / Karnataka",
        "organization": "KSIT Dept of CSE & MangoDL",
        "role": "Platform Administrator & Lead Researcher"
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

DEFAULT_HELP_TICKETS = [
    {
        "id": "TK-101",
        "farmerName": "Ramesh Gowda",
        "phone": "+91 98451 22340",
        "email": "ramesh.kolar@gmail.com",
        "district": "Kolar",
        "mangoVariety": "Totapuri & Raspuri",
        "category": "Disease Diagnosis",
        "priority": "High",
        "status": "Answered",
        "subject": "Anthracnose dark spots spreading on new leaf flush",
        "message": "Sir, in my 12-acre orchard in Kolar, I noticed circular dark necrotic spots on young leaves after last week's rain. The MangoDL app detected Anthracnose with 94% confidence. What fungicide dosage and spray interval do you recommend for this stage?",
        "createdAt": "2026-08-15 10:30",
        "updatedAt": "2026-08-15 14:15",
        "replies": [
            {
                "id": "REP-1",
                "author": "Manas (Admin / KSIT MangoDL)",
                "role": "Lead Administrator",
                "isAdmin": True,
                "timestamp": "2026-08-15 14:15",
                "message": "Namaskara Ramesh Gowda avare. For Anthracnose in Kolar during humid flush conditions: 1) Apply Copper Oxychloride 50 WP @ 3g/L or Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2g/L water immediately. 2) Ensure canopy pruning to improve airflow. 3) Re-scan after 7 days using MangoDL to confirm lesion arrest."
            }
        ]
    },
    {
        "id": "TK-102",
        "farmerName": "Suresh Patil",
        "phone": "+91 97410 88219",
        "email": "suresh.dharwad@agro.in",
        "district": "Dharwad",
        "mangoVariety": "Alphonso (Kari Ishad)",
        "category": "Climate Extremes",
        "priority": "Medium",
        "status": "In Progress",
        "subject": "VPD risk warning in Dharwad climate intelligence page",
        "message": "Hello Manas sir, when I checked Dharwad district weather on the Climate Monitor, it flagged high VPD (Vapor Pressure Deficit) stress for tomorrow afternoon. Will this affect fruit set, and should I adjust drip irrigation?",
        "createdAt": "2026-08-16 09:15",
        "updatedAt": "2026-08-16 11:00",
        "replies": [
            {
                "id": "REP-2",
                "author": "Manas (Admin / KSIT MangoDL)",
                "role": "Lead Administrator",
                "isAdmin": True,
                "timestamp": "2026-08-16 11:00",
                "message": "Hello Suresh. High VPD above 2.2 kPa increases canopy transpiration shock. We recommend micro-sprinkler misting or running drip cycles during early morning (6:00 AM - 8:30 AM) to maintain soil moisture buffer. We are reviewing regional station sensor data for Dharwad right now."
            }
        ]
    },
    {
        "id": "TK-103",
        "farmerName": "Manjunatha K.",
        "phone": "+91 94480 33901",
        "email": "manju.orchards@yahoo.com",
        "district": "Ramanagara",
        "mangoVariety": "Raspuri Special",
        "category": "Yield & Market Decision",
        "priority": "Low",
        "status": "Open",
        "subject": "Revenue module recommendation between Channapatna APMC vs Mango Pulp Factory",
        "message": "Namaskara sir, my predicted harvest yield is ~14 tons/hectare in Ramanagara. The app suggests selling Grade-A fruit to direct Bengaluru retail market and Grade-B to pulp processing. How do I lock in wholesale price before harvest week?",
        "createdAt": "2026-08-16 16:45",
        "updatedAt": "2026-08-16 16:45",
        "replies": []
    },
    {
        "id": "TK-104",
        "farmerName": "Basavaraj Hubli",
        "phone": "+91 98800 77123",
        "email": "basav.belgaum@gmail.com",
        "district": "Belagavi (Belgaum)",
        "mangoVariety": "Pairi & Mallika",
        "category": "App Usage & Guidance",
        "priority": "Low",
        "status": "Resolved",
        "subject": "How to upload multiple leaf samples from phone gallery",
        "message": "Sir, I took 5 photos of leaves from different trees in my orchard. Can I test them one by one in the disease detection section?",
        "createdAt": "2026-08-14 15:20",
        "updatedAt": "2026-08-14 17:00",
        "replies": [
            {
                "id": "REP-3",
                "author": "Manas (Admin / KSIT MangoDL)",
                "role": "Lead Administrator",
                "isAdmin": True,
                "timestamp": "2026-08-14 17:00",
                "message": "Yes Basavaraj avare! You can click 'Browse Files' or 'Camera Scan' for each leaf, click 'Run AI Disease Analysis', and each scan is automatically logged with time and Grad-CAM diagnosis under the 'Scan History' table."
            }
        ]
    }
]

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
        "createdAt": time.strftime("%Y-%m-%d")
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

# Help Center Tickets
def get_help_tickets() -> List[Dict[str, Any]]:
    return load_json(HELP_TICKETS_FILE, DEFAULT_HELP_TICKETS)

def create_help_ticket(ticket_data: Dict[str, Any]) -> Dict[str, Any]:
    tickets = get_help_tickets()
    new_id = f"TK-{len(tickets) + 101}"
    now_str = time.strftime("%Y-%m-%d %H:%M")
    
    new_ticket = {
        "id": new_id,
        "farmerName": ticket_data.get("farmerName", "Karnataka Farmer"),
        "phone": ticket_data.get("phone", ""),
        "email": ticket_data.get("email", ""),
        "district": ticket_data.get("district", "Karnataka"),
        "mangoVariety": ticket_data.get("mangoVariety", "General"),
        "category": ticket_data.get("category", "General Inquiry"),
        "priority": ticket_data.get("priority", "Medium"),
        "status": "Open",
        "subject": ticket_data.get("subject", "Farmer Question"),
        "message": ticket_data.get("message", ""),
        "createdAt": now_str,
        "updatedAt": now_str,
        "replies": []
    }
    tickets.insert(0, new_ticket)
    save_json(HELP_TICKETS_FILE, tickets)
    return new_ticket

def update_ticket_status(ticket_id: str, status: str, priority: Optional[str] = None) -> Optional[Dict[str, Any]]:
    tickets = get_help_tickets()
    for t in tickets:
        if t.get("id") == ticket_id:
            t["status"] = status
            if priority:
                t["priority"] = priority
            t["updatedAt"] = time.strftime("%Y-%m-%d %H:%M")
            save_json(HELP_TICKETS_FILE, tickets)
            return t
    return None

def add_ticket_reply(ticket_id: str, reply_text: str, author: str = "Manas (Admin / KSIT)", role: str = "Lead Administrator", is_admin: bool = True) -> Optional[Dict[str, Any]]:
    tickets = get_help_tickets()
    for t in tickets:
        if t.get("id") == ticket_id:
            now_str = time.strftime("%Y-%m-%d %H:%M")
            reply = {
                "id": f"REP-{len(t.get('replies', [])) + 1}",
                "author": author,
                "role": role,
                "isAdmin": is_admin,
                "timestamp": now_str,
                "message": reply_text.strip()
            }
            if "replies" not in t:
                t["replies"] = []
            t["replies"].append(reply)
            t["status"] = "Answered" if is_admin else "In Progress"
            t["updatedAt"] = now_str
            save_json(HELP_TICKETS_FILE, tickets)
            return t
    return None

def delete_help_ticket(ticket_id: str) -> bool:
    tickets = get_help_tickets()
    new_tickets = [t for t in tickets if t.get("id") != ticket_id]
    if len(new_tickets) < len(tickets):
        save_json(HELP_TICKETS_FILE, new_tickets)
        return True
    return False

def get_help_center_stats() -> Dict[str, Any]:
    tickets = get_help_tickets()
    total = len(tickets)
    open_count = sum(1 for t in tickets if t.get("status") == "Open")
    in_progress = sum(1 for t in tickets if t.get("status") == "In Progress")
    answered = sum(1 for t in tickets if t.get("status") == "Answered")
    resolved = sum(1 for t in tickets if t.get("status") == "Resolved")
    
    return {
        "totalInquiries": total,
        "openInquiries": open_count,
        "inProgress": in_progress,
        "answered": answered,
        "resolved": resolved,
        "resolutionRate": f"{round((resolved + answered) / max(total, 1) * 100, 1)}%",
        "avgResponseTime": "< 2.5 hours",
        "adminLead": "Manas & KSIT MangoDL Agronomy Team"
    }
