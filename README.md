# LinkAI: LinkedIn AI Comment Generator Chrome Extension

LinkAI is a premium, lightweight, and security-focused Chrome Extension (Manifest V3) that generates intelligent, context-aware comments for LinkedIn posts directly inside the LinkedIn interface using the Groq API.

---

## ✨ Key Features

- **Native In-Context Overlay:** Seamlessly injects a custom, high-end UI overlay (with a **✨ Generate AI** button, **Tone Selector**, and **Regenerate / Copy** controls) right into LinkedIn comment forms.
- **5 Curated Tones:** Choose the exact tone for your response:
  - **Insightful 💡**: Professional perspectives, key takeaways, and constructive add-ons.
  - **Supportive 🤝**: Genuine encouragement and validation of the post's core ideas.
  - **Constructive 🛠️**: Polite alternative angles or nuances worth considering.
  - **Funny 😄**: Light-hearted, safe professional humor (never edgy or offensive).
  - **Questioning ❓**: Thoughtful questions designed to spark meaningful conversation.
- **Strict Comment Quality & Anti-AI Rules:**
  - **Ultra-crisp output:** 1-2 sentences maximum, under 25 words.
  - **No generic openers:** Bans hollow phrases like *"Great post!"*, *"So true!"*, or *"Thanks for sharing."*
  - **No AI Buzzwords:** Enforces zero usage of cliché words like *leverage, delve, landscape, game-changer, unlock, navigate*.
  - **No Personal Names:** Prevents addressing the post author by name for clean, broad readability.
  - **No Hashtags or Self-Promotion:** Keeps comments clean and purely focused on value.
- **Smart DOM Parsing & Isolation:**
  - Dynamically extracts post content while ignoring sub-comments, system action bars, and user controls.
  - Uses isolated **Shadow DOM** for extension elements to prevent LinkedIn CSS bleeding or website script interference.
- **Draft.js & React State Bridge:**
  - Directly updates LinkedIn's custom `contenteditable` textareas, triggering input events so React's internal state updates immediately (enabling the LinkedIn "Post" button without requiring manual typing).
- **Client-Side Caching & Rate-Limit Shield:**
  - Caches generated comments locally per post/tone to save API tokens and avoid Groq rate limits.
- **Prompt Injection Defense & Factuality Enforcer:**
  - Treats untrusted post content strictly as data, preventing post text from altering system instructions.
  - Generates responses strictly rooted in post facts to avoid hallucinating personal stories or fictional names.

---

## 🛠️ Installation

1. **Clone or Download this Repository:**
   Ensure all extension files are located in your local folder (e.g. `linkedin-comments-ai`).

2. **Open Extensions Page in Chrome:**
   Navigate to `chrome://extensions/` in your Chrome address bar.

3. **Enable Developer Mode:**
   Toggle the **Developer mode** switch in the upper-right corner of the Extensions page.

4. **Load Unpacked Extension:**
   Click **Load unpacked** in the top-left corner and select your `linkedin-comments-ai` project directory.

---

## 🚀 Setup & Usage

1. **Configure Extension Preferences:**
   - Click the **LinkAI** extension icon in your Chrome toolbar.
   - Enter your Groq API key (get your key for free at [Groq Console](https://console.groq.com/keys)).
   - Select your default model (e.g. `llama-3.1-8b-instant` or `llama-3.3-70b-versatile`).
   - Choose your default tone and optionally add **Custom Persona Context** (e.g., *Software Engineer specialized in cloud security*).
   - Click **Save Preferences**.

2. **Generate Comments on LinkedIn:**
   - Open [LinkedIn](https://www.linkedin.com) and navigate to any feed post or article.
   - Click the **Comment** button on a post to expand the comment box.
   - The **✨ Generate AI** button and tone dropdown will appear automatically attached to the comment editor.
   - Select a tone (or keep your default) and click **✨ Generate AI**.
   - The AI comment will autofill into the text area!
   - Review, edit if desired, and click **Post**.

---

## 📁 Project Structure

```
linkedin-comments-ai/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── background.js              # Background service worker & Groq API handler
├── content/
│   ├── content.js             # DOM observer, UI injection, and React bridge
│   └── content.css            # Extension styling & overlay visual design
├── popup/
│   ├── popup.html             # Extension settings interface UI
│   ├── popup.js               # Preferences manager & chrome.storage handler
│   └── popup.css              # Popup styling & design system
├── icons/                     # Extension icons (16px, 48px, 128px)
└── README.md                  # Project documentation
```

---

## 🔒 Security & Privacy

- **Direct API Communication:** All API calls are executed directly from your browser to Groq's official API (`https://api.groq.com`). No intermediate proxy or telemetry servers are used.
- **Secure Local Storage:** API keys and user preferences are stored securely within your browser's private `chrome.storage.local`.
- **On-Demand Execution:** The extension only runs when you physically interact with LinkedIn comment fields. It does not run background tracking, user analytics, or web scraping.

---

## ❓ Troubleshooting

- **"Groq API Key is not configured"**: Click the extension icon in your toolbar, paste your API key, and hit **Save Preferences**.
- **Button not showing on LinkedIn**: Refresh the LinkedIn page to ensure the content script is loaded.
- **LinkedIn "Post" button is disabled**: LinkAI uses synthetic DOM input and `beforeinput` dispatchers to update React state. If disabled, click inside the comment text area once or press space.

