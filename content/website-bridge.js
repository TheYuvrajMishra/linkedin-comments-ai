// content/website-bridge.js
// Chrome Extension content script running on companion website domain
// Automatically syncs Firebase Auth state from companion website to extension chrome.storage.local

(function() {
  console.log("[Eloquix Extension Bridge] Loaded on companion site.");

  function syncSessionToExtension() {
    try {
      const rawAuth = localStorage.getItem("eloquix_auth");
      if (rawAuth) {
        const userAuth = JSON.parse(rawAuth);
        if (userAuth && userAuth.uid && userAuth.email) {
          chrome.storage.local.set({ userAuth }, () => {
            console.log("[Eloquix Extension Bridge] Synced active session:", userAuth.email);
          });
          return;
        }
      }
      // If no valid auth in website localStorage, remove userAuth from extension storage
      chrome.storage.local.remove("userAuth", () => {
        console.log("[Eloquix Extension Bridge] Cleared session (Logged Out).");
      });
    } catch (e) {
      console.error("[Eloquix Extension Bridge] Failed to sync localStorage session:", e);
    }
  }

  // 1. Sync immediately when page starts/loads
  syncSessionToExtension();

  // 2. Listen for postMessage from React app
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "ELOQUIX_AUTH_STATE") {
      const userAuth = event.data.userAuth;
      if (userAuth && userAuth.uid && userAuth.email) {
        chrome.storage.local.set({ userAuth }, () => {
          console.log("[Eloquix Extension Bridge] Received login event:", userAuth.email);
        });
      } else {
        chrome.storage.local.remove("userAuth", () => {
          console.log("[Eloquix Extension Bridge] Received logout event.");
        });
      }
    }
  });

  // 3. Listen for window storage changes (cross-tab sync)
  window.addEventListener("storage", (event) => {
    if (event.key === "eloquix_auth") {
      syncSessionToExtension();
    }
  });
})();
