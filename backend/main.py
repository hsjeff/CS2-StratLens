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

players = [
    {
        "id": "T1",
        "name": "T Player 1",
        "team": "T",
        "path": [
            {"time": 0, "x": 20, "y": 70},
            {"time": 1, "x": 25, "y": 65},
            {"time": 2, "x": 30, "y": 60},
        ],
    }
]

utilities = [
    {
        "id": 1,
        "name": "Window Smoke",
        "type": "Smoke",
        "throwerId": "T1",
        "throwTime": 1.0,
        "landTime": 2.0,
        "expireTime": 8.0,
        "startX": 25,
        "startY": 65,
        "landX": 45,
        "landY": 52,
        "radius": 8,
        "description": "Blocks connector vision for mid control.",
    }
]


@app.get("/")
def read_root():
    return {"message": "CS2 StratLens backend is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "cs2-stratlens-backend"
    }


@app.get("/api/round")
def get_round_data():
    return {
        "map": "mirage",
        "players": players,
        "utilities": utilities,
    }