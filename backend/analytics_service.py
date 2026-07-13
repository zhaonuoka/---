import json
import os
from llm_utils import call_qwen
from database import get_db

# ========== 情感分析 ==========
def analyze_emotion(text: str) -> str:
    """分析用户问题的情感倾向"""
    prompt = f"分析以下用户对景区的评价或问题的情感倾向，只回复：正面/中性/负面\n\n{text}"
    result = call_qwen(prompt)
    if "正面" in result:
        return "positive"
    elif "负面" in result:
        return "negative"
    return "neutral"

def analyze_emotion_batch(texts: list) -> list:
    """批量分析情感"""
    prompt = "分析以下每句话的情感倾向，每行只回复：正面/中性/负面，不要序号\n\n"
    for t in texts:
        prompt += t + "\n"
    result = call_qwen(prompt)
    lines = result.strip().split("\n")
    return [l.strip() for l in lines if l.strip() in ["正面","中性","负面"]]

# ========== 推荐路线 ==========
def load_routes():
    """加载推荐路线数据"""
    routes_path = os.path.join(os.path.dirname(__file__), "..", "scenic_routes_and_questions.json")
    spots_path = os.path.join(os.path.dirname(__file__), "scenic_spots.json")
    
    with open(routes_path, "r", encoding="utf-8-sig") as f:
        routes_data = json.loads(f.read())
    with open(spots_path, "r", encoding="utf-8-sig") as f:
        spots = json.loads(f.read())
    
    spot_map = {s["id"]: s["name"] for s in spots}
    return routes_data.get("routes", []), spot_map

def recommend(interests: list) -> dict:
    """根据兴趣标签推荐路线"""
    routes, spot_map = load_routes()
    
    # 匹配兴趣标签
    best_route = None
    max_match = 0
    for route in routes:
        match_count = sum(1 for tag in route.get("tags", []) if tag in interests or any(i in tag for i in interests))
        if match_count > max_match:
            max_match = match_count
            best_route = route
    
    if not best_route:
        best_route = routes[0]  # 默认第一条
    
    # 翻译景点ID为景点名称
    spot_names = []
    for sid in best_route.get("spots", []):
        if sid in spot_map:
            spot_names.append(spot_map[sid])
    
    return {
        "name": best_route["name"],
        "duration": best_route["duration"],
        "tags": best_route["tags"],
        "description": best_route.get("description", ""),
        "spots": spot_names
    }

# ========== 报告生成 ==========
def generate_report(start_date: str = None, end_date: str = None) -> dict:
    """生成游客感受度报告"""
    db = get_db()
    cursor = db.cursor()
    
    # 查询日志
    query = "SELECT * FROM conversation_logs"
    params = []
    if start_date and end_date:
        query += " WHERE created_at >= ? AND created_at <= ?"
        params = [start_date, end_date]
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    logs = [dict(row) for row in cursor.fetchall()]
    db.close()
    
    if not logs:
        return {"total": 0, "message": "暂无数据"}
    
    # 统计情感分布
    emotions = {"positive": 0, "neutral": 0, "negative": 0}
    for log in logs:
        e = log.get("emotion", "neutral")
        if e in emotions:
            emotions[e] += 1
    
    # 统计高频问题
    question_count = {}
    for log in logs:
        q = log.get("question", "")
        # 取前20字作为问题类别
        key = q[:20] if len(q) > 20 else q
        question_count[key] = question_count.get(key, 0) + 1
    
    top_questions = sorted(question_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # 用LLM生成服务建议
    if emotions["negative"] > 0:
        suggestion_prompt = f"根据景区游客对话数据，有{emotions['negative']}条负面反馈。请给出3条景区服务改进建议。"
        suggestion = call_qwen(suggestion_prompt)
    else:
        suggestion = "暂无负面反馈，继续保持！"
    
    return {
        "total": len(logs),
        "emotions": emotions,
        "top_questions": [{"question": q, "count": c} for q, c in top_questions],
        "suggestion": suggestion
    }