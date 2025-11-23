# backend/main.py
import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import your agent and TTS
from agent import InterviewAgent          # Make sure agent.py is in same folder
# from tts import synthesize_text           # Your TTS function

# -------------------------------
# Load environment variables
# -------------------------------
load_dotenv()

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", 8000))

# -------------------------------
# FastAPI app
# -------------------------------
app = FastAPI(title="Interview Practice Partner Backend")

# CORS (only for development!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# In-memory session store (use Redis in production)
# -------------------------------
SESSIONS: dict[str, InterviewAgent] = {}

# -------------------------------
# Request Models
# -------------------------------
class StartRequest(BaseModel):
    role: str = "Senior Python Developer"

class MessageRequest(BaseModel):
    session_id: str
    text: str

class TTSRequest(BaseModel):
    text: str

# -------------------------------
# Routes
# -------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "active_sessions": len(SESSIONS)}

@app.post("/start")
def start_session(req: StartRequest):
    # Use UUID instead of incremental int (more reliable)
    session_id = str(uuid.uuid4())
    
    agent = InterviewAgent(role=req.role)
    SESSIONS[session_id] = agent

    try:
        first_question = agent.start()
        return {
            "session_id": session_id,
            "reply": first_question
        }
    except Exception as e:
        # Clean up failed session
        SESSIONS.pop(session_id, None)
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@app.post("/message")
def send_message(req: MessageRequest):
    agent = SESSIONS.get(req.session_id)
    if not agent:
        raise HTTPException(status_code=400, detail="Invalid or expired session_id")

    try:
        result = agent.handle_user(req.text)
        return {
            "reply": result["reply"],
            "history_count": result["history_count"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")

@app.post("/tts")
def tts_endpoint(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        audio_data = synthesize_text(req.text)
        if audio_data.get("error"):
            raise Exception(audio_data["error"])
        return audio_data  # Should contain base64 audio or URL
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

# Optional: Clean up old sessions (run this via background task later)
@app.delete("/session/{session_id}")
def end_session(session_id: str):
    if SESSIONS.pop(session_id, None):
        return {"status": "session ended"}
    raise HTTPException(status_code=404, detail="Session not found")


