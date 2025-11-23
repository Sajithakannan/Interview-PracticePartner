# backend/tts.py
import os
import requests
import base64
from dotenv import load_dotenv

load_dotenv()
ELEVEN_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVEN_VOICE = os.getenv("ELEVENLABS_VOICE_ID", "alloy")

if not ELEVEN_KEY:
    print("ElevenLabs API key not set in .env. /tts will return error if used.")

def synthesize_text(text: str) -> dict:
    """
    Call ElevenLabs TTS and return base64-encoded audio + mime.
    See https://elevenlabs.io/docs for exact API details; adjust headers/payload as needed.
    """
    if not ELEVEN_KEY:
        return {"error": "ElevenLabs API key not configured."}

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE}"
    headers = {
        "xi-api-key": ELEVEN_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "voice_settings": {"stability": 0.6, "similarity_boost": 0.75}
    }
    try:
        r = requests.post(url, json=payload, headers=headers, timeout=20)
        r.raise_for_status()
        audio_bytes = r.content
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return {"audio_base64": audio_b64, "mime": "audio/mpeg"}
    except Exception as e:
        return {"error": str(e)}
