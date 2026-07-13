import json
import os
from llm_utils import call_qwen
import chromadb
from chromadb.utils import embedding_functions

# 本地模型路径（ModelScope 下载的缓存）
MODEL_CACHE_DIR = os.path.join(os.path.dirname(__file__), "model_cache", "models", "BAAI--bge-small-zh-v1.5", "snapshots", "master")

# 优先用本地缓存，否则自动从 HuggingFace 下载
if os.path.exists(MODEL_CACHE_DIR):
    model_path = MODEL_CACHE_DIR
else:
    model_path = "BAAI/bge-small-zh-v1.5"

chinese_embeddings = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=model_path
)
client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(__file__), "chromadb_data"))
collection = client.get_collection(
    name="scenic_spots",
    embedding_function=chinese_embeddings
)

def search_knowledge(query: str, top_k: int = 10):
    results = collection.query(query_texts=[query], n_results=top_k)
    return results["documents"][0]

def search_guide(query: str, top_k: int = 5):
    results = collection.query(
        query_texts=[query],
        n_results=top_k,
        where={"source": {"$in": ["guide", "qa", "routes"]}}
    )
    return results["documents"][0]

def chat(question: str) -> str:
    docs1 = search_knowledge(question)
    docs2 = search_guide(question)
    all_docs = list(docs2) + list(docs1)
    seen = set()
    unique_docs = []
    for doc in all_docs:
        if doc[:50] not in seen:
            seen.add(doc[:50])
            unique_docs.append(doc)
    context = "\n\n".join(unique_docs[:8])
    prompt = f"""你是灵山胜境的AI导游"灵灵"。根据以下资料回答问题。

要求：
1. 优先用资料回答，资料不够可以用常识（需标注常识回答）
2. 数据、时间等信息直接回答
3. 回答控制在100字以内
4. 语气亲切但简短

资料：
{context}

问题：
{question}

回答："""
    answer = call_qwen(prompt)
    return answer