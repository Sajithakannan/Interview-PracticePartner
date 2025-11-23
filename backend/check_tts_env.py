import os
from dotenv import load_dotenv

load_dotenv()
print("ELEVENLABS_API_KEY:", os.getenv("ELEVENLABS_API_KEY"))
print("ELEVENLABS_VOICE_ID:", os.getenv("ELEVENLABS_VOICE_ID"))
