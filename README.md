# LinkAI: LinkedIn AI Comment Generator Chrome Extension

LinkAI is a premium, lightweight, and secure Chrome Extension that allows you to generate professional, context-aware comments for LinkedIn posts directly inside the LinkedIn interface using the Groq API. 

---

## ✨ Features
- **In-Context Overlay:** Appends a native-looking, premium **✨ Generate AI** button and tone selector directly inside LinkedIn's comment forms.
- **5 Professional Tones:** Choose between **Insightful 💡**, **Supportive 🤝**, **Constructive 🛠️**, **Funny 😄**, and **Questioning ❓**.
- **Dynamic Post Extraction:** Automatically scans and parses post content safely (excluding sub-comments and system controls) to craft relevant comments.
- **Draft.js Support (React Bridge):** Seamlessly autofills LinkedIn's custom contenteditable textareas, updating React's internal state so the "Post" button enables instantly.
- **API Key Security:** Saves your Groq API key securely in local Chrome storage (never hardcoded, no external servers).
- **Groq Optimization:** Optimized prompts and client-side caching to prevent rate-limiting on Groq's free tier.
- **Anti-Detection Measures:** Only executes when triggered by a physical user click. Uses isolated **Shadow DOMs** to prevent website script intrusion or style pollution.

---

## 🛠️ Installation

1. **Clone or Download this repository:**
   Ensure all extension files are placed in a folder (e.g. `linkedin-comments-ai`).

2. **Open Extensions Page:**
   Open Google Chrome, navigate to `chrome://extensions/` in the URL bar, and press Enter.

3. **Enable Developer Mode:**
   Toggle the **"Developer mode"** switch in the upper-right corner of the Extensions page.

4. **Load Unpacked Extension:**
   Click the **"Load unpacked"** button in the upper-left corner and select your `linkedin-comments-ai` project directory.

---

## 🚀 Setup & Usage

1. **Set your Groq API Key:**
   - Click the extension icon in your Chrome toolbar.
   - Enter your Groq API key (get one for free at the [Groq Console](https://console.groq.com/keys)).
   - Customize your default model (e.g., `llama-3.1-8b-instant` for ultra-fast generation), select your default tone, and add custom context (e.g. your professional background) to personalize comments.
   - Click **Save Preferences**.

2. **Engage on LinkedIn:**
   - Go to [LinkedIn](https://www.linkedin.com) and find a post you want to comment on.
   - Click the post's **Comment** button.
   - You will see the **✨ Generate AI** pill button and tone selector appear next to the editor input field.
   - Click the **✨ Generate AI** button.
   - The AI will read the post, generate a high-quality comment, and autofill it into the textbox!
   - Review, edit if needed, and hit **Post**.

---

## 🔒 Security & Privacy
- **Direct Requests:** Your API requests are sent directly from your browser to Groq. No third-party servers see your data or your API key.
- **Storage:** Key and settings are kept inside your browser profile's `chrome.storage.local`.
- **No Background Scraping:** The extension runs entirely on-demand and does not scrap data in the background or monitor your browsing behavior.
