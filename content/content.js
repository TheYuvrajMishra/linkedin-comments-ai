// Content script for LinkedIn AI Comment Generator

const SPARKLE_SVG = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display: inline-block; vertical-align: middle;"><path d="M9 2.5a.5.5 0 0 1 1 0l.9 3.1 3.1.9a.5.5 0 0 1 0 1l-3.1.9-.9 3.1a.5.5 0 0 1-1 0l-.9-3.1-3.1-.9a.5.5 0 0 1 0-1l3.1-.9.9-3.1zm10.5 8a.5.5 0 0 1 1 0l.45 1.55 1.55.45a.5.5 0 0 1 0 1l-1.55.45-.45 1.55a.5.5 0 0 1-1 0l-.45-1.55-1.55-.45a.5.5 0 0 1 0-1l1.55-.45.45-1.55zM15 15.5a.5.5 0 0 1 1 0l.45 1.55 1.55.45a.5.5 0 0 1 0 1l-1.55.45-.45 1.55a.5.5 0 0 1-1 0l-.45-1.55-1.55-.45a.5.5 0 0 1 0-1l1.55-.45.45-1.55z"/></svg>`;

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
  gap: 5px;
  background: transparent;
  color: #8e8e93;
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: none;
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  outline: none;
  height: 28px;
  white-space: nowrap;
}

.linkai-btn:hover:not(:disabled) {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.04);
}

:host-context([class*="theme--dark"]) .linkai-btn {
  color: #9ca3af;
}

:host-context([class*="theme--dark"]) .linkai-btn:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.linkai-btn:disabled {
  color: #ccd0d5;
  cursor: not-allowed;
  background: transparent;
  box-shadow: none;
  transform: none;
}

.linkai-btn-icon {
  width: 13px;
  height: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.linkai-btn:hover:not(:disabled) .linkai-btn-icon {
  transform: rotate(15deg) scale(1.1);
}

.linkai-tone-trigger {
  background: transparent;
  border: none;
  color: #8e8e93;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  margin-left: 4px;
  white-space: nowrap;
}

:host-context([class*="theme--dark"]) .linkai-tone-trigger {
  color: #9ca3af;
}

.linkai-tone-trigger:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.04);
}

:host-context([class*="theme--dark"]) .linkai-tone-trigger:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.linkai-dropdown {
  position: absolute;
  bottom: 34px;
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
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.linkai-item.selected {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
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
  color: #8e8e93 !important;
}

.linkai-status.success {
  color: #ffffff !important;
}

.linkai-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  border-top-color: #8a8a8a;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

:host-context([class*="theme--dark"]) .linkai-spinner {
  border-color: rgba(255, 255, 255, 0.15);
  border-top-color: #9ca3af;
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
  try {
    closeActiveDropdownPortal();
  } catch (e) {}
  console.log("LinkAI: Extension context was invalidated. Cleaned up observers.");
}

let activeDropdownPortal = null;

// Renders the dropdown using a portal (appending directly to document.body)
// positioned dynamically to prevent layout/overflow clipping from LinkedIn's feed containers
function showToneDropdownPortal(triggerElement, currentTone, onSelect) {
  if (activeDropdownPortal) {
    closeActiveDropdownPortal();
  }

  // Create portal dropdown container
  const portal = document.createElement("div");
  portal.className = "linkai-portal-dropdown";
  
  // Style portal
  portal.style.position = "fixed";
  portal.style.background = "#111827";
  portal.style.border = "1px solid rgba(255, 255, 255, 0.15)";
  portal.style.borderRadius = "12px";
  portal.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.4)";
  portal.style.padding = "6px";
  portal.style.minWidth = "145px";
  portal.style.zIndex = "999999";
  portal.style.display = "flex";
  portal.style.flexDirection = "column";
  portal.style.gap = "2px";
  portal.style.fontFamily = "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  portal.style.boxSizing = "border-box";
  
  // Render options
  TONES.forEach(tone => {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "8px";
    item.style.padding = "8px 10px";
    item.style.color = tone.id === currentTone ? "#60a5fa" : "#d1d5db";
    item.style.background = tone.id === currentTone ? "rgba(10, 102, 194, 0.25)" : "transparent";
    item.style.fontSize = "12px";
    item.style.fontWeight = tone.id === currentTone ? "600" : "500";
    item.style.cursor = "pointer";
    item.style.borderRadius = "8px";
    item.style.transition = "all 0.2s";
    item.style.userSelect = "none";
    item.innerText = `${tone.emoji} ${tone.label}`;
    
    // Hover styling
    item.addEventListener("mouseenter", () => {
      item.style.background = "rgba(59, 130, 246, 0.18)";
      item.style.color = "#ffffff";
    });
    item.addEventListener("mouseleave", () => {
      item.style.background = tone.id === currentTone ? "rgba(10, 102, 194, 0.25)" : "transparent";
      item.style.color = tone.id === currentTone ? "#60a5fa" : "#d1d5db";
    });
    
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelect(tone.id);
      closeActiveDropdownPortal();
    });
    
    portal.appendChild(item);
  });

  document.body.appendChild(portal);
  activeDropdownPortal = portal;

  // Calculate coordinates relative to viewport
  const rect = triggerElement.getBoundingClientRect();
  const dropdownHeight = portal.offsetHeight || 178; 
  
  // Try placing it above the trigger first
  let topPos = rect.top - dropdownHeight - 6;
  if (topPos < 0) {
    // If it goes off-screen at the top, place it below the trigger
    topPos = rect.bottom + 6;
  }
  
  portal.style.top = `${topPos}px`;
  portal.style.left = `${rect.left}px`;

  // Dynamic closure on click-away, scroll, or resize
  setTimeout(() => {
    document.addEventListener("click", closeActiveDropdownPortal);
    window.addEventListener("scroll", closeActiveDropdownPortal, { capture: true, once: true });
    window.addEventListener("resize", closeActiveDropdownPortal, { once: true });
  }, 0);
}

function closeActiveDropdownPortal() {
  if (activeDropdownPortal) {
    activeDropdownPortal.remove();
    activeDropdownPortal = null;
    document.removeEventListener("click", closeActiveDropdownPortal);
    window.removeEventListener("scroll", closeActiveDropdownPortal, true);
    window.removeEventListener("resize", closeActiveDropdownPortal);
  }
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
  genBtn.innerHTML = `<span class="linkai-btn-icon">${SPARKLE_SVG}</span><span class="linkai-btn-text">generate</span>`;
  
  // Tone Dropdown Trigger Button
  const toneTrigger = document.createElement("button");
  toneTrigger.type = "button";
  toneTrigger.className = "linkai-tone-trigger";

  root.appendChild(genBtn);
  root.appendChild(toneTrigger);
  
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

  function updateToneUI() {
    const activeTone = TONES.find(t => t.id === currentTone) || TONES[0];
    toneTrigger.innerHTML = `<span class="linkai-btn-icon">${SPARKLE_SVG}</span><span class="linkai-btn-text">${activeTone.label.toLowerCase()}</span><span style="font-size: 8px; margin-left: 2px; opacity: 0.6;">▼</span>`;
  }

  updateToneUI();

  // Dropdown Toggle (using portal dropdown to prevent layout clipping)
  toneTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    
    if (!isContextValid()) {
      alert("Extension reloaded. Please refresh the page.");
      return;
    }
    
    showToneDropdownPortal(toneTrigger, currentTone, (selectedToneId) => {
      currentTone = selectedToneId;
      chrome.storage.local.set({ defaultTone: selectedToneId });
      updateToneUI();
    });
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
    console.log("LinkAI: Post Container found:", postContainer);

    if (!postContainer) {
      showStatus("Could not find post text container.", "error");
      return;
    }

    // Extract text content of the post
    const postText = extractPostContent(postContainer, editor);
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
      genBtn.innerHTML = `<span class="linkai-spinner"></span><span class="linkai-btn-text">generating...</span>`;
    } else {
      genBtn.innerHTML = `<span class="linkai-btn-icon">${SPARKLE_SVG}</span><span class="linkai-btn-text">generate</span>`;
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

// Helper to check if an element is part of the comments section
function isCommentElement(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  return (
    el.classList.contains("comments-comment-item") ||
    el.classList.contains("comments-comments-list") ||
    el.classList.contains("comments-comment-box") ||
    el.classList.contains("comments-comment-box-container") ||
    (typeof el.matches === "function" && (el.matches("[class*='comments-container']") || el.matches("[class*='comments-box']"))) ||
    (typeof el.closest === "function" && (
      el.closest(".comments-comment-item") !== null ||
      el.closest(".comments-comments-list") !== null ||
      el.closest(".comments-comment-box") !== null ||
      el.closest(".comments-comment-box-container") !== null ||
      el.closest("[class*='comments-container']") !== null
    ))
  );
}

// Traverse upwards to find the container div for the LinkedIn update
function findPostContainer(editor) {
  // Step 1: Escape the comment box entirely before searching
  const commentBox = editor.closest(
    ".comments-comment-box, .comments-comment-box-container, .comments-quick-comment-box, form"
  );
  const searchRoot = commentBox
    ? commentBox.parentElement
    : editor.parentElement;
    
  console.log("LinkAI: Search root (after escaping comment box):", searchRoot);
  if (!searchRoot) return null;

  // Step 2: Try stable selectors from searchRoot upward
  const selectors = [
    '[data-view-name="feed-update"]',
    '[data-view-name="feed-full-update"]',
    '[data-view-name*="update"]',
    'article',
    '[role="article"]',
    '[data-urn]',
    '[data-id]',
    '[data-activity-id]',
    '.feed-shared-update-v2',
    '.occludable-update',
  ];

  let curr = searchRoot;
  while (curr && curr !== document.body) {
    for (const sel of selectors) {
      try {
        if (curr.matches(sel) && !isCommentElement(curr)) {
          return curr;
        }
      } catch (e) {}
    }
    curr = curr.parentElement;
  }

  // Step 3: Structural heuristic - find ancestor with social bar + post text
  curr = searchRoot;
  while (curr && curr !== document.body) {
    const hasSocialBar = curr.querySelector(
      '[data-view-name*="social-action"], .social-details-social-activity, [aria-label*="React"], [aria-label*="Comment"], [aria-label*="Like"]'
    );
    const hasText = curr.querySelector('span[dir="ltr"], span[lang]');
    if (hasSocialBar && hasText && !isCommentElement(curr)) {
      return curr;
    }
    curr = curr.parentElement;
  }

  // Step 4: Climb 15 levels from commentBox (not editor)
  let fallback = commentBox || editor;
  for (let i = 0; i < 15; i++) {
    if (fallback.parentElement && fallback.parentElement !== document.body) {
      fallback = fallback.parentElement;
    } else break;
  }
  return fallback;
}

// Helper to find the direct child of the post container that wraps the comments section
// to prevent traversing into it
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
  // Step 1: Try data-lazy-mount-id scoped text containers (current LinkedIn structure)
  // LinkedIn wraps post body in a div with data-lazy-mount-id, find the first span[dir="ltr"]
  // that is NOT inside comments, actors, or social elements.
  const allSpans = postContainer.querySelectorAll('span[dir="ltr"], span[lang]');
  const candidates = [];
  for (const span of allSpans) {
    if (
      span.closest(".comments-comment-item") ||
      span.closest(".comments-comments-list") ||
      span.closest(".comments-comment-box") ||
      span.closest(".linkai-container-host") ||
      span.closest('[data-view-name*="comment"]') ||
      span.closest(".feed-shared-actor") ||
      span.closest(".update-components-actor") ||
      span.closest("[class*='actor']") ||
      span.closest(".social-details-social-counts") ||
      span.closest(".feed-shared-social-action-bar") ||
      span.closest("[class*='social-']") ||
      span.closest("button")
    ) {
      continue;
    }

    const text = span.innerText?.trim() || span.textContent?.trim() || "";
    if (text.length > 20) { // meaningful post text
      const trimmed = text.trim();
      
      // If we already have this text or a larger text that contains it, skip.
      if (candidates.some(t => t.includes(trimmed))) {
        continue;
      }
      
      // If this text contains any existing text in our list, replace the shorter text with this longer one.
      const index = candidates.findIndex(t => trimmed.includes(t));
      if (index !== -1) {
        candidates[index] = trimmed;
      } else {
        candidates.push(trimmed);
      }
    }
  }

  if (candidates.length > 0) {
    return candidates.join("\n\n");
  }

  // Step 2: Use descriptionSelectors fallback...
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
    "span.break-words"
  ];

  const extractedTexts = [];

  for (const selector of descriptionSelectors) {
    const elements = postContainer.querySelectorAll(selector);
    for (const el of elements) {
      // Ensure the element is not inside comments, actor/header details, button, social bar, video players, or menus.
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
        el.closest("[role='listbox']")
      ) {
        continue;
      }
      
      const text = getCleanText(el);
      if (text && text.trim().length >= 2) {
        const trimmed = text.trim();
        
        // If we already have this text or a larger text that contains it, skip.
        if (extractedTexts.some(t => t.includes(trimmed))) {
          continue;
        }
        
        // If this text contains any existing text in our list, replace the shorter text with this longer one.
        const index = extractedTexts.findIndex(t => trimmed.includes(t));
        if (index !== -1) {
          extractedTexts[index] = trimmed;
        } else {
          extractedTexts.push(trimmed);
        }
      }
    }
  }

  if (extractedTexts.length > 0) {
    return extractedTexts.join("\n\n");
  }

  // Step 3: Scoped fallback - strip comments/forms/buttons, and return remaining text content
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
      "iframe",
      "[class*='actor']",
      "[class*='header']",
      "[class*='avatar']",
      "[class*='profile']",
      "[class*='social-']",
      "a[href*='/in/']",
      "a[href*='/company/']",
      "time"
    ];
    
    const fallbackText = extractTextWithoutSelectors(postContainer, selectorsToRemove, commentsChild);
    if (fallbackText && fallbackText.trim().length >= 2) return fallbackText.trim();
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
