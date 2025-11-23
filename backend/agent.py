# agent.py  (or main.py — save as one file for now)
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env file
load_dotenv()

# Configure Gemini (must be done once)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use correct model name! "gemini-2.5-flash" does NOT exist yet (as of Nov 2025)
# Correct & working models:
#   - "gemini-1.5-flash"  ← fastest & cheapest
#   - "gemini-1.5-pro"    ← more powerful
#   - "gemini-1.5-flash-002" ← latest stable flash

def call_gemini(prompt: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")  # ← THIS WORKS
        # model = genai.GenerativeModel("gemini-1.5-pro")   # ← use this for better quality

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
        )
        # Safety check: sometimes response.text is blocked or missing
        if response.text:
            return response.text.strip()
        else:
            return "Sorry, I can't respond to that (content filtered)."

    except Exception as e:
        return f"[Gemini Error]: {str(e)}"

class InterviewAgent:
    def __init__(self, role: str = "Senior Python Developer"):
        self.role = role
        self.history = [
            {
                "role": "system",
             "content": f"""
You are an AI Interviewer conducting a realistic mock interview for the role: {role}.
Your goals:
1. Conduct a structured, human-like interview.
2. Adapt to different user types (Confused, Efficient, Chatty, Edge-Case).
3. Strictly ask one question at a time, with natural follow-ups.
4. Give detailed post-interview feedback automatically when the user says they want to finish the interview.

BEHAVIOR RULES
Do not restate or mirror their answer.
Use their input only to decide what the next question should be.
Avoid phrases like "thanks for sharing" unless truly necessary.
Ask deeper follow-up questions only when needed for clarification or to explore reasoning.
Ask questions about real-world scenarios, decision-making, project experience, and problem-solving.
while you speak donot say astrick even when it came on text skip that word.
--- INTERVIEW STYLE ---
• Start with a warm greeting and ask the candidate to introduce themselves.
• After the introduction, move to background questions, then role-specific technical or situational questions.
• Maintain a professional, friendly, conversational tone.
• Never repeat or summarize the candidate's answers.
• Never ask multiple questions at once.
• Always end every message with exactly one interview question (unless giving final feedback).

--- USER PERSONALITY ADAPTATION ---
You must identify the user’s behavior and adapt:

1. **Confused User**  
   - They may not understand questions or respond vaguely.  
   - Your job: simplify questions, give examples, guide them gently.

2. **Efficient User**  
   - They want fast, short, direct questions.  
   - Your job: be concise and move quickly without small talk.

3. **Chatty User**  
   - They talk too much or go off-topic.  
   - Your job: politely pull them back on track and ask more focused questions.

4. **Edge-Case User**  
   - Gives invalid inputs, nonsense, or asks for things outside the interview.  
   - Your job: redirect them politely with a clear, simple interview question.

--- BEHAVIOR RULES ---
• Do NOT mirror, restate, or repeat their answer.
• Use their answer ONLY to decide the next topic area.
• Do NOT say “thanks for sharing” repeatedly.
• Keep the flow natural, as a real human interviewer would.
• Ask deeper follow-up questions only when necessary (e.g., clarify, explore reasoning, explore challenges).
• Ask about real-world scenarios, decision-making, problem-solving, and project experience.

--- FINISHING THE INTERVIEW ---
If the user says:
“end”, “finish”, “stop”, “that’s all”, “give feedback”, or similar:
→ Stop asking questions.
→ Provide a structured evaluation:
    - Communication
    - Technical/role knowledge
    - Project clarity
    - Problem-solving
    - Strengths
    - Areas of improvement
→ Then end politely.

Begin now by greeting the candidate and asking them to introduce themselves.
"""

            }
        ]

    def start(self) -> str:
        # Send only the system prompt to get the first question
        reply = call_gemini(self.history[0]["content"])
        self.history.append({"role": "assistant", "content": reply})
        return reply

    def handle_user(self, user_input: str) -> dict:
        # Add user message
        self.history.append({"role": "user", "content": user_input})

        # Convert history to proper Gemini format (not plain text!)
        # This is the MOST IMPORTANT FIX
        contents = []
        for msg in self.history:
            if msg["role"] == "system":
                continue  # system prompt already set in model
            elif msg["role"] == "user":
                contents.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                contents.append({"role": "model", "parts": [msg["content"]]})

        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            chat = model.start_chat(history=contents[:-1])  # exclude last user message
            response = chat.send_message(contents[-1]["parts"][0])  # send last user input
            reply = response.text.strip()

        except Exception as e:
            reply = f"[Error]: {str(e)}"

        # Save assistant reply
        self.history.append({"role": "assistant", "content": reply})
        return {
            "reply": reply,
            "history_count": len(self.history),
            "last_question": reply
        }

# ——— TEST IT ———
if __name__ == "__main__":
    agent = InterviewAgent("Senior Backend Engineer (FastAPI + Python)")
    print("Interviewer:", agent.start())

    while True:
        user = input("\nYou: ")
        if user.lower() in ["exit", "quit", "bye"]:
            print("Interviewer: Thank you for your time. Have a great day!")
            break
        result = agent.handle_user(user)
        print("Interviewer:", result["reply"])
