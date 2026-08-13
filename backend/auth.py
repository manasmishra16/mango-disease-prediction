import hashlib
import os
import secrets
from typing import Dict, Any, Optional

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return key.hex(), salt

def verify_password(password: str, hashed: str, salt: str) -> bool:
    new_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(new_hash, hashed)

def generate_token(email: str) -> str:
    # Token format: email:random_hex
    raw = f"{email}:{secrets.token_hex(16)}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()
