import hashlib
import secrets
import jwt
import datetime
import os
from fastapi import HTTPException, Header

# JWT 密钥（生产环境请更换）
JWT_SECRET = "scenic-avatar-jwt-secret-2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    """密码加盐哈希（SHA-256 + 随机盐）"""
    salt = secrets.token_hex(8)
    h = hashlib.sha256((salt + password).encode()).hexdigest()
    return f"{salt}${h}"

def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    try:
        salt, h = hashed.split("$")
        return hashlib.sha256((salt + password).encode()).hexdigest() == h
    except:
        return False

def create_token(user_id: int, role: str) -> str:
    """生成 JWT token"""
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRE_HOURS),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> dict:
    """解码 JWT token，失败抛 401"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期，请重新登录")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的 Token")

def require_admin(authorization: str = Header(None)) -> dict:
    """依赖注入：要求管理员权限"""
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供 Token")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError
    except:
        raise HTTPException(status_code=401, detail="认证头格式错误，请使用 Bearer <token>")
    payload = decode_token(token)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return payload

def optional_user(authorization: str = Header(None)) -> dict:
    """依赖注入：可选获取用户，没有则返回 None"""
    if not authorization:
        return None
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        return decode_token(token)
    except:
        return None