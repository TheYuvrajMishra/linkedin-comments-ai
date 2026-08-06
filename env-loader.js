// env-loader.js: Loads variables from .env into window.ENV for Chrome Extension client scripts
window.ENV = window.ENV || {};

async function loadEnvVariables() {
  try {
    const envUrl = chrome.runtime.getURL(".env");
    const res = await fetch(envUrl);
    if (!res.ok) return;
    const text = await res.text();
    
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        window.ENV[key] = value;
      }
    }
  } catch (err) {
    console.warn("Could not load .env file dynamically:", err);
  }
}

// Initial auto-fetch execution
loadEnvVariables();
