from fastapi import FastAPI, Request, Form, UploadFile, File, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from pydantic import BaseModel
import secrets
import shutil
import os
from datetime import datetime
from zoneinfo import ZoneInfo
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import sessionmaker, declarative_base

# IST timezone
IST = ZoneInfo("Asia/Kolkata")

app = FastAPI()

# CORS must come before endpoints
# Prioritize ALLOWED_ORIGIN_HOST from Render blueprint over ALLOWED_ORIGIN
allowed_origin_host = os.environ.get("ALLOWED_ORIGIN_HOST")
if allowed_origin_host:
    # Strip port if present
    host_clean = allowed_origin_host.split(":")[0]
    # Render's host property only gives service name, need to append .onrender.com
    if not host_clean.endswith('.onrender.com'):
        allowed_origin = f"https://{host_clean}.onrender.com"
    else:
        allowed_origin = f"https://{host_clean}"
else:
    # Fallback to ALLOWED_ORIGIN if ALLOWED_ORIGIN_HOST not set
    allowed_origin = os.environ.get("ALLOWED_ORIGIN", "")
    if not allowed_origin:
        allowed_origin = "http://localhost:5173"

# Log CORS configuration for debugging
import sys
print(f"CORS allowed_origin: {allowed_origin}", file=sys.stderr)
print(f"ALLOWED_ORIGIN env: {os.environ.get('ALLOWED_ORIGIN', 'NOT SET')}", file=sys.stderr)
print(f"ALLOWED_ORIGIN_HOST env: {os.environ.get('ALLOWED_ORIGIN_HOST', 'NOT SET')}", file=sys.stderr)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug middleware to log CORS-related headers
@app.middleware("http")
async def cors_debug_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    if origin:
        print(f"Request origin: {origin}", file=sys.stderr)
        print(f"Allowed origin: {allowed_origin}", file=sys.stderr)
    response = await call_next(request)
    return response

# Map short username to (full name, password)
USERS = {
    "tanish": ("Tanish Bajaj", "chakkatanish"),
    "naman": ("Naman Kapoor", "chakkanaman"),
    "ansh": ("Ansh Mangla", "chakkaansh")
}
SESSIONS = {}

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)
# app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# # --- DB Setup ---
# Base = declarative_base()
# engine = create_engine("sqlite:///./events.db", connect_args={"check_same_thread": False})
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Uploads directory (ephemeral on free plan). Can be overridden via env.
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- DB Setup ---
Base = declarative_base()
# Use current working directory for SQLite (ephemeral on free tier)
# Ensure the database file is in a writable location
if "DATABASE_URL" in os.environ and not os.environ["DATABASE_URL"].startswith("sqlite"):
    # Use provided DATABASE_URL (e.g., PostgreSQL)
    db_url = os.environ["DATABASE_URL"]
else:
    # For SQLite, use absolute path in current working directory
    cwd = os.getcwd()
    db_file = os.path.join(cwd, "events.db")
    db_url = f"sqlite:///{db_file}"

engine = create_engine(db_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    note = Column(Text)
    time_mode = Column(String, nullable=False)
    timestamp = Column(String)  # ISO string if 'earlier'
    username = Column(String, nullable=False)
    photo = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(IST))

Base.metadata.create_all(bind=engine)

class EventIn(BaseModel):
    title: str
    note: Optional[str]
    time_mode: str
    timestamp: Optional[str]

class EventOut(EventIn):
    username: str
    photo: Optional[str]
    created_at: str

async def get_current_user(request: Request):
    sessionid = request.cookies.get("sessionid")
    if not sessionid or sessionid not in SESSIONS:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return SESSIONS[sessionid]

@app.post("/login")
def login(response: Response, username: str = Form(...), password: str = Form(...)):
    userinfo = USERS.get(username)
    if userinfo and userinfo[1] == password:
        sessionid = secrets.token_hex(16)
        SESSIONS[sessionid] = userinfo[0]  # full name
        # Cross-site cookie for separate frontend/backend hosts
        response.set_cookie(
            key="sessionid",
            value=sessionid,
            httponly=True,
            secure=True,
            samesite="none",
        )
        return {"message": "Login successful", "username": userinfo[0]}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/logout")
def logout(request: Request, response: Response):
    sid = request.cookies.get("sessionid")
    if sid in SESSIONS:
        del SESSIONS[sid]
    # Mirror cookie attributes when deleting
    response.delete_cookie(
        key="sessionid",
        secure=True,
        samesite="none",
    )
    return {"message": "Logged out"}

@app.post("/events", response_model=EventOut)
def add_event(
    request: Request,
    title: str = Form(...),
    note: str = Form(None),
    time_mode: str = Form(...),
    timestamp: str = Form(None),
    file: Optional[UploadFile] = File(None),
    user: str = Depends(get_current_user)
):
    photo = None
    if file:
        photo_fn = f"{datetime.now(IST).timestamp()}_{file.filename}"
        path = os.path.join(UPLOAD_DIR, photo_fn)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        photo = f"/uploads/{photo_fn}"
    created_at = datetime.now(IST)
    db = SessionLocal()
    evt = Event(
        title=title,
        note=note,
        time_mode=time_mode,
        timestamp=timestamp,
        username=user,
        photo=photo,
        created_at=created_at
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    # Ensure created_at is timezone-aware (IST) for ISO format
    if evt.created_at.tzinfo is None:
        created_at_ist = evt.created_at.replace(tzinfo=IST)
    else:
        created_at_ist = evt.created_at
    db.close()
    return {
        "title": evt.title,
        "note": evt.note,
        "time_mode": evt.time_mode,
        "timestamp": evt.timestamp,
        "username": evt.username,
        "photo": evt.photo,
        "created_at": created_at_ist.isoformat()
    }

@app.get("/events")
def list_events(user: Optional[str] = None, date: Optional[str] = None, agg: Optional[str] = None):
    db = SessionLocal()
    q = db.query(Event)
    if user:
        q = q.filter(Event.username == user)

    def serialize(e):
        # Ensure created_at is timezone-aware (IST) for ISO format
        if e.created_at.tzinfo is None:
            created_at_ist = e.created_at.replace(tzinfo=IST)
        else:
            created_at_ist = e.created_at
        return {
            "title": e.title,
            "note": e.note,
            "time_mode": e.time_mode,
            "timestamp": e.timestamp,
            "username": e.username,
            "photo": e.photo,
            "created_at": created_at_ist.isoformat()
        }

    if agg == "daily":
        results = db.query(func.date(Event.created_at).label("dt")).group_by("dt").all()
        groups = []
        for (dt,) in results:
            evs = q.filter(func.date(Event.created_at) == dt).all()
            groups.append({
                "date": str(dt),
                "count": len(evs),
                "events": [serialize(e) for e in evs] if evs else []
            })
        db.close()
        return groups
    elif agg == "monthly":
        results = db.query(func.strftime("%Y-%m", Event.created_at).label("m")).group_by("m").all()
        groups = []
        for (m,) in results:
            evs = q.filter(func.strftime("%Y-%m", Event.created_at) == m).all()
            groups.append({
                "month": m,
                "count": len(evs),
                "events": [serialize(e) for e in evs] if evs else []
            })
        db.close()
        return groups

    # Default: ungrouped
    evts = [serialize(e) for e in q.all()]
    db.close()
    return evts

@app.get("/me")
def me(request: Request):
    sessionid = request.cookies.get("sessionid")
    if not sessionid or sessionid not in SESSIONS:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"username": SESSIONS[sessionid]}

@app.get("/")
def read_root():
    return {"msg": "Daily Logbook backend running!"}
