# Quick Comment AI: LinkedIn AI Comment Generator & Web Portal

Quick Comment AI is a premium, security-focused Chrome Extension (Manifest V3), modern Vite React Web Application, and Node.js Backend API Server that generates sharp, context-aware AI comments for LinkedIn posts directly inside the LinkedIn interface using Groq LLM acceleration.

---

## 🏗️ Architecture Overview

Quick Comment AI uses a decoupled, three-tier architecture ensuring zero client-side API key exposure, multi-device session sync, and strict server-side abuse prevention.

```
┌─────────────────────────┐          ┌─────────────────────────┐          ┌─────────────────────────┐
│ Chrome Extension        │          │ Modern Vite Web Portal  │          │ Node.js Backend API     │
│ • DOM Comment Inserter  │ ───────► │ • Session & Auth Hub    │ ───────► │ • Groq API Proxy        │
│ • LinkedIn ID Capture   │          │ • Double-Bezel Pricing   │          │ • MongoDB Atlas Cloud   │
│ • Web Portal Bridge     │          │ • Auto Currency Detect  │          │ • Multi-Account Abuse   │
└─────────────────────────┘          └─────────────────────────┘          │   Deduplication Layer   │
                                                                          └─────────────────────────┘
```

---

## ✨ Key Features & Capabilities

### ⚡ Chrome Extension & DOM Engine
- **In-Context Native Overlay:** Injects a sleek UI bar (**✨ Generate AI**, **Tone Selector**, and **Streamed Insert / Regenerate** controls) directly into LinkedIn comment boxes.
- **5 Curated Tones:**
  - **Insightful 💡**: Professional perspectives, key takeaways, and constructive add-ons.
  - **Supportive 🤝**: Genuine encouragement and validation of the post's core ideas.
  - **Constructive 🛠️**: Polite alternative angles or nuances worth considering.
  - **Funny 😄**: Light-hearted, safe professional humor.
  - **Questioning ❓**: Thoughtful questions designed to spark meaningful conversation.

### 🛡️ LinkedIn Identity Abuse-Prevention Layer
- **Profile-Bound Quotas:** Extension automatically extracts the user's logged-in LinkedIn profile identifier (`/in/username`) from LinkedIn DOM (`getLinkedInUserIdentifier()`).
- **Shared Quota Pool:** Aggregates daily comment usage across **all app accounts** linked to the same underlying LinkedIn profile. Prevents users from farming free comment quotas by signing up under multiple Google email addresses for the same LinkedIn profile!

### 🌐 Modern Vite Web Portal (`/extension`)
- **Single Sign-On Auth Center:** Google OAuth authentication syncs real-time authentication states across web portal and browser extension.
- **Auto-Region & Currency Detection:** Automatically detects user timezone (`Asia/Kolkata` $\rightarrow$ INR ₹, International $\rightarrow$ USD $) for seamless regional pricing display.
- **Aceternity UI & Monotone Aesthetics:** Full-bleed grid guide rails (`max-w-7xl`), interactive Aceternity Background Boxes (`border-white/15`), and pure monotone black double-bezel cards (`bg-[#090909]` / `bg-black`).

### 🔒 Backend Server & Payment Gateway
- **Groq API Key Shielding:** API keys remain strictly on the backend (`backend/.env`). No LLM keys are ever sent to client browsers.
- **Dynamic Razorpay Checkout API:** Endpoint `/api/v1/payments/create-checkout` dynamically resolves payment links for INR (₹49 Pro / ₹99 Ultra) and USD (₹500 / ₹900).
- **MongoDB Atlas Cloud Database:** Primary MongoDB Cloud data layer (`User` schema with indexed `uid`, `email`, and `linkedInIdentifier`) with automatic local JSON fallback (`backend/data/users.json`).

---

## 📁 Project Structure

```
linkedin-comments-ai/
├── backend/                    # Express Node.js Backend Server
│   ├── server.js              # Server routes, Groq API proxy, MongoDB & abuse prevention
│   ├── package.json           # Backend dependencies (express, mongoose, cors, dotenv)
│   ├── .env                   # Backend environment variables (PORT, MONGODB_URI, GROQ_API_KEY)
│   ├── .env.example           # Production deployment backend environment template
│   └── data/                  # Local JSON DB storage fallback (users.json)
├── website/                    # Vite + React + Tailwind + Aceternity UI Web App
│   ├── src/
│   │   ├── components/        # React components (Navbar, UI components, BackgroundBoxes)
│   │   ├── pages/             # App pages (HomePage.jsx, ExtensionPage.jsx)
│   │   └── firebase.js        # Production Firebase Auth Client SDK setup
│   ├── vite.config.js         # Vite bundler configuration with environment resolution
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Frontend environment template
├── extension/                  # Chrome Extension Source Files
│   ├── manifest.json          # Chrome Extension Manifest V3 file
│   ├── background.js          # Service worker proxy forwarding requests to backend
│   ├── config.js              # Shared extension configuration constants
│   ├── env-loader.js          # Environment helper script
│   ├── firebase-db.js         # Firebase client DB wrapper
│   ├── content/               # Extension Content Scripts
│   │   ├── content.js         # LinkedIn DOM observer, overlay injector & identifier reader
│   │   ├── content.css        # Extension Shadow DOM styles
│   │   └── website-bridge.js  # Real-time web-portal authentication bridge
│   ├── popup/                 # Extension Settings Popup
│   │   ├── popup.html         # Extension popup UI linking to web portal
│   │   └── popup.js           # Extension popup logic
│   └── icons/                 # Extension icon assets
├── README.md                  # Project documentation
```

---

## 🚀 Quickstart & Setup Guide

### 1. Configure Backend Environment
Create `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
FRONTEND_URL=https://linkedin-comments-ai.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quick_comment_ai?retryWrites=true&w=majority
GROQ_API_KEY=gsk_your_groq_api_key_here
DEFAULT_GROQ_MODEL=groq/compound-mini

RAZORPAY_PRO_LINK_INR=https://rzp.io/rzp/8fyIuiTV
RAZORPAY_ULTRA_LINK_INR=https://rzp.io/rzp/AKMnRQ9h
RAZORPAY_PRO_LINK_USD=https://rzp.io/rzp/lwkO8dn8
RAZORPAY_ULTRA_LINK_USD=https://rzp.io/rzp/5SoMpUI
```

Start the Backend API Server:
```bash
cd backend
npm install
npm start
```

### 2. Configure Frontend Web App
Create `.env` in the root or `website/`:
```env
BACKEND_URL=http://localhost:5000
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-app
FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1234567890
FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

Start the Web App Dev Server:
```bash
cd website
npm install
npm run dev
```

### 3. Load Chrome Extension
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `extension` directory inside `linkedin-comments-ai`.
4. Open any LinkedIn post to experience the **✨ Generate AI** overlay!

---

## 🔒 Security & Anti-AI Rules

- **Zero Key Exposure:** Groq API keys are stored strictly in backend server environment variables.
- **Strict Anti-AI Voice Guidelines:**
  - Max 1-2 sentences, under 25 words.
  - Zero hollow openers (*"Great post!"*, *"So true!"*, *"Thanks for sharing"*).
  - Banned AI buzzwords (*leverage, delve, landscape, game-changer, unlock, navigate*).
  - No personal names addressed in comment bodies.
- **Git Security:** All `.env` files and secret keys are automatically untracked via updated `.gitignore` rules.

---

## 📄 License & Usage Warning

Distributed under the MIT License with Express Usage Restrictions. See [LICENSE](LICENSE) for full details.

> ⚠️ **NOTICE & USAGE RESTRICTION**: This repository, brand assets, and backend services are developed by Yuvraj Mishra for educational, personal reference, and evaluation purposes only. Unauthorized commercial re-selling, re-packaging, or re-branding without prior written permission is strictly prohibited.

