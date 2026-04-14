# uvicorn main:app --reload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI is running"}

@app.post("/video")
def create_video(text: str):

    return {
        "success": True,
        "text": text,
        "video_url": "https://www.w3schools.com/html/mov_bbb.mp4"
    }