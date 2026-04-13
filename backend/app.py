# uvicorn app:app --reload  
import os
import json
import time
import hashlib
from pathlib import Path
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# =========================
# 基础配置
# =========================
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
VIDEOS_DIR = BASE_DIR / "videos"
CACHE_FILE = BASE_DIR / "cache.json"

load_dotenv(dotenv_path=ENV_PATH)

app = FastAPI()

app.mount("/images", StaticFiles(directory="images"), name="images")
@app.get("/")
def root():
    return {"message": "server is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VIDEOS_DIR.mkdir(exist_ok=True)

if not CACHE_FILE.exists():
    CACHE_FILE.write_text("{}", encoding="utf-8")

app.mount("/videos", StaticFiles(directory=str(VIDEOS_DIR)), name="videos")

DID_API_KEY = os.getenv("DID_API_KEY")
DID_BASE_URL = "https://api.d-id.com"

if not DID_API_KEY:
    raise RuntimeError("DID_API_KEY 未设置，请检查 backend/.env 文件")

HEADERS = {
    "Authorization": f"Basic {DID_API_KEY}",
    "Content-Type": "application/json",
    "accept": "application/json",
}

# =========================
# 你的 3 段固定脚本
# =========================
source_url = 'https://i.postimg.cc/qBXVJ3m0/boy.png'
SCRIPTS = {
    "welcome": {
        "text": (
            "Hello, welcome to JCU Ideas Lab. "
        ),
        "voice_id": "en-US-GuyNeural",
        "source_url": source_url,
    },
    "intro": {
        "text": (
            "Hello, I am the JCU Ideas Lab Assistant. "
        ),
        "voice_id": "en-US-GuyNeural",
        "source_url": source_url,
    },
    "bye": {
        "text": (
            "Thank you for visiting JCU Ideas Lab."
        ),
        "voice_id": "en-US-GuyNeural",
        "source_url": source_url,
    },
}

# =========================
# 工具函数
# =========================
def load_cache() -> dict:
    with open(CACHE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_cache(cache_data: dict) -> None:
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)

def make_cache_key(script_name: str, text: str, voice_id: str, source_url: str) -> str:
    raw = f"{script_name}|{text}|{voice_id}|{source_url}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest()

def filename_from_key(cache_key: str) -> str:
    return f"{cache_key}.mp4"

def download_video(url: str, save_path: Path) -> None:
    response = requests.get(url, stream=True, timeout=120)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="下载生成视频失败")

    with open(save_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

def create_did_video(text: str, voice_id: str, source_url: str) -> str:
    payload = {
        "source_url": source_url,
        "script": {
            "type": "text",
            "input": text,
            "provider": {
                "type": "microsoft",
                "voice_id": voice_id
            }
        },
        "name": "JCU IDEAS LAB AVATAR"
    }

    create_res = requests.post(
        f"{DID_BASE_URL}/talks",
        json=payload,
        headers=HEADERS,
        timeout=60
    )

    if create_res.status_code not in (200, 201):
        raise HTTPException(
            status_code=create_res.status_code,
            detail=create_res.text
        )

    create_data = create_res.json()
    talk_id = create_data.get("id")

    if not talk_id:
        raise HTTPException(status_code=500, detail="D-ID 未返回 talk id")

    # 轮询状态
    max_retries = 20
    for _ in range(max_retries):
        status_res = requests.get(
            f"{DID_BASE_URL}/talks/{talk_id}",
            headers=HEADERS,
            timeout=60
        )

        if status_res.status_code != 200:
            raise HTTPException(
                status_code=status_res.status_code,
                detail=status_res.text
            )

        status_data = status_res.json()
        status = status_data.get("status")

        if status == "done":
            result_url = status_data.get("result_url")
            if not result_url:
                raise HTTPException(status_code=500, detail="D-ID 未返回 result_url")
            return result_url

        if status in ("error", "failed", "rejected"):
            raise HTTPException(status_code=500, detail=status_data)

        time.sleep(3)

    raise HTTPException(status_code=504, detail="视频生成超时，请稍后重试")

def generate_or_get_cached_video(script_name: str) -> dict:
    if script_name not in SCRIPTS:
        raise HTTPException(status_code=404, detail="未知脚本")

    config = SCRIPTS[script_name]
    text = config["text"]
    voice_id = config["voice_id"]
    source_url = config["source_url"]

    cache_key = make_cache_key(script_name, text, voice_id, source_url)
    filename = filename_from_key(cache_key)
    local_path = VIDEOS_DIR / filename

    cache_data = load_cache()

    # 命中缓存
    if cache_key in cache_data and local_path.exists():
        return {
            "success": True,
            "cached": True,
            "script": script_name,
            "video_url": f"http://127.0.0.1:8000/videos/{filename}"
        }

    # 调 D-ID 生成
    result_url = create_did_video(
        text=text,
        voice_id=voice_id,
        source_url=source_url,
    )

    # 下载到本地
    download_video(result_url, local_path)

    # 更新缓存
    cache_data[cache_key] = {
        "script": script_name,
        "filename": filename,
        "text": text,
        "voice_id": voice_id,
        "source_url": source_url,
    }
    save_cache(cache_data)

    return {
        "success": True,
        "cached": False,
        "script": script_name,
        "video_url": f"http://127.0.0.1:8000/videos/{filename}"
    }

# =========================
# 路由
# =========================
@app.get("/")
def home():
    return {"message": "FastAPI is running"}

@app.get("/ping")
def ping():
    return {"ok": True, "file": "app.py"}

@app.post("/video/welcome")
def video_welcome():
    return generate_or_get_cached_video("welcome")

@app.post("/video/intro")
def video_intro():
    return generate_or_get_cached_video("intro")

@app.post("/video/bye")
def video_bye():
    return generate_or_get_cached_video("bye")