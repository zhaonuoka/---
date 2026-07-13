"""
一键初始化脚本：建数据库 + 建知识库
"""
import os

print("=" * 40)
print("第1步：初始化数据库")
print("=" * 40)
from database import init_db
init_db()

print("\n" + "=" * 40)
print("第2步：重建RAG知识库")
print("=" * 40)
exec(open(os.path.join(os.path.dirname(__file__), "rag_knowledge.py"), encoding="utf-8").read())

print("\n全部初始化完成！")
print("运行 python main.py 启动后端")
