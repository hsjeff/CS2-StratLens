from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
import shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "CS2 StratLens backend is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cs2-stratlens-backend"
    }


@app.get("/round")
def get_round_data():
    file_path = Path("data/sample_round.json")

    with file_path.open("r") as file:
        round_data = json.load(file)

    return round_data   

@app.post("/upload-demo")
async def upload_demo(file: UploadFile = File(...)):
    if file.filename is None or not file.filename.lower().endswith(".dem"):
        raise HTTPException(
            status_code=400,
            detail="Only .dem files are supported for now."
        )

    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "message": "Demo uploaded successfully.",
        "filename": file.filename,
        "savedTo": str(file_path),
        "nextStep": "Parsing will be added later."
    }