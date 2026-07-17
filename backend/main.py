from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from pathlib import Path
import shutil
from database import (initialize_database, get_all_utilities,
    get_utility_by_id,
    insert_utility)

app = FastAPI()

initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class UtilityCreate(BaseModel):
    name: str
    type: str
    throwerId: str
    throwTime: float
    landTime: float
    expireTime: float
    startX: float
    startY: float
    landX: float
    landY: float
    radius: float
    description: str

def load_round_data():
    file_path = Path("data/sample_round.json")

    with file_path.open("r") as file:
        round_data = json.load(file)

    return round_data

@app.get("/")
def read_root():
    return {"message": "CS2 StratLens backend is running"}


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "cs2-stratlens-backend"
    }

@app.get("/database-status")
def database_status():
    return {
        "database": "connected",
        "file": "stratlens.db",
        "tables": ["utilities"]
    }

@app.get("/round")
def get_round_data():
    return load_round_data()

@app.get("/players")
def get_players():
    round_data = load_round_data()
    return round_data["players"]

@app.get("/utilities")
def get_utilities():
     return get_all_utilities()

@app.post("/utilities")
def create_utility(utility: UtilityCreate):
    utility_data = utility.model_dump()

    new_id = insert_utility(utility_data)

    created_utility = get_utility_by_id(new_id)

    return created_utility

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