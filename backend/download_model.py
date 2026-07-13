"""
下载 BAAI/bge-small-zh-v1.5 模型
先用 ModelScope 下载，如果失败再用 HuggingFace 镜像
"""
import os, sys, subprocess

CACHE_DIR = os.path.join(os.path.dirname(__file__), "model_cache")

def try_modelscope():
    """从阿里云ModelScope下载"""
    try:
        from modelscope.hub.snapshot_download import snapshot_download
        print("从 ModelScope 下载模型中...")
        model_dir = snapshot_download("BAAI/bge-small-zh-v1.5", cache_dir=CACHE_DIR)
        print(f"模型下载成功：{model_dir}")
        return model_dir
    except Exception as e:
        print(f"ModelScope 下载失败：{e}")
        return None

def try_hf_mirror():
    """从 HuggingFace 镜像下载"""
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
    try:
        from huggingface_hub import snapshot_download
        print("从 HuggingFace 镜像下载模型中...")
        model_dir = snapshot_download("BAAI/bge-small-zh-v1.5", cache_dir=CACHE_DIR)
        print(f"模型下载成功：{model_dir}")
        return model_dir
    except Exception as e:
        print(f"HuggingFace 镜像下载失败：{e}")
        return None

def try_direct():
    """直接从 huggingface 下载"""
    try:
        from huggingface_hub import snapshot_download
        print("从 HuggingFace 直连下载模型中...")
        model_dir = snapshot_download("BAAI/bge-small-zh-v1.5", cache_dir=CACHE_DIR)
        print(f"模型下载成功：{model_dir}")
        return model_dir
    except Exception as e:
        print(f"HuggingFace 直连下载失败：{e}")
        return None

if __name__ == "__main__":
    print("=" * 40)
    print("下载中文向量模型 BAAI/bge-small-zh-v1.5")
    print("=" * 40)
    
    # 尝试三种方式
    result = try_modelscope()
    if not result:
        result = try_hf_mirror()
    if not result:
        result = try_direct()
    
    if result:
        print("\n模型下载成功！可以运行 init_kb.py 了")
    else:
        print("\n三种方式都失败，请手动下载模型：")
        print("1. 前往 https://www.modelscope.cn/models/BAAI/bge-small-zh-v1.5")
        print("2. 下载后放到 model_cache 目录")
        print("3. 再运行 python init_kb.py")
