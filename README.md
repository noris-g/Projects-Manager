# 🧠 UniHack 2025 — AI Conversation Intent Assistant  
An intelligent system that analyzes user messages, identifies intent, extracts structured data, and transforms conversations into actionable items.

---

## 📌 Overview

**UniHack 2025** is an AI-powered assistant that connects human conversations with automated workflows.  
The system uses **Gemini 2.5 Flash Lite** to understand user messages and classify them into well-defined categories:

- `profit`
- `agenda`
- `tasks`
- `list`
- `leaveDays`
- `meeting`
- `maintenance`
- `createList`
- `other`

Based on the detected intent, the system generates clean, JSON-structured responses containing only the information needed for further automation.

The frontend is built with **React**, uses **localStorage** for message persistence, and includes a lightweight **Markdown/Gemini parser** for formatted AI output.

---

## 🚀 Features

### 🔍 1. Intent Detection Engine
- Converts any message into a single `<match>` token.
- Supported tokens: `<profit> <agenda> <tasks> <list> <other>`.
- Uses stable, simplified prompts to ensure predictable JSON output.

### 🧩 2. Intent-Specific Follow-Up Prompts
Each detected intent generates a second request to extract structured information:

- **profit** → `{ "type": "profit", "year": "...", "value": "..." }`
- **tasks** → lists of tasks with owner + due date
- **agenda** → agenda items + period
- **list** → subject + extracted items
- **other** → summary + key information

### 💬 3. Chat UI With Persistent State
- Stores messages in `localStorage` as JSON arrays
- Safe parsing to avoid circular structures
- Bubble-style UI with sender labels and timestamps

### 📝 4. Custom Gemini / Markdown Renderer
Supports:
- `#`, `##`, `###` headings  
- `-` / `*` bullet lists  
- **bold**, *italic*  
- basic paragraphs  

No external dependencies.

### ⚡ 5. Clean React Architecture
Includes:
- Hooks-based state management  
- AI logic in isolated modules  
- Error safety around AI calls  
- Practical, dependency-free design  

---

## 🗂 Folder Structure

\`\`\`
unihack2025/
│
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx
│   │   ├── InfoPage.jsx
│   │   └── MessageBubble.jsx
│   │
│   ├── ai/
│   │   ├── geminiAgent.js
│   │   └── geminiParser.js
│   │
│   ├── hooks/
│   │   └── useLocalMessages.js
│   │
│   ├── lib/
│   │   └── apiClient.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── public/
├── README.md
└── package.json
\`\`\`

---

## 🧠 AI Logic Breakdown

### 1️⃣ Intent Detection Prompt

\`\`\`text
return a single word <match>, where <match> is the subject inside '<msg>' tags,
and can be one of: <profit> <agenda> <tasks> <list> <other>.
<msg>${message}</msg>
\`\`\`

### 2️⃣ Follow-Up Prompts

#### Profit
\`\`\`text
{
  "type": "profit",
  "year": "string or null",
  "value": "string or null"
}
<msg>${message}</msg>
\`\`\`

#### Tasks
\`\`\`text
{
  "type": "tasks",
  "tasks": [
    { "task": "...", "owner": "me|other|unknown", "due": "..." }
  ]
}
<msg>${message}</msg>
\`\`\`

#### Agenda
\`\`\`text
{
  "type": "agenda",
  "period": "string or null",
  "items": ["array of items"]
}
<msg>${message}</msg>
\`\`\`

#### List
\`\`\`text
{
  "type": "list",
  "subject": "string or null",
  "items": ["array of items"]
}
<msg>${message}</msg>
\`\`\`

#### Other
\`\`\`text
{
  "type": "other",
  "summary": "short text",
  "key_info": ["array of important words"]
}
<msg>${message}</msg>
\`\`\`

---

## 🛠 Installation

\`\`\`bash
git clone https://github.com/your-username/unihack2025.git
cd unihack2025
npm install
\`\`\`

---

## ▶️ Running the App

\`\`\`bash
npm run dev
\`\`\`

The app will start at:

\`\`\`
http://localhost:5173
\`\`\`

---

## 🔑 Setup Gemini API Key

Create a \`.env\` file:

\`\`\`
GEMINI_API_KEY=your_api_key_here
\`\`\`

Restart Vite afterwards.

---

## 💾 Message Structure

Messages are stored as simple, serializable objects:

\`\`\`json
{
  "id": "uuid",
  "sender": "user|ai",
  "text": "string",
  "timestamp": 123456789,
  "isOwn": true
}
\`\`\`

No Promises or non-serializable data structures are stored.

---

## ✨ Roadmap

- Backend integration with MongoDB  
- Exportable conversation datasets  
- Plugin system for new intents  
- Real-time WhatsApp/Slack connectors  
- Voice-to-intent module  

---

## 👤 Authors

- **Diana Grozav** — project lead, architecture, AI logic, full-stack  
- Contributors — UniHack 2025 team  

---

## 🏆 License

MIT License — open for personal and commercial usage.
