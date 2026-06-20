// Content script for LinkedIn AI Comment Generator

// Inlined CSS for Shadow DOM styling
const SHADOW_CSS = `
.linkai-container {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-right: 8px;
  vertical-align: middle;
}

.linkai-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0a66c2, #1d4ed8);
  color: #ffffff;
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(10, 102, 194, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  height: 32px;
  white-space: nowrap;
}

.linkai-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0b76e2, #2563eb);
  box-shadow: 0 4px 10px rgba(10, 102, 194, 0.45), 0 0 0 2px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.linkai-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.linkai-btn:disabled {
  background: #ccd0d5;
  color: #8c8c8c;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.linkai-btn-icon {
  font-size: 13px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.linkai-btn:hover:not(:disabled) .linkai-btn-icon {
  transform: rotate(15deg) scale(1.1);
}

.linkai-tone-trigger {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: #5e5e5e;
  border-radius: 16px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
  margin-left: 4px;
  white-space: nowrap;
}

/* Check dark mode class on host context if applicable */
:host-context([class*="theme--dark"]) .linkai-tone-trigger {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e1e1e1;
}

.linkai-tone-trigger:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #2b2b2b;
}

.linkai-dropdown {
  position: absolute;
  bottom: 38px;
  left: 0;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  padding: 6px;
  min-width: 145px;
  display: none;
  flex-direction: column;
  gap: 2px;
  z-index: 10000;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: slideUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.linkai-dropdown.show {
  display: flex;
}

.linkai-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  color: #d1d5db;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  text-align: left;
}

.linkai-item:hover {
  background: rgba(59, 130, 246, 0.18);
  color: #ffffff;
}

.linkai-item.selected {
  background: rgba(10, 102, 194, 0.25);
  color: #60a5fa;
  font-weight: 600;
}

.linkai-status {
  font-size: 11px;
  color: #6b7280;
  margin-left: 8px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.linkai-status.error {
  color: #ef4444 !important;
}

.linkai-status.success {
  color: #10b981 !important;
}

.linkai-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Tones config
const TONES = [
  { id: "insightful", label: "Insightful", emoji: "💡" },
  { id: "supportive", label: "Supportive", emoji: "🤝" },
  { id: "constructive", label: "Constructive", emoji: "🛠️" },
  { id: "funny", label: "Funny", emoji: "😄" },
  { id: "questioning", label: "Questioning", emoji: "❓" }
];

let globalObserver = null;
let globalIntervalId = null;

// Helper to check if the extension context has been invalidated (e.g., after reload)
function isContextValid() {
  try {
    if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) {
      cleanup();
      return false;
    }
    // Accessing getManifest will throw an error if the context is invalidated
    chrome.runtime.getManifest();
    return true;
  } catch (e) {
    cleanup();
    return false;
  }
}

// Clean up listeners if the extension was reloaded or disabled
function cleanup() {
  if (globalObserver) {
    try {
      globalObserver.disconnect();
    } catch (e) {}
    globalObserver = null;
  }
  if (globalIntervalId) {
    try {
      clearInterval(globalIntervalId);
    } catch (e) {}
    globalIntervalId = null;
  }
  console.log("LinkAI: Extension context was invalidated. Cleaned up observers.");
}

// Initialize DOM checking
function init() {
  console.log("LinkAI Comment Generator active on page");
  
  if (!isContextValid()) return;
  
  let scanTimeout = null;
  
  // Set up MutationObserver to detect newly injected comment textboxes
  globalObserver = new MutationObserver((mutations) => {
    if (!isContextValid()) return;
    
    let hasAddedNodes = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        hasAddedNodes = true;
        break;
      }
    }
    
    if (hasAddedNodes) {
      if (scanTimeout) clearTimeout(scanTimeout);
      scanTimeout = setTimeout(scanForCommentFields, 150);
    }
  });

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Regular backup scanner to cover SPA routing changes
  globalIntervalId = setInterval(scanForCommentFields, 2000);

  // Initial scan after delay/load has completed
  scanForCommentFields();
}

// Find comment boxes and inject AI button if not already done
function scanForCommentFields() {
  if (!isContextValid()) return;

  // LinkedIn comment text areas are contenteditable divs with role="textbox"
  // They usually have class "ql-editor" or are inside comments-comment-box__form-container
  const editors = document.querySelectorAll('div[contenteditable="true"]');
  
  editors.forEach(editor => {
    // Exclude editors that are not comment/reply boxes
    const placeholderText = editor.getAttribute("placeholder") || "";
    const ariaLabel = editor.getAttribute("aria-label") || "";
    
    const isCommentOrReply = 
      ariaLabel.toLowerCase().includes("comment") || 
      ariaLabel.toLowerCase().includes("reply") || 
      placeholderText.toLowerCase().includes("comment") ||
      placeholderText.toLowerCase().includes("reply") ||
      editor.closest(".comments-comment-box") !== null ||
      editor.closest(".comments-quick-comment-box") !== null;

    if (!isCommentOrReply) return;

    // Self-healing check: check if the parent container actually contains .linkai-container-host
    const form = editor.closest("form, .comments-comment-box__form-container, .comments-comment-box");
    let hasContainer = false;
    if (form) {
      hasContainer = form.querySelector(".linkai-container-host") !== null;
    } else if (editor.parentElement) {
      hasContainer = editor.parentElement.querySelector(".linkai-container-host") !== null;
    }

    if (hasContainer) {
      // Ensure attribute is set if the container already exists
      if (editor.getAttribute("data-linkai-injected") !== "true") {
        editor.setAttribute("data-linkai-injected", "true");
      }
      return;
    }

    // Clear attribute first to be safe, then set it and inject
    editor.removeAttribute("data-linkai-injected");
    editor.setAttribute("data-linkai-injected", "true");

    injectAIElements(editor);
  });
}

// Inject AI buttons next to the comment editor action bar
function injectAIElements(editor) {
  // Find action bar (where Emoji / Images / Post buttons live)
  // Typically: .comments-comment-box__form-action-bar
  let actionBar = null;
  const form = editor.closest("form, .comments-comment-box__form-container, .comments-comment-box");
  
  if (form) {
    actionBar = form.querySelector(".comments-comment-box__form-action-bar, .comments-comment-box__actions");
  }
  
  // If action bar is not found, fallback to appending directly after the editor
  if (!actionBar) {
    actionBar = editor.parentElement;
    if (!actionBar) return;
  }

  // Create outer container for Shadow DOM
  const container = document.createElement("div");
  container.className = "linkai-container-host";
  container.style.display = "inline-block";
  container.style.verticalAlign = "middle";

  // Attach Shadow DOM for CSS isolation
  const shadow = container.attachShadow({ mode: "open" });

  // Add styles to Shadow DOM
  const style = document.createElement("style");
  style.textContent = SHADOW_CSS;
  shadow.appendChild(style);

  // Add html structure
  const root = document.createElement("div");
  root.className = "linkai-container";
  
  // Generate Button
  const genBtn = document.createElement("button");
  genBtn.type = "button";
  genBtn.className = "linkai-btn";
  genBtn.innerHTML = `<span class="linkai-btn-icon">✨</span><span class="linkai-btn-text">Generate AI</span>`;
  
  // Tone Dropdown Trigger Button
  const toneTrigger = document.createElement("button");
  toneTrigger.type = "button";
  toneTrigger.className = "linkai-tone-trigger";
  
  // Dropdown Menu
  const dropdown = document.createElement("div");
  dropdown.className = "linkai-dropdown";

  root.appendChild(genBtn);
  root.appendChild(toneTrigger);
  root.appendChild(dropdown);
  
  // Status feedback text
  const statusText = document.createElement("span");
  statusText.className = "linkai-status";
  root.appendChild(statusText);

  shadow.appendChild(root);

  // Position: Prepend to the action bar (so it sits on the left side near emoji button)
  // Or append if no structured actions list is found
  if (actionBar.classList.contains("comments-comment-box__form-action-bar")) {
    // Typically, the first child contains the attachment buttons (media, emoji)
    const mediaContainer = actionBar.firstElementChild;
    if (mediaContainer && mediaContainer.nodeType === Node.ELEMENT_NODE) {
      mediaContainer.appendChild(container);
    } else {
      actionBar.insertBefore(container, actionBar.firstChild);
    }
  } else {
    actionBar.appendChild(container);
  }

  // State Management
  let currentTone = "insightful";
  let isGenerating = false;

  // Retrieve last selected tone from storage
  chrome.storage.local.get("defaultTone", (data) => {
    if (data.defaultTone) {
      currentTone = data.defaultTone;
      updateToneUI();
    }
  });

  // Render tone selection dropdown content
  function renderDropdown() {
    dropdown.innerHTML = "";
    TONES.forEach(tone => {
      const item = document.createElement("div");
      item.className = `linkai-item ${tone.id === currentTone ? "selected" : ""}`;
      item.innerHTML = `${tone.emoji} ${tone.label}`;
      item.addEventListener("click", () => {
        if (!isContextValid()) {
          alert("Extension reloaded. Please refresh the page.");
          return;
        }
        currentTone = tone.id;
        chrome.storage.local.set({ defaultTone: tone.id });
        updateToneUI();
        dropdown.classList.remove("show");
      });
      dropdown.appendChild(item);
    });
  }

  function updateToneUI() {
    const activeTone = TONES.find(t => t.id === currentTone) || TONES[0];
    toneTrigger.innerHTML = `${activeTone.emoji} ${activeTone.label} <span style="font-size: 8px; margin-left: 2px;">▼</span>`;
    renderDropdown();
  }

  updateToneUI();

  // Close dropdown helper function
  function closeDropdown() {
    dropdown.classList.remove("show");
    document.removeEventListener("click", closeDropdown);
  }

  // Dropdown Toggle
  toneTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isShown = dropdown.classList.contains("show");
    if (isShown) {
      closeDropdown();
    } else {
      if (!isContextValid()) return;
      dropdown.classList.add("show");
      // Add dynamic listener to close when clicking outside the dropdown
      setTimeout(() => {
        document.addEventListener("click", closeDropdown);
      }, 0);
    }
  });

  // Core comment generation trigger
  genBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isGenerating) return;

    if (!isContextValid()) {
      showStatus("Extension reloaded. Please refresh the page.", "error");
      return;
    }

    // Get post container
    const postContainer = findPostContainer(editor);
    if (!postContainer) {
      showStatus("Could not find post text container.", "error");
      return;
    }

    // Extract text content of the post
    const postText = extractPostContent(postContainer, editor);
    console.log("LinkAI: Post Container found:", postContainer);
    console.log("LinkAI: Extracted Post Text:", postText);

    if (!postText || postText.trim().length === 0) {
      showStatus("Post content is empty or unreadable.", "error");
      return;
    }

    // Set a tooltip to visually verify the entire scraped text on hover
    genBtn.title = `Scraped Text:\n"${postText}"`;

    // Enter loading state
    setLoadingState(true);
    showStatus(`Analyzing: "${postText.slice(0, 25)}..."`, "");

    // Fetch custom instructions if any
    chrome.storage.local.get("customInstructions", (data) => {
      const customInstructions = data.customInstructions || "";

      console.log("LinkAI: Sending generation request:", {
        postText: postText,
        tone: currentTone,
        customInstructions: customInstructions
      });

      // Send generation request to background script
      chrome.runtime.sendMessage(
        {
          action: "generateComment",
          postText: postText,
          tone: currentTone,
          customInstructions: customInstructions
        },
        (response) => {
          setLoadingState(false);

          if (chrome.runtime.lastError) {
            console.error("Message delivery failed:", chrome.runtime.lastError);
            showStatus("Connection error.", "error");
            return;
          }

          if (response && response.success) {
            autofillDraftJSEditor(editor, response.comment);
            showStatus("Completed ✨", "success");
            setTimeout(() => showStatus("", ""), 3000);
          } else {
            const errorMsg = response?.error || "Generation failed.";
            showStatus(errorMsg, "error");
          }
        }
      );
    });
  });

  // UI state change helpers
  function setLoadingState(loading) {
    isGenerating = loading;
    genBtn.disabled = loading;
    toneTrigger.disabled = loading;
    if (loading) {
      genBtn.innerHTML = `<span class="linkai-spinner"></span><span>Working...</span>`;
    } else {
      genBtn.innerHTML = `<span class="linkai-btn-icon">✨</span><span class="linkai-btn-text">Generate AI</span>`;
    }
  }

  function showStatus(text, type) {
    statusText.textContent = text;
    statusText.className = "linkai-status";
    if (type) {
      statusText.classList.add(type);
    }
  }
}

// Traverse upwards to find the container div for the LinkedIn update
function findPostContainer(editor) {
  // Try standard selectors, stable data-view tags, and attributes first
  const selectors = [
    '[data-view-name="feed-update"]',
    '[data-view-name="feed-full-update"]',
    '[data-view-name*="update"]',
    'article',
    '[role="article"]',
    'div[role="article"]',
    '[data-urn]',
    '[data-id]',
    '[data-activity-id]',
    '.feed-shared-update-v2',
    '.occludable-update',
    '.feed-shared-update',
    '.update-components-article',
    '.feed-container-theme',
    '.feed-shared-update-v4'
  ];

  for (const selector of selectors) {
    let container = editor.closest(selector);
    while (container) {
      // Reject if this matched element is actually part of the comments section
      const isInsideComments = 
        container.closest(".comments-comment-item") || 
        container.closest(".comments-comments-list") ||
        container.closest(".comments-comment-box") ||
        container.closest(".comments-comment-box-container");
        
      if (!isInsideComments) {
        return container;
      }
      // If it was inside comments, climb higher to find the true post parent
      container = container.parentElement ? container.parentElement.closest(selector) : null;
    }
  }

  // Self-healing step-by-step climbing search based on structural signals
  let curr = editor.parentElement;
  while (curr && curr !== document.body) {
    // LinkedIn posts always have a social action bar sibling to the text
    const hasSocialBar = curr.querySelector(
      '[data-view-name*="social-action"], .social-details-social-activity, [aria-label*="React"], [aria-label*="Like"]'
    );
    const hasPostText = curr.querySelector(
      'span[dir="ltr"], span[lang], [dir="ltr"]'
    );
    const isNotInsideComments = 
      !curr.closest(".comments-comments-list") && 
      !curr.closest(".comments-comment-item") &&
      !curr.closest(".comments-comment-box") &&
      !curr.closest(".comments-comment-box-container");
    
    if (hasSocialBar && hasPostText && isNotInsideComments) {
      console.log("LinkAI: Structural container found:", curr.tagName, curr.className.slice(0, 60));
      return curr;
    }
    curr = curr.parentElement;
  }

  // Final fallback 1: Use the grandparent of the editor form
  const form = editor.closest("form, .comments-comment-box__form-container, .comments-comment-box");
  if (form && form.parentElement && form.parentElement.parentElement) {
    return form.parentElement.parentElement;
  }

  // Final fallback 2: Climb up 12 levels (increased to ensure reaching post content)
  let fallback = editor;
  const climbChain = [];
  for (let i = 0; i < 12; i++) {
    if (fallback.parentElement && fallback.parentElement !== document.body) {
      fallback = fallback.parentElement;
      climbChain.push(`${fallback.tagName}.${fallback.className.split(' ').join('.')}`);
    } else {
      break;
    }
  }
  console.warn("LinkAI: Fallback post container selected. Climb path: " + climbChain.join(" -> "));
  return fallback;
}

// Helper to find the direct child of the post container that wraps the comments section
function getCommentsAreaChild(editor, postContainer) {
  let curr = editor;
  while (curr && curr.parentElement && curr.parentElement !== postContainer && curr.parentElement !== document.body) {
    curr = curr.parentElement;
  }
  return curr;
}

// Recursively extracts text from a DOM element while ignoring elements that match specific selectors
// or a specific node (e.g. the comments container), avoiding DOM cloning and associated network requests
function extractTextWithoutSelectors(element, selectorsToIgnore, nodeToIgnore = null) {
  if (!element) return "";
  
  let text = "";
  
  function traverse(node) {
    if (nodeToIgnore && node === nodeToIgnore) {
      return;
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
      return;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (const selector of selectorsToIgnore) {
        try {
          if (node.matches(selector)) {
            return;
          }
        } catch (e) {
          // Ignore invalid selector matching errors
        }
      }
      
      for (let child = node.firstChild; child; child = child.nextSibling) {
        traverse(child);
      }
    }
  }
  
  traverse(element);
  return text.trim();
}

// Extract description text from post container, avoiding sub-comment text
function extractPostContent(postContainer, editor = null) {
  // Selectors for description element, in order of preference (including stable data-view attributes)
  const descriptionSelectors = [
    '[data-view-name*="commentary"]',
    '[data-view-name*="description"]',
    '.feed-shared-update-v2__commentary',
    ".update-components-text",
    ".feed-shared-update-v2__description",
    ".feed-shared-text-view",
    ".feed-shared-text",
    ".feed-shared-update-v2__commentary-wrapper",
    ".feed-shared-update-v2__description-wrapper",
    '.attributed-text-segment-list__content',
    '[class*="attributed-text"]',
    '[data-view-name*="post-text"]',
    "[class*='commentary']",
    "[class*='description']",
    'span[dir="ltr"]',
    'span[lang]'
  ];

  for (const selector of descriptionSelectors) {
    const elements = postContainer.querySelectorAll(selector);
    for (const el of elements) {
      // Ensure the element is not inside comments, actor/header details, button, social bar, video players, or menus
      if (
        el.closest(".comments-comment-item") || 
        el.closest(".comments-comments-list") ||
        el.closest(".feed-shared-actor") ||
        el.closest(".update-components-actor") ||
        el.closest("[class*='actor']") ||
        el.closest("button") ||
        el.closest(".social-details-social-counts") ||
        el.closest(".feed-shared-social-action-bar") ||
        el.closest("[class*='video']") ||
        el.closest("[class*='player']") ||
        el.closest("[class*='control']") ||
        el.closest(".artdeco-dropdown") ||
        el.closest("[role='menu']") ||
        el.closest("[role='listbox']") ||
        el.closest("[role='dialog']")
      ) {
        continue;
      }
      const text = getCleanText(el);
      if (text && text.trim().length > 15) return text;
    }
  }

  // Backup selector: find primary content container by looking for span.break-words
  // excluding any spans that are inside comments containers or our injected UI
  const spans = postContainer.querySelectorAll("span.break-words");
  for (const span of spans) {
    if (
      span.closest(".comments-comment-item") || 
      span.closest(".comments-comments-list") ||
      span.closest(".linkai-container-host") ||
      span.closest(".linkai-container") ||
      span.closest(".feed-shared-actor") ||
      span.closest(".update-components-actor") ||
      span.closest("[class*='actor']") ||
      span.closest("button") ||
      span.closest(".social-details-social-counts") ||
      span.closest(".feed-shared-social-action-bar") ||
      span.closest("[class*='video']") ||
      span.closest("[class*='player']") ||
      span.closest("[class*='control']") ||
      span.closest(".artdeco-dropdown") ||
      span.closest("[role='menu']") ||
      span.closest("[role='listbox']") ||
      span.closest("[role='dialog']")
    ) {
      continue;
    }
    const text = getCleanText(span);
    if (text && text.trim().length > 15) return text;
  }

  // Ultimate fallback: Traverse container, strip comments/forms/buttons, and return remaining text content
  try {
    let commentsChild = null;
    if (editor) {
      commentsChild = getCommentsAreaChild(editor, postContainer);
    }

    const selectorsToRemove = [
      ".comments-comment-box",
      ".comments-comments-list",
      ".comments-comment-item",
      "form",
      ".social-details-social-counts",
      ".feed-shared-social-action-bar",
      ".feed-shared-social-actions",
      "button",
      ".linkai-container-host",
      ".linkai-container",
      ".comments-comment-box-container",
      "script",
      "style",
      "noscript",
      "iframe"
    ];
    
    const fallbackText = extractTextWithoutSelectors(postContainer, selectorsToRemove, commentsChild);
    if (fallbackText) return fallbackText;
  } catch (e) {
    console.error("Fallback text extraction failed", e);
  }

  return postContainer.textContent ? postContainer.textContent.trim() : "";
}

// Safe text extractor: strips out "see more" tags and extra padding without cloning the DOM
function getCleanText(element) {
  const ignoreSelectors = [
    ".feed-shared-inline-show-more-text__see-more-less-toggle",
    "button",
    "[role='button']"
  ];
  return extractTextWithoutSelectors(element, ignoreSelectors);
}

// Bypasses React state framework by trying multiple insertion techniques (execCommand, Paste simulation, and direct DOM write with event dispatch)
function autofillDraftJSEditor(editor, text) {
  // Focus the input
  editor.focus();

  // Method 1: execCommand "selectAll" then "insertText" (Most reliable for React / Draft.js / Lexical state sync)
  try {
    document.execCommand("selectAll", false, null);
    const success = document.execCommand("insertText", false, text);
    
    if (success && editor.textContent.trim() === text.trim()) {
      console.log("LinkAI: Text inserted successfully via execCommand");
      
      // Trigger backup input notifications
      const inputEvent = new Event("input", { bubbles: true, cancelable: true });
      editor.dispatchEvent(inputEvent);
      return;
    }
  } catch (e) {
    console.error("LinkAI: execCommand failed", e);
  }

  // Method 2: Clipboard Event (Paste simulation)
  try {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text);
    
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: dataTransfer,
      bubbles: true,
      cancelable: true
    });
    editor.dispatchEvent(pasteEvent);
    
    if (editor.textContent.trim() === text.trim()) {
      console.log("LinkAI: Text inserted successfully via Paste Event");
      return;
    }
  } catch (e) {
    console.error("LinkAI: Paste Event failed", e);
  }

  // Method 3: Direct DOM manipulation with input event dispatch (for React/Lexical fallback)
  try {
    editor.innerText = text;
    
    const inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true
    });
    editor.dispatchEvent(inputEvent);
    
    // Keystroke simulation backup
    const keyUpEvent = new KeyboardEvent("keyup", {
      bubbles: true,
      cancelable: true,
      key: " ",
      code: "Space",
      keyCode: 32
    });
    editor.dispatchEvent(keyUpEvent);
    
    console.log("LinkAI: Text inserted via direct DOM write and input event");
  } catch (e) {
    console.error("LinkAI: Direct DOM write failed", e);
  }
}

// Start helper to wait for page to settle and hydrate before running init
if (document.readyState === "complete") {
  setTimeout(init, 1000);
} else {
  window.addEventListener("load", () => {
    setTimeout(init, 1000);
  });
}
