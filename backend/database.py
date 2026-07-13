import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 知识库文档表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS knowledge_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            content TEXT,
            file_type TEXT,
            file_size INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 数字人配置表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS avatar_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            config_key TEXT UNIQUE NOT NULL,
            config_value TEXT
        )
    """)

    # 对话日志表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversation_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            question TEXT,
            answer TEXT,
            emotion TEXT DEFAULT 'neutral',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ==== 新增：用户表 ====
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'tourist',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 插入默认配置
    default_configs = [
        ("model", "haru"),
        ("voice", "zh-CN-XiaoxiaoNeural"),
        ("skin_color", "#D4A853"),
    ]
    for key, val in default_configs:
        cursor.execute(
            "INSERT OR IGNORE INTO avatar_config (config_key, config_value) VALUES (?, ?)",
            (key, val)
        )

    conn.commit()
    conn.close()
    print("数据库初始化完成")

# 保存对话日志
def save_log(session_id: str, question: str, answer: str, emotion: str = "neutral"):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO conversation_logs (session_id, question, answer, emotion) VALUES (?, ?, ?, ?)",
        (session_id, question, answer, emotion)
    )
    db.commit()
    db.close()

# ==== 新增：用户相关数据库操作 ====
def create_user(username: str, password_hash: str, role: str = "tourist") -> dict:
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            (username, password_hash, role)
        )
        db.commit()
        user_id = cursor.lastrowid
        return {"id": user_id, "username": username, "role": role}
    except sqlite3.IntegrityError:
        return None
    finally:
        db.close()

def get_user_by_username(username: str) -> dict:
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, username, password_hash, role FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    db.close()
    if row:
        return dict(row)
    return None

def get_user_by_id(user_id: int) -> dict:
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, username, role, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    db.close()
    if row:
        return dict(row)
    return None