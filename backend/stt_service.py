import os
import tempfile
from faster_whisper import WhisperModel

print(" 加载语音识别模型（tiny）...")
model = WhisperModel("tiny", device="cpu", compute_type="int8")
print(" 语音识别模型加载完成")

def transcribe(audio_bytes: bytes) -> str:
    """音频字节  文字（兼容多种格式）"""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        tmp_path = f.name

    try:
        segments, info = model.transcribe(tmp_path, beam_size=5)
        text = "".join([seg.text for seg in segments])
        result = text.strip()
        print(f"  识别结果：【{result}】")
        return result if result else "未识别到语音"
    except Exception as e:
        print(f"  识别出错：{e}")
        return f"识别出错：{str(e)}"
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
