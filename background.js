// Background service worker for Eloquix Chrome Extension
importScripts("config.js", "firebase-db.js");

// In-memory client cache for generated comments
const commentCache = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "generateComment") {
    handleCommentGeneration(request)
      .then(res => sendResponse({ success: true, comment: res.comment, usage: res.usage }))
      .catch(error => sendResponse({ success: false, error: error.message || String(error) }));
    return true; // Keep message channel open for asynchronous response
  }
});

async function handleCommentGeneration({ postText, tone, customInstructions, regenerate }) {
  // 1. Get backend URL & user authentication from storage
  const storage = await chrome.storage.local.get(["backendUrl", "userAuth"]);
  const backendUrl = storage.backendUrl || BACKEND_URL || "http://localhost:5000";
  const userAuth = storage.userAuth || {};
  const uid = userAuth.uid || "guest_user";

  // Sanitize input
  const sanitizedPostText = (postText || "").replace(/"""/g, '"');
  const sanitizedCustomInstructions = customInstructions ? customInstructions.replace(/"""/g, '"') : "";

  // 2. Client-side memory cache check
  const cacheKey = `${hashString(sanitizedPostText)}_${tone}_${hashString(sanitizedCustomInstructions)}`;
  if (regenerate) {
    commentCache.delete(cacheKey);
  } else if (commentCache.has(cacheKey)) {
    console.log("Serving comment from extension client cache");
    return commentCache.get(cacheKey);
  }

  // 3. Delegate generation & quota management to Backend Server Endpoint
  try {
    const response = await fetch(`${backendUrl}/api/v1/comments/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": userAuth.idToken ? `Bearer ${userAuth.idToken}` : ""
      },
      body: JSON.stringify({
        uid: uid,
        postText: sanitizedPostText,
        tone: tone,
        customInstructions: sanitizedCustomInstructions,
        regenerate: regenerate
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(data.error || "Daily generation limit reached. Upgrade your plan for more AI comments!");
      }
      const errMsg = data.error || `Backend server error (HTTP ${response.status})`;
      throw new Error(errMsg);
    }

    if (!data.success || !data.comment) {
      throw new Error(data.error || "Backend failed to return a valid AI comment.");
    }

    // Save in client cache
    commentCache.set(cacheKey, data.comment);

    return {
      comment: data.comment,
      usage: data.usage
    };
  } catch (error) {
    console.error("Backend generation request failed:", error);
    // Friendly error message if backend is offline
    if (error.message && error.message.includes("Failed to fetch")) {
      throw new Error("Unable to connect to Eloquix Backend Server. Please check if the server is running on http://localhost:5000.");
    }
    throw error;
  }
}

// Simple string hashing function for caching
function hashString(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(16);
}
