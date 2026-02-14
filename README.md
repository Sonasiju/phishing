🛡 PhishGuard AI
Hybrid AI-Powered Phishing Detection System
📌 Project Description

PhishGuard AI is a full-stack cybersecurity web application designed to detect phishing websites using a multi-layer threat analysis system.

The system combines:

Lexical URL analysis

Web content inspection

Domain intelligence (RDAP-based age verification)

AI-powered cyber reasoning (LLM analysis)

It produces a structured risk assessment including:

Risk Score (0–100)

Risk Level (Low / Medium / High)

Domain Age

Detection Reasons

AI Cyber Intelligence

Score Breakdown (Lexical / Content / AI)

The project demonstrates the integration of traditional cybersecurity heuristics with modern AI-based threat detection.

🚀 Key Features
🔍 Multi-Layer Threat Detection
1️⃣ Lexical URL Analysis

Suspicious keywords detection

IP-based URL detection

Excessive hyphen detection

Long URL detection

Missing HTTPS detection

2️⃣ Content Analysis

Password field detection

Email + password collection detection

POST form detection

External form submission detection

Urgency phrase detection

3️⃣ Domain Intelligence (RDAP)

Fetches domain registration data

Calculates domain age in days

Flags newly registered domains

4️⃣ AI Cyber Intelligence

Uses LLM (Groq – Llama 3)

Analyzes webpage text

Returns structured JSON:

isPhishing

confidence

reasoning

🎨 UI Features

Hacker neon theme

Animated circular risk meter

Scan loading animation

Domain age display

AI reasoning panel

Score breakdown visualization

Scan history (last 50 entries)

Responsive layout

🛠 Tech Stack
Backend

Node.js

Express.js

Axios

Cheerio (HTML parsing)

Groq SDK (LLM integration)

RDAP API (Domain intelligence)

dotenv (Environment variables)

Frontend

HTML5

CSS3 (Neon cyber theme)

Vanilla JavaScript

Conic-gradient animated risk meter

📂 Project Structure
phishguard-ai/
│
├── server/
│   ├── server.js
│   ├── routes/
│   │   └── analyzeRoutes.js
│   ├── services/
│   │   └── urlAnalyzer.js
│   ├── public/
│   │   └── index.html
│   ├── .env
│   └── package.json

⚙️ Installation Guide
1️⃣ Clone Repository
git clone https://github.com/your-username/phishguard-ai.git
cd phishguard-ai/server

2️⃣ Install Dependencies
npm install

3️⃣ Create Environment File

Create a .env file inside /server:

GROQ_API_KEY=your_groq_api_key_here

▶️ Run Commands

Start the server:

node server.js


Or (recommended):

npm start


Open browser:

http://localhost:5000

🏗 Architecture Diagram (Text Representation)
             ┌────────────────────┐
             │     Frontend UI     │
             │  (Neon Dashboard)   │
             └──────────┬──────────┘
                        │
                        ▼
             ┌────────────────────┐
             │   Express Server    │
             │   /api/analyze      │
             └──────────┬──────────┘
                        │
        ┌───────────────┼────────────────┐
        ▼               ▼                ▼
  Lexical Engine   Content Analyzer   RDAP Lookup
        │               │                │
        └───────────────┼────────────────┘
                        ▼
                Groq AI Analysis
                        │
                        ▼
              Risk Scoring Engine
                        │
                        ▼
                Structured JSON Response

                
                
   Demo Video : https://youtu.be/TxiBdvqpPKo             
  Deployed Link: https://phish-1-fjrq.onrender.com/

   By: Sona Siju
   Swathy V
                
