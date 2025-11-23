import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

messages = [
    {"role": "system", "content": "You are a professional interviewer."},
    {"role": "user", "content": "I have 3 years of experience in software development."}
]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages
)

print(response.choices[0].message["content"])
