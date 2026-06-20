# Anti-Hallucination Coding Checklist

This checklist is used to verify implementation correctness at each phase of development, preventing assumptions or hallucinations about how the Chrome API, Groq API, and LinkedIn's dynamic DOM behave.

---

## 📋 Phase 1: Manifest & Environment Setup
- [x] **Manifest Version:** Ensure the manifest is standard MV3 (`manifest.json` specifies `"manifest_version": 3`).
- [x] **Host Permissions:** Ensure `"host_permissions"` covers `https://*.linkedin.com/*` and `https://api.groq.com/*`.
- [x] **Background Script:** Configured as a service worker:
  ```json
  "background": {
    "service_worker": "background.js"
  }
  ```
- [x] **Permissions:** Ensure `"permissions"` includes `["storage", "activeTab"]`.
- [x] **Content Script Registration:** Content scripts mapped specifically to `https://*.linkedin.com/*`.

---

## 📋 Phase 2: Content Script & UI Injection (Shadow DOM)
- [x] **MutationObserver Resilience:** MutationObserver targets parent container updates (`document.body` or `#app-container`) instead of relying on immediate static load.
- [x] **Memory Leak Prevention:** MutationObserver correctly disconnects/filters events and doesn't trigger loops when injecting the button.
- [x] **DOM Isolation (Shadow DOM):**
  - [x] Injecting custom UI elements strictly inside a Shadow Root (`element.attachShadow({ mode: 'closed' })` or `'open'`).
  - [x] Extension CSS is loaded only inside the Shadow DOM to avoid styling conflicts on LinkedIn.
- [x] **Selector Stability:**
  - [x] Uses ARIA attributes (e.g. `aria-label="Add a comment"`, `role="textbox"`) instead of dynamic/obfuscated classes like `artdeco-button`.
  - [x] Parent post lookup traverses the DOM tree robustly using `.closest('.feed-shared-update-v2')` or structural selectors.

---

## 📋 Phase 3: React / Draft.js Editor Bridge
- [x] **Active Editor Detection:** The comment button is only injected when the comment editor DOM node is actually present and ready.
- [x] **React State Sync (The Paste Event):**
  - [x] Simulate focus on the target element: `editorElement.focus()`.
  - [x] Target element text cleared first if there's pre-existing content.
  - [x] Synthetic `ClipboardEvent` dispatch is used to paste text.
  - [x] Verify that Draft.js processes the text input event, the placeholder disappears, and the LinkedIn "Post" button becomes enabled (clickable).
- [x] **Fallback Execution:** If paste simulation fails in a specific edge case, fallback to `document.execCommand('insertText', false, text)` or keyboard events is gracefully handled.

---

## 📋 Phase 4: Groq LLM & Rate-Limit Optimization
- [x] **Groq API Request Format:** JSON payload matches Groq specification:
  - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Headers: `Authorization: Bearer <API_KEY>`, `Content-Type: application/json`
- [x] **Input Token Pruning:** Explicitly truncate extracted post text to a maximum length (e.g., 1000 characters) before sending to LLM.
- [x] **Model selection:** Hardcoded/default model configured to `llama-3.1-8b-instant` or similar fast/low-cost model.
- [x] **System Prompt Efficiency:** Ensure system prompt enforces:
  - Conciseness (1-2 sentences, max 25 words).
  - Raw text only (no quotes, greeting text, or conversational explanations).
  - No personal names or direct addressing of the OP.
- [x] **Caching:** Memory-based caching implemented to store generated comments by post URN/ID to prevent multiple duplicate requests for the same post.
- [x] **HTTP 429 Rate Limit Handling:**
  - [x] Read `retry-after` header if 429 status is returned.
  - [x] Display a clean countdown/cooldown inside the Shadow DOM UI.
- [x] **API Key Security:** Key is never stored in global variables or source files. It is retrieved dynamically from `chrome.storage.local`.

---

## 📋 Phase 5: Anti-Detection & Account Protection
- [x] **No Background Scraping:** Absolutely no background DOM scraping or data collection without direct user intervention.
- [x] **User-Initiated Trigger:** API generation is *only* triggered on a manual mouse click of the injected "Generate AI Comment" button.
- [x] **Request Debouncing / Cooldown:** Injected button is immediately disabled upon click and enters a "loading" state. Added a minimum cooldown (e.g., 5 seconds) post-completion to prevent spam clicks.
- [x] **Natural Input Rate:** No automation of actual submit/post button clicks. The user *must* review the comment and click "Post" manually.

---

## 📋 Phase 6: UI Aesthetics & Polishing
- [x] **Aesthetics:** Elegant, modern look (glassmorphism details, subtle shadow, rounded corners, custom font definitions if possible).
- [x] **Context-Aware Styling:** Fits well in both LinkedIn Light Mode and Dark Mode.
- [x] **Interactive Elements:** Smooth transition effects on hover and click states.
- [x] **Status Indicators:** Clearly shows *Generating...*, *Success*, *Error (with description)*, or *Cooldown*.
