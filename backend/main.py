from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import shutil
from rag_chain import chat
from database import get_db, init_db
from auth import hash_password, verify_password, create_token, require_admin
from database import create_user, get_user_by_username, get_user_by_id

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="景区导览AI数字人后端", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 请求体定义 ==========
class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    status: str = "success"

class TTSRequest(BaseModel):
    text: str

class RecommendRequest(BaseModel):
    interests: list[str] = ["历史"]

class ReportRequest(BaseModel):
    start: str = ""
    end: str = ""

class EditDocRequest(BaseModel):
    content: str = ""

class AvatarConfig(BaseModel):
    model: str = "haru"
    voice: str = "zh-CN-XiaoxiaoNeural"
    skin_color: str = "#D4A853"

# ========== 基础接口 ==========
@app.get("/")
def root():
    return {"message": "景区导览AI数字人后端运行中"}

# ========== 用户认证接口 ==========
@app.post("/api/auth/register")
def register(data: dict):
    # 注册新用户
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "tourist")
    if not username or not password:
        raise HTTPException(status_code=400, detail="用户名和密码不能为空")
    if role not in ("admin", "tourist"):
        raise HTTPException(status_code=400, detail="角色只能是 admin 或 tourist")
    hashed = hash_password(password)
    user = create_user(username, hashed, role)
    if not user:
        raise HTTPException(status_code=409, detail="用户名已存在")
    return user

@app.post("/api/auth/login")
def login(data: dict):
    # 登录获取 token
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="用户名和密码不能为空")
    user = get_user_by_username(username)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_token(user["id"], user["role"])
    return {
        "token": token,
        "user": {"id": user["id"], "username": user["username"], "role": user["role"]}
    }

@app.get("/api/auth/me")
def get_me(payload: dict = Depends(require_admin)):
    # 获取当前用户信息（需管理员 Token）
    user = get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

# ========== 聊天接口（公开）==========
@app.post("/api/chat", response_model=ChatResponse)
def chat_api(req: ChatRequest):
    try:
        answer = chat(req.question)
        return ChatResponse(answer=answer)
    except Exception as e:
        return ChatResponse(answer=f"抱歉出错：{str(e)}", status="error")

# ========== 知识库管理接口（需 admin 权限）==========
UPLOAD_DIR = "knowledge_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/knowledge/upload")
async def upload_doc(file: UploadFile = File(...), admin: dict = Depends(require_admin)):
    doc = await file.read()
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(doc)
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO knowledge_docs (name, content, file_type, file_size) VALUES (?, ?, ?, ?)",
        (file.filename, "暂未提取内容", file.filename.split(".")[-1], len(doc))
    )
    db.commit()
    doc_id = cursor.lastrowid
    db.close()
    return {"success": True, "id": doc_id, "name": file.filename}

@app.get("/api/knowledge/list")
def list_docs(admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, file_type, file_size, created_at FROM knowledge_docs ORDER BY created_at DESC")
    docs = [dict(row) for row in cursor.fetchall()]
    db.close()
    return {"data": docs}

@app.delete("/api/knowledge/{doc_id}")
def delete_doc(doc_id: int, admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT name FROM knowledge_docs WHERE id = ?", (doc_id,))
    doc = cursor.fetchone()
    if not doc:
        db.close()
        raise HTTPException(status_code=404, detail="文档不存在")
    file_path = os.path.join(UPLOAD_DIR, doc["name"])
    if os.path.exists(file_path):
        os.remove(file_path)
    cursor.execute("DELETE FROM knowledge_docs WHERE id = ?", (doc_id,))
    db.commit()
    db.close()
    return {"success": True}

@app.put("/api/knowledge/{doc_id}")
def edit_doc(doc_id: int, data: dict, admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE knowledge_docs SET content = ? WHERE id = ?",
        (data.get("content", ""), doc_id)
    )
    db.commit()
    db.close()
    return {"success": True}

# ========== 数字人配置接口（需 admin 权限）==========
@app.get("/api/config/avatar")
def get_avatar_config(admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT config_key, config_value FROM avatar_config")
    config = {row["config_key"]: row["config_value"] for row in cursor.fetchall()}
    db.close()
    return config

@app.put("/api/config/avatar")
def update_avatar_config(config: AvatarConfig, admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    for key, val in [("model", config.model), ("voice", config.voice), ("skin_color", config.skin_color)]:
        cursor.execute("UPDATE avatar_config SET config_value = ? WHERE config_key = ?", (val, key))
    db.commit()
    db.close()
    return {"success": True}

# ========== TTS语音合成接口（公开）==========
from tts_service import text_to_speech

@app.post("/api/tts")
async def tts_api(req: TTSRequest):
    text = req.text
    if not text:
        return {"error": "请输入文字"}
    audio = await text_to_speech(text)
    return {"audio": audio}

# ========== 语音识别接口（公开）==========
import stt_service

@app.post("/api/stt")
async def speech_to_text(file: UploadFile = File(...)):
    content = await file.read()
    text = stt_service.transcribe(content)
    return {"text": text}

# ========== WebSocket全链路对话接口（公开）==========
@app.websocket("/ws/chat")
async def websocket_chat(websocket):
    import uuid
    session_id = str(uuid.uuid4())[:8]
    await websocket.accept()
    while True:
        try:
            audio_data = await websocket.receive_bytes()
            text = stt_service.transcribe(audio_data)
            answer = chat(text)
            emotion = analyze_emotion(text)
            audio = await text_to_speech(answer)
            save_log(session_id, text, answer, emotion)
            await websocket.send_json({
                "text": answer, "audio": audio, "emotion": emotion
            })
        except Exception as e:
            await websocket.send_json({
                "text": f"出错了：{str(e)}", "audio": "", "emotion": "neutral"
            })

# ========== 推荐路线接口（公开）==========
from analytics_service import recommend, generate_report, analyze_emotion, analyze_emotion_batch
from database import save_log

@app.post("/api/recommend")
def recommend_api(req: RecommendRequest):
    result = recommend(req.interests)
    return result

# ========== 情感统计接口（需 admin 权限）==========
@app.get("/api/analytics/sentiment")
def sentiment_api(start: str = "", end: str = "", admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    query = "SELECT emotion, COUNT(*) as count FROM conversation_logs"
    params = []
    if start and end:
        query += " WHERE created_at >= ? AND created_at <= ?"
        params = [start, end]
    query += " GROUP BY emotion"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    db.close()
    result = {"positive": 0, "neutral": 0, "negative": 0}
    for row in rows:
        r = dict(row)
        result[r["emotion"]] = r["count"]
    return result

# ========== 报告生成接口（需 admin 权限）==========
@app.post("/api/analytics/report")
def report_api(data: ReportRequest, admin: dict = Depends(require_admin)):
    report = generate_report(data.start, data.end)
    return report

# ========== 日志查询接口（需 admin 权限）==========
@app.get("/api/logs")
def logs_api(page: int = 1, page_size: int = 20, admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM conversation_logs")
    total = cursor.fetchone()["total"]
    offset = (page - 1) * page_size
    cursor.execute(
        "SELECT id, session_id, question, answer, emotion, created_at FROM conversation_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (page_size, offset)
    )
    logs = [dict(row) for row in cursor.fetchall()]
    db.close()
    return {"total": total, "data": logs}

# ========== 数据大屏接口（需 admin 权限）==========
@app.get("/api/dashboard/summary")
def dashboard_summary(admin: dict = Depends(require_admin)):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM conversation_logs WHERE date(created_at) = date('now')")
    today_count = cursor.fetchone()["count"]
    cursor.execute("SELECT COUNT(*) as count FROM conversation_logs")
    total_count = cursor.fetchone()["count"]
    cursor.execute("SELECT question, COUNT(*) as count FROM conversation_logs GROUP BY question ORDER BY count DESC LIMIT 10")
    top_questions = [dict(row) for row in cursor.fetchall()]
    cursor.execute("SELECT emotion, COUNT(*) as count FROM conversation_logs WHERE created_at >= datetime('now', '-7 days') GROUP BY emotion")
    sentiment_rows = cursor.fetchall()
    sentiment = {"positive": 0, "neutral": 0, "negative": 0}
    for row in sentiment_rows:
        r = dict(row)
        sentiment[r["emotion"]] = r["count"]
    db.close()
    return {
        "today_visitors": today_count, "total_visitors": total_count,
        "top_questions": top_questions, "sentiment_7days": sentiment
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)