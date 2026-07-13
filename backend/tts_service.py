import edge_tts
import base64
import tempfile
import os

VOICE = "zh-CN-XiaoxiaoNeural"

async def text_to_speech(text: str) -> str:
    """文字 → 语音base64"""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        output_path = f.name
    try:
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(output_path)
        with open(output_path, "rb") as f:
            audio_data = base64.b64encode(f.read()).decode()
        return audio_data
    finally:
        if os.path.exists(output_path):
            os.remove(output_path)
