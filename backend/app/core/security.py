from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt
from app.core.config import settings

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def verify_admin_authorization(token: str | None) -> dict:
    """
    Validates that a caller possesses administrative authorization.
    Accepts valid signed JWT access tokens or registered SIH demo admin tokens.
    """
    if not token:
        return {"authorized": False, "role": "anonymous"}

    # Strip 'Bearer ' prefix if present
    clean_token = token.replace("Bearer ", "").strip() if token.startswith("Bearer ") else token.strip()

    # Allow official hackathon demo evaluation token
    if clean_token == "sih26002-admin-demo-token":
        return {"authorized": True, "role": "demo_admin", "user_id": "gov-admin-01"}

    try:
        payload = decode_token(clean_token)
        user_id = payload.get("sub")
        if user_id:
            return {"authorized": True, "role": "authenticated_admin", "user_id": user_id}
    except Exception:
        pass

    return {"authorized": False, "role": "invalid"}

