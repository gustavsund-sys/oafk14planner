from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
import random
import string
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


def generate_share_code():
    """Generate a short, readable share code like OSTRA-A7K2"""
    chars = string.ascii_uppercase + string.digits
    # Remove confusing characters
    chars = chars.replace('O', '').replace('0', '').replace('I', '').replace('1', '').replace('L', '')
    code = ''.join(random.choices(chars, k=4))
    return f"OSTRA-{code}"


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# Squad Models
class PlayerPosition(BaseModel):
    player: dict
    x: float
    y: float

class MatchInfo(BaseModel):
    opponent: Optional[str] = ""
    date: Optional[str] = ""
    time: Optional[str] = ""
    location: Optional[str] = ""

class SharedSquad(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    code: str
    name: str
    playersOnPitch: List[dict] = []
    playersOnSubs: List[dict] = []
    matchInfo: Optional[dict] = None
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ShareSquadRequest(BaseModel):
    name: str
    playersOnPitch: List[dict] = []
    playersOnSubs: List[dict] = []
    matchInfo: Optional[dict] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# Player management endpoints
@api_router.get("/players")
async def get_players():
    """Get all players"""
    players = await db.players.find({}, {"_id": 0}).to_list(100)
    
    # If no players exist, seed with initial data
    if not players:
        initial_players = [
            {"id": 1, "number": 2, "name": "Edgar Zakaryan", "image": "/players/player_2.png"},
            {"id": 2, "number": 3, "name": "Alfred Strandberg", "image": "/players/player_3.png"},
            {"id": 3, "number": 4, "name": "Ebbe Israelsson", "image": "/players/player_4.png"},
            {"id": 4, "number": 6, "name": "Frans Rindhoff", "image": "/players/player_6.png"},
            {"id": 5, "number": 7, "name": "Hugo Wirén", "image": "/players/player_7.png"},
            {"id": 6, "number": 8, "name": "Jack Orrvik", "image": "/players/player_8.png"},
            {"id": 7, "number": 10, "name": "Vincent Johansson", "image": "/players/player_10.png"},
            {"id": 8, "number": 11, "name": "William Hagersten", "image": "/players/player_11.png"},
            {"id": 9, "number": 12, "name": "Melvin Catic", "image": "/players/player_12.png"},
            {"id": 10, "number": 13, "name": "Olle Lundhede", "image": "/players/player_13.png"},
            {"id": 11, "number": 14, "name": "Nils Sjökvist", "image": "/players/player_14.png"},
            {"id": 12, "number": 16, "name": "Kalle Remmegård", "image": "/players/player_16.png"},
            {"id": 13, "number": 17, "name": "William Krey", "image": "/players/player_17.png"},
            {"id": 14, "number": 19, "name": "Milian Inci", "image": "/players/player_19.png"},
            {"id": 15, "number": 20, "name": "Sixten Bejeryd", "image": "/players/player_20.png"},
            {"id": 16, "number": 21, "name": "Ebbe Bergström", "image": "/players/player_21.png"},
            {"id": 17, "number": 22, "name": "Hugo Källén", "image": "/players/player_22.png"},
            {"id": 18, "number": 23, "name": "Thor Buskqvist", "image": "/players/player_23.png"},
            {"id": 19, "number": 24, "name": "Konrad Hallqvist Engman", "image": "/players/player_24.png"},
            {"id": 20, "number": 25, "name": "Hilmer Furåker", "image": "/players/player_25.png"},
            {"id": 21, "number": 26, "name": "Nellion Zetterlöf", "image": "/players/player_26.png"},
            {"id": 22, "number": 27, "name": "Kai Hallden", "image": "/players/player_27.png"},
            {"id": 23, "number": 28, "name": "Charlie Wirlander Beydoun", "image": "/players/player_28.png"},
            {"id": 24, "number": 30, "name": "Vidar Ahltun", "image": "/players/player_30.png"},
        ]
        await db.players.insert_many(initial_players)
        players = initial_players
    
    return players


class PlayerCreate(BaseModel):
    name: str
    number: int
    image: Optional[str] = None


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    number: Optional[int] = None
    image: Optional[str] = None


@api_router.post("/players")
async def create_player(player: PlayerCreate):
    """Add a new player"""
    # Get next ID
    last_player = await db.players.find_one(sort=[("id", -1)])
    new_id = (last_player["id"] + 1) if last_player else 1
    
    new_player = {
        "id": new_id,
        "name": player.name,
        "number": player.number,
        "image": player.image or f"https://ui-avatars.com/api/?name={player.name}&background=171717&color=fff&size=96"
    }
    
    await db.players.insert_one(new_player)
    # Return without _id
    return {"id": new_id, "name": new_player["name"], "number": new_player["number"], "image": new_player["image"]}


@api_router.put("/players/{player_id}")
async def update_player(player_id: int, player: PlayerUpdate):
    """Update a player"""
    update_data = {k: v for k, v in player.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.players.update_one(
        {"id": player_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    updated = await db.players.find_one({"id": player_id}, {"_id": 0})
    return updated


@api_router.delete("/players/{player_id}")
async def delete_player(player_id: int):
    """Delete a player"""
    result = await db.players.delete_one({"id": player_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return {"message": "Player deleted"}


# Squad sharing endpoints
@api_router.post("/squads/share")
async def share_squad(squad: ShareSquadRequest):
    """Create a shareable code for a squad"""
    # Generate unique code
    code = generate_share_code()
    
    # Make sure code is unique
    existing = await db.shared_squads.find_one({"code": code}, {"_id": 0})
    attempts = 0
    while existing and attempts < 10:
        code = generate_share_code()
        existing = await db.shared_squads.find_one({"code": code}, {"_id": 0})
        attempts += 1
    
    doc = {
        "code": code,
        "name": squad.name,
        "playersOnPitch": squad.playersOnPitch,
        "playersOnSubs": squad.playersOnSubs,
        "matchInfo": squad.matchInfo,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.shared_squads.insert_one(doc)
    
    return {"code": code, "name": squad.name}


@api_router.get("/squads/{code}")
async def get_squad(code: str):
    """Get a shared squad by code"""
    # Normalize code (uppercase, handle with or without prefix)
    code = code.upper().strip()
    if not code.startswith("OSTRA-"):
        code = f"OSTRA-{code}"
    
    squad = await db.shared_squads.find_one({"code": code}, {"_id": 0})
    
    if not squad:
        raise HTTPException(status_code=404, detail="Squad not found")
    
    return squad

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()