# 景区导览AI数字人

基于 FastAPI + RAG + 通义千问 的智能景区导览系统，含 3D 数字人导游、游客聊天、管理后台。

---

## 项目结构

```
软件杯/
├── backend/                     # Python 后端（FastAPI）
│   ├── main.py                  # 服务入口，所有 API 路由
│   ├── database.py              # SQLite 数据库
│   ├── auth.py                  # JWT 认证
│   ├── llm_utils.py             # 通义千问 API 封装
│   ├── rag_chain.py             # RAG 问答（相似度检索 + AI）
│   ├── rag_knowledge.py         # 知识库构建脚本
│   ├── analytics_service.py     # 情感分析、路线推荐、报告
│   ├── stt_service.py           # 语音识别（faster-whisper）
│   ├── tts_service.py           # 语音合成（Edge-TTS）
│   ├── static/                  # 前端构建产物（编译后）
│   ├── scenic_spots.json        # 22 个景点数据
│   ├── app.db                   # SQLite 数据库文件
│   └── chromadb_data/           # 向量数据库
├── c-tourist/                   # React + Vite 前端（游客+管理）
│   ├── src/
│   │   ├── main.tsx             # 路由入口
│   │   ├── pages/
│   │   │   ├── login/           # 登录注册页
│   │   │   ├── tourist/         # 游客聊天（3D 数字人）
│   │   │   └── admin/           # 管理后台（仪表盘/日志/配置）
│   │   └── polyfills/           # 浏览器 polyfill
│   ├── public/                  # 3D 模型、Live2D SDK
│   ├── build.js                 # 生产构建脚本
│   └── start.js                 # 开发启动脚本
├── b-admin/                     #（旧版）ECharts 管理后台
├── guide_knowledge.json         # 景区通用知识
├── scenic_routes_and_questions.json  # 推荐路线 + 常见问答
└── requirements.txt             # Python 依赖
```

---

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端框架 | Python FastAPI（端口 8000） |
| 大模型 | 通义千问 Qwen-Plus（阿里云百炼 API） |
| 向量数据库 | ChromaDB + BAAI/bge-small-zh-v1.5 |
| 语音识别 | faster-whisper tiny |
| 语音合成 | Edge-TTS（微软免费 TTS） |
| 数据库 | SQLite3 |
| 前端框架 | React 19 + TypeScript + Vite |
| UI 组件 | Ant Design 6.x |
| 3D 数字人 | XmovAvatar（魔珐星云 SDK） |

---

## 环境要求

- **Python 3.10~3.12**（推荐 3.12）
- **Node.js 18+**（编译前端时需要）
- **阿里云百炼 API Key**（在 `backend/llm_utils.py` 中配置 `DASHSCOPE_API_KEY`）

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/25413/guide.git
cd guide
```

### 2. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 3. 首次初始化（数据库 + 知识库）

```bash
cd backend
python init_kb.py
```

### 4. 启动后端

```bash
cd backend
# Windows PowerShell:
$env:PYTHONIOENCODING="utf-8"
python main.py

# Linux / macOS:
PYTHONIOENCODING=utf-8 python main.py
```

等待 10-15 秒（加载语音模型和向量模型），启动后访问：

| 页面 | 地址 |
|------|------|
| 登录页 | http://localhost:8000/login |
| 游客端 | http://localhost:8000/tourist |
| 管理后台 | http://localhost:8000/admin/dashboard |
| API 文档 | http://localhost:8000/docs |

**默认账号：**
- 管理员：`admin` / `admin123`
- 游客：`test` / `test123`

也可在登录页自行注册。

### 5. 修改前端后重新构建

```bash
cd c-tourist
node build.js
```

构建产物输出到 `backend/static/`，重启后端即可。

### 6. 前端开发模式（热更新）

```bash
cd c-tourist
node start.js
```

开发服务器运行在 http://localhost:5174，自动代理 API 到后端 8000 端口。

---

## API 接口一览

| 接口 | 方法 | 用途 |
|------|------|------|
| `/api/chat` | POST | 文字问答 |
| `/api/stt` | POST | 语音识别 |
| `/api/tts` | POST | 语音合成 |
| `/ws/chat` | WebSocket | 全链路语音对话 |
| `/api/recommend` | POST | 推荐游览路线 |
| `/api/scenic-spots` | GET | 景点列表 |
| `/api/auth/register` | POST | 注册 |
| `/api/auth/login` | POST | 登录 |
| `/api/knowledge/upload` | POST | 上传知识库文档 |
| `/api/knowledge/list` | GET | 文档列表 |
| `/api/dashboard/summary` | GET | 数据大屏聚合 |
| `/api/logs` | GET | 对话日志（分页） |
| `/api/config/avatar` | GET/PUT | 数字人配置 |
| `/api/analytics/sentiment` | GET | 情感统计 |
| `/api/analytics/report` | POST | 游客感受度报告 |

---

## 团队成员协作

### 拉取最新代码

```bash
git pull origin master
```

### 初始化环境

```bash
pip install -r requirements.txt
cd backend && python init_kb.py
```

### 启动后端

```bash
cd backend
python main.py
```

### 提交代码

```bash
git add .
git commit -m "做了什么改动"
git push
```

**注意：** 不要提交 `node_modules/`、`__pycache__/`、`.vite/`、`chromadb_data/`、`model_cache/`、`*.db`。

---

## 常见问题

**Q: Python 后端启动报错 "出错了"？**

A: 检查 `backend/llm_utils.py` 中的阿里云百炼 API Key 是否有效。如果 API 限流可尝试稍后再试。

**Q: 前端构建失败？**

A: 确保 Node.js 18+ 已安装。运行 `cd c-tourist && npm install` 安装依赖后再构建。

**Q: 管理后台没有数据？**

A: 先在游客端发几条消息，系统会自动记录日志。管理后台仪表盘和日志页面从此读取。

**Q: 3D 数字人不显示？**

A: 确保 `c-tourist/public/` 中的 XmovAvatar SDK 文件完整。首次加载可能需要 5-10 秒。如果网络不通，聊天功能仍然可用。

---

## License

内部项目，仅供团队开发使用。
