# 阿里云百炼 API Key（三位队友共用）
DASHSCOPE_API_KEY = "sk-ws-H.EMRYIPY.7pj4.MEQCIDuyaExpsYQ3dqeVoE3rNFlODkonWhOx4hJkcgJAjoT3AiBda61-uEigTXJY2ybD1gqlTV5aVAaWrDxKFGfLrhQ34A"

from openai import OpenAI

client = OpenAI(
    api_key=DASHSCOPE_API_KEY,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

def call_qwen(prompt: str) -> str:
    """调用通义千问API"""
    try:
        response = client.chat.completions.create(
            model="qwen-plus",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"出错：{str(e)}"

# 测试
if __name__ == "__main__":
    result = call_qwen("你好，请简单介绍一下灵山胜境")
    print("API返回：", result)