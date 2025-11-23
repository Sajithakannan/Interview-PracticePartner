import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

resp = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "system", "content": "Say hi"}],
    timeout=15
)
print(resp.choices[0].message["content"])
