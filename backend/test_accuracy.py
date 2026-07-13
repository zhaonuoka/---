"""
RAG 准确度测试脚本
用法：python test_accuracy.py
说明：不改任何代码，只测试现有 RAG 问答的准确度
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from rag_chain import chat

test_cases = [
    ("灵山大佛多高？", ["88米", "米"]),
    ("九龙灌浴几点表演？", ["10:", "11:", "13:", "15:"]),
    ("五明桥代表什么？", ["智慧", "声明", "因明", "内明"]),
    ("灵山胜境和唐僧的关系？", ["玄奘", "小灵山"]),
    ("带孩子去推荐什么路线？", ["亲子", "欢乐"]),
    ("喜欢自然风光推荐去哪？", ["自然", "休闲"]),
    ("带老人去走什么路线比较好？", ["自然", "休闲", "轻松"]),
    ("门票多少钱？", ["门票", "价格", "查询"]),
    ("景区有观光车吗？", ["有", "40"]),
    ("灵山胜境几点开门几点关门？", ["8:", "17:", "开放"]),
    ("景区内有什么吃的？", ["素斋", "吃"]),
    ("怎么去灵山胜境？", ["公交", "88", "89"]),
    ("佛足坛有什么特殊含义？", ["佛祖", "脚印", "吉祥"]),
    ("灵山梵宫有什么值得看的？", ["梵宫", "卢浮宫", "吉祥颂"]),
    ("拈花湾有什么好玩的？", ["拈花", "花海", "灯光"]),
    ("下雨天去灵山胜境合适吗？", ["室内", "雨天"]),
    ("去灵山胜境穿什么比较好？", ["运动鞋", "舒适"]),
    ("拈花湾晚上有什么好玩的？", ["灯光", "夜景"]),
    ("灵山梵宫吉祥颂演出几点？", ["10:", "14:", "16:"]),
]

def test():
    print("=" * 60)
    print("  RAG 准确度测试")
    print("=" * 60)
    total = len(test_cases)
    passed = 0
    for i, (question, keywords) in enumerate(test_cases, 1):
        print(f"[{i}/{total}] 问：{question}")
        try:
            answer = chat(question)
            print(f"   答：{answer[:100]}")
            matched = [kw for kw in keywords if kw in answer]
            if matched:
                print(f"   ✅ 匹配到：{matched}")
                passed += 1
            else:
                print(f"   ❌ 未匹配：{keywords}")
        except Exception as e:
            print(f"   ❌ 报错：{e}")
        print()
    print(f"结果：{passed}/{total} 通过（{passed/total*100:.0f}%）")

if __name__ == "__main__":
    test()