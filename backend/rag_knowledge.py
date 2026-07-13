import json
import os
import chromadb
from chromadb.utils import embedding_functions

file_path = os.path.join(os.path.dirname(__file__), "scenic_spots.json")
guide_path = os.path.join(os.path.dirname(__file__), "..", "guide_knowledge.json")
routes_path = os.path.join(os.path.dirname(__file__), "..", "scenic_routes_and_questions.json")

# 本地模型路径（ModelScope 下载缓存目录）
MODEL_CACHE_DIR = os.path.join(os.path.dirname(__file__), "model_cache", "models", "BAAI--bge-small-zh-v1.5", "snapshots", "master")
if os.path.exists(MODEL_CACHE_DIR):
    model_path = MODEL_CACHE_DIR
else:
    model_path = "BAAI/bge-small-zh-v1.5"

# 1. 读取所有数据源
all_documents = []
all_metadatas = []
all_ids = []
doc_id = 0

# 1a. 景点数据
with open(file_path, "r", encoding="utf-8-sig") as f:
    spots = json.loads(f.read())

for spot in spots:
    texts = [
        f"景点名称：{spot['name']}\n位置：{spot['location']}\n参数：{spot['parameters']}",
        f"景点名称：{spot['name']}\n文化内涵：{spot['culture']}\n介绍：{spot['description'][:300]}",
        f"景点名称：{spot['name']}\n游玩亮点：{spot['highlight']}\n开放信息：{spot['info']}",
        f"景点名称：{spot['name']}\n备注：{spot['note']}"
    ]
    for text in texts:
        all_documents.append(text)
        all_metadatas.append({"source": "scenic_spots", "spot_id": spot["id"], "spot_name": spot["name"]})
        all_ids.append(f"spot_{doc_id}")
        doc_id += 1

# 1b. 指南知识
if os.path.exists(guide_path):
    with open(guide_path, "r", encoding="utf-8-sig") as f:
        guides = json.loads(f.read())
    for guide in guides:
        all_documents.append(guide["content"])
        all_metadatas.append({"source": "guide", "title": guide["title"]})
        all_ids.append(f"guide_{doc_id}")
        doc_id += 1

# 1c. 推荐路线数据
if os.path.exists(routes_path):
    with open(routes_path, "r", encoding="utf-8-sig") as f:
        routes_data = json.loads(f.read())
    for route in routes_data.get("routes", []):
        spot_names = []
        for sid in route["spots"]:
            for spot in spots:
                if spot["id"] == sid:
                    spot_names.append(spot["name"])
        text = f"推荐路线：{route['name']}\n时长：{route['duration']}\n适合：{'、'.join(route['tags'])}\n说明：{route['description']}\n景点：{' → '.join(spot_names)}"
        all_documents.append(text)
        all_metadatas.append({"source": "routes", "route_name": route["name"]})
        all_ids.append(f"route_{doc_id}")
        doc_id += 1
    for qa in routes_data.get("sample_questions", []):
        text = f"问题：{qa['question']}\n答案：{qa['answer']}"
        all_documents.append(text)
        all_metadatas.append({"source": "qa"})
        all_ids.append(f"qa_{doc_id}")
        doc_id += 1

# 2. 重建知识库
client = chromadb.PersistentClient(path=os.path.join(os.path.dirname(__file__), "chromadb_data"))
try:
    client.delete_collection("scenic_spots")
except:
    pass

chinese_embeddings = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=model_path)
collection = client.create_collection(name="scenic_spots", embedding_function=chinese_embeddings)

batch_size = 50
for i in range(0, len(all_documents), batch_size):
    collection.add(
        documents=all_documents[i:i+batch_size],
        metadatas=all_metadatas[i:i+batch_size],
        ids=all_ids[i:i+batch_size]
    )

print(f"知识库已建好，共 {len(all_documents)} 条知识片段")
print(f"  - 景点数据：{sum(1 for m in all_metadatas if m['source']=='scenic_spots')} 条")
print(f"  - 指南知识：{sum(1 for m in all_metadatas if m['source']=='guide')} 条")
print(f"  - 推荐路线：{sum(1 for m in all_metadatas if m['source']=='routes')} 条")
print(f"  - 常见问题：{sum(1 for m in all_metadatas if m['source']=='qa')} 条")