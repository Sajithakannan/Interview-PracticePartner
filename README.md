 # Interview-PracticePartner
# 1. Project Overview

This project is an intelligent Interview Practice Partner designed to help users prepare for real job interviews.
It simulates a human interviewer using AI-driven conversations, follow-up questions, voice input/output, and performance scoring.

Users can choose:

Practice Interview Mode → conversational voice interview with dynamic follow-ups

Assessment Mode →  questions with automatic scoring to check candiadate knowledge

History Tracking → previous scores and roles stored and shown on home page

# 2. Features
# Interview Simulation

AI agent asks realistic interview questions

Adjusts tone and complexity depending on user responses

Supports multiple job roles (developer, sales, data scientist, engineer, etc.)

# Voice Interaction

Input: Microphone → Speech-to-text

Output: AI speaks questions using text-to-speech

Smooth real-time communication experience

# Assessment & Feedback

Automatic scoring based on candidate performance

AI-generated feedback and score based on communication, clarity, and technical accuracy

Summary shown at the end

Score and feedback stored and displayed on home page

# Session History

Role

Score

Interview type (Practice/Assessment)

Timestamp

# 3. Tech Stack
# Frontend

HTML

CSS

JavaScript

Web Speech API (for TTS & STT)

# Backend

FastAPI (Python)

OpenAI / Gemini LLM

ElevenLabs (optional) for natural TTS

Custom scoring logic

# 4. Run the project
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Environment Variables (env)
OPENAI_API_KEY=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
HOST=http://127.0.0.1:8000

# 5. Usage Instructions
# Home Page

Enter name

Choose Practice or Assessment

History loads automatically

# Practice Interview

AI interviewer asks dynamic questions

User answers via voice or text

AI follows up with next question like real interviewer

Final feedback shown

# Assessment

Timing based Technical questions for checking candidate knowledge

Timer for each

Final score stored


# 6. Design Decisions (Required for Evaluation)
# I. Prioritizing Conversation Quality

Follow-up questions generated based on user intent

Clarification prompts when user answer is incomplete

Agent asks deeper questions like real interviewer

# II. Handling Edge Cases

User confused → AI simplifies question

User talking off-topic → AI redirects politely

User provides invalid answers → AI prompts clarification

Chatty user → AI summarizes and moves conversation

# III. Adaptive Intelligence

Backend evaluates response length, clarity, relevance

Higher score for structured answers (STAR method)

Lower score if answer is vague or irrelevant

# IV. Voice-first Design

Uses real-time TTS to sound more natural

Reads every question aloud

Auto-listens after question ends

# 7. Test Scenarios 
# Confused User

“I don’t understand the question…”
AI simplifies:
“No problem, let me reframe it for you.”

# Efficient User

Gives short direct answers
AI adapts:

“Great. Could you elaborate slightly on your past experience?”

# Chatty User

AI politely keeps them on track:

“Thank you! Let me summarize what you said…”

# Edge-Case Input

“asdfgh… I don’t know what to say”
AI guides them:
“Take your time. Maybe describe your last project?”

