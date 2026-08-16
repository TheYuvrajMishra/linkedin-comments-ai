# LinkAI: LinkedIn AI Comment Generator Chrome Extension & Backend API

LinkAI (Eloquix) is a premium, security-focused Chrome Extension (Manifest V3) and Node.js Backend API Server that generates intelligent, context-aware comments for LinkedIn posts directly inside the LinkedIn interface using the Groq API.

---

## 🏗️ Client-Server Architecture

All sensitive operations—such as Groq API key storage, AI prompt processing, user authentication, daily quota enforcement, and payment webhook verification—are handled exclusively by a dedicated **Backend API Server**.

```
Chrome Extension Frontend              Backend Server (Port 5000)                      External Services
┌───────────────────────┐            ┌─────────────────────────────────────────┐       ┌────────────────┐
│  Content Script /     │            │  • Auth Verification (Google / Firebase)│       │  Groq API      │
│  Background Worker    │ ─────────► │  • Quota Check & Atomic Usage Counter  │ ────► │  (Server Key)  │
│  (UI Overlay Only)    │  REST API  │  • System Prompt & Injection Defense    │       └────────────────┘
└───────────────────────┘            │  • Webhook Verification (Razorpay)     │       ┌────────────────┐
                                     └─────────────────────────────────────────┘ ────► │  Firestore / DB│
                                                                                       └────────────────┘
```

---

## ✨ Key Features

- **Backend-Secured Groq Generation:** API keys are stored in `backend/.env` and never exposed to client browsers or extensions.
- **Native In-Context Overlay:** Seamlessly injects a custom UI overlay (with a **✨ Generate AI** button, **Tone Selector**, and **Regenerate / Copy** controls) right into LinkedIn comment forms.
- **5 Curated Tones:** Choose the exact tone for your response:
  - **Insightful 💡**: Professional perspectives, key takeaways, and constructive add-ons.
  - **Supportive 🤝**: Genuine encouragement and validation of the post's core ideas.
  - **Constructive 🛠️**: Polite alternative angles or nuances worth considering.
  - **Funny 😄**: Light-hearted, safe professional humor.
  - **Questioning ❓**: Thoughtful questions designed to spark meaningful conversation.
- **Server-Enforced Anti-AI Rules & Guidelines:**
  - **Ultra-crisp output:** 1-2 sentences maximum, under 25 words.
  - **No generic openers:** Bans hollow phrases like *"Great post!"*, *"So true!"*, or *"Thanks for sharing."*
  - **No AI Buzzwords:** Enforces zero usage of cliché words like *leverage, delve, landscape, game-changer, unlock, navigate*.
  - **No Personal Names:** Prevents addressing the post author by name for clean, broad readability.
  - **Prompt Injection Defense & Factuality Enforcer:** Treats untrusted post content strictly as data.
- **Server-Side Quota & Payment Verification:** Enforces daily limits server-side (`Free`: 2/day, `Pro`: 20/day, `Ultra`: 50/day) and updates plans automatically via Razorpay webhooks.

---

## 📁 Project Structure

```
linkedin-comments-ai/
├── backend/                    # Node.js Express Backend API Server
│   ├── server.js              # Express API server, Groq proxy, auth & quota handlers
│   ├── package.json           # Server dependencies (express, cors, dotenv)
│   ├── .env                   # Server environment variables (GROQ_API_KEY, etc.)
│   └── data/                  # Local user database storage (fallback)
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── background.js              # Background service worker & backend proxy handler
├── config.js                  # Frontend configuration & backend URL endpoint
├── firebase-db.js             # Client helper for backend API profile endpoints
├── content/
│   ├── content.js             # DOM observer, UI injection, and React bridge
│   └── content.css            # Extension styling & overlay visual design
├── popup/
│   ├── popup.html             # Extension settings interface UI (No API key input)
│   ├── popup.js               # Preferences manager & server connection handler
│   └── popup.css              # Popup styling & design system
├── icons/                     # Extension icons (16px, 48px, 128px)
└── README.md                  # Project documentation
```

---

## 🚀 Setup & Execution

### 1. Start the Backend API Server

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure your environment variables
# Copy .env.example to .env and insert your Groq API Key
# GROQ_API_KEY=gsk_your_groq_api_key_here

# Start the server (runs on http://localhost:5000)
npm start
```

### 2. Load the Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** in the upper-right corner.
3. Click **Load unpacked** in the top-left corner and select the root `linkedin-comments-ai` project folder.
4. Click the extension icon to verify **Server Active** status!

---

## 🔒 Security & Privacy

- **Zero Key Exposure:** Groq API keys are stored strictly on the server in `backend/.env`. Chrome extension clients never see or store LLM API keys.
- **Atomic Server Quota Enforcement:** Daily usage counts and tier restrictions are validated server-side.
- **Verified Payment Webhooks:** Subscription upgrades are triggered via Razorpay HMAC cryptographic webhooks (`POST /api/v1/payments/webhook`).

---

## ❓ Troubleshooting

- **"Unable to connect to Eloquix Backend Server"**: Make sure the backend server is running (`cd backend && npm start`) on `http://localhost:5000`.
- **"Groq Key Missing"**: Set `GROQ_API_KEY` in `backend/.env` and restart the backend server.
- **Button not showing on LinkedIn**: Refresh the LinkedIn page to ensure the content script is loaded.
