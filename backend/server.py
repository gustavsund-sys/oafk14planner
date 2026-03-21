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