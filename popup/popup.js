document.addEventListener("DOMContentLoaded", async () => {
  // Ensure .env variables are loaded asynchronously before reading PAYMENT_LINKS
  if (typeof loadEnvVariables === "function") {
    await loadEnvVariables();
  }

  const apiKeyInput = document.getElementById("apiKey");
  const toneSelect = document.getElementById("toneSelect");
  const customInstructionsInput = document.getElementById("customInstructions");
  const settingsForm = document.getElementById("settingsForm");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const saveBtn = document.getElementById("saveBtn");
  const statusBadge = document.getElementById("statusBadge");

  const userEmail = document.getElementById("userEmail");
  const planPill = document.getElementById("planPill");
  const quotaText = document.getElementById("quotaText");
  const quotaFill = document.getElementById("quotaFill");

  const proBtn = document.getElementById("proBtn");
  const ultraBtn = document.getElementById("ultraBtn");

  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  // Dynamically evaluate PAYMENT_LINKS from .env
  const inrPro = PAYMENT_LINKS.inr.pro || "https://rzp.io/rzp/hcA5ffEW";
  const inrUltra = PAYMENT_LINKS.inr.ultra || "https://rzp.io/rzp/9gxUjX5";
  const usdPro = PAYMENT_LINKS.usd.pro || "https://rzp.io/rzp/twQPHug";
  const usdUltra = PAYMENT_LINKS.usd.ultra || "https://rzp.io/rzp/7d2rZJB";

  // Configure upgrade button links & labels based on currency (INR vs USD)
  const isIndia = isIndiaUser();
  if (isIndia) {
    proBtn.href = inrPro;
    proBtn.textContent = "⚡ Upgrade Pro (₹99/mo)";
    ultraBtn.href = inrUltra;
    ultraBtn.textContent = "🚀 Upgrade Ultra (₹149/mo)";
  } else {
    proBtn.href = usdPro;
    proBtn.textContent = "⚡ Upgrade Pro ($4.99/mo)";
    ultraBtn.href = usdUltra;
    ultraBtn.textContent = "🚀 Upgrade Ultra ($7.99/mo)";
  }

  // Load saved preferences & user authentication
  try {
    const preferences = await chrome.storage.local.get([
      "groqApiKey",
      "defaultModel",
      "defaultTone",
      "customInstructions",
      "userAuth"
    ]);

    if (preferences.groqApiKey) {
      apiKeyInput.value = preferences.groqApiKey;
      updateStatus(true);
    } else {
      updateStatus(false);
    }

    if (preferences.defaultTone) {
      toneSelect.value = preferences.defaultTone;
    }
    if (preferences.customInstructions) {
      customInstructionsInput.value = preferences.customInstructions;
    }

    // Load User Account Quota info from Firestore (or local guest tracking)
    if (preferences.userAuth && preferences.userAuth.uid && preferences.userAuth.idToken) {
      userEmail.textContent = preferences.userAuth.email || "Active User";
      if (googleLoginBtn) googleLoginBtn.style.display = "none";
      if (logoutBtn) logoutBtn.style.display = "inline-block";

      try {
        const profile = await getUserProfile(preferences.userAuth.uid, preferences.userAuth.idToken);
        const plan = (profile.plan || "free").toUpperCase();
        planPill.textContent = `${plan} PLAN`;
        
        const limit = profile.dailyLimit || PLAN_LIMITS[profile.plan] || 2;
        const used = profile.commentsGeneratedToday || 0;
        quotaText.textContent = `${used} / ${limit} used`;
        
        const percentage = Math.min(100, Math.round((used / limit) * 100));
        quotaFill.style.width = `${percentage}%`;
      } catch (e) {
        console.warn("Could not fetch latest Firestore profile:", e);
      }
    } else {
      userEmail.textContent = "Free Tier User";
      planPill.textContent = "FREE PLAN";
      if (googleLoginBtn) googleLoginBtn.style.display = "flex";
      if (logoutBtn) logoutBtn.style.display = "none";

      const today = new Date().toISOString().split("T")[0];
      const localData = await chrome.storage.local.get(["guestUsage"]);
      let guestUsage = localData.guestUsage || { date: today, count: 0 };
      if (guestUsage.date !== today) {
        guestUsage = { date: today, count: 0 };
      }
      
      const used = guestUsage.count || 0;
      const limit = PLAN_LIMITS.free; // 2
      quotaText.textContent = `${used} / ${limit} used today`;
      
      const percentage = Math.min(100, Math.round((used / limit) * 100));
      quotaFill.style.width = `${percentage}%`;
    }

  } catch (err) {
    console.error("Error loading preferences:", err);
  }

  // Toggle API key visibility
  togglePasswordBtn.addEventListener("click", () => {
    const type = apiKeyInput.getAttribute("type") === "password" ? "text" : "password";
    apiKeyInput.setAttribute("type", type);
    togglePasswordBtn.style.color = type === "text" ? "#fff" : "var(--text-secondary)";
  });

  // Save preferences locally
  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const apiKey = apiKeyInput.value.trim();
    const tone = toneSelect.value;
    const customInstructions = customInstructionsInput.value.trim();

    try {
      await chrome.storage.local.set({
        groqApiKey: apiKey,
        defaultTone: tone,
        customInstructions: customInstructions
      });

      // Update status UI
      updateStatus(!!apiKey);

      // Trigger visual save success animation
      const originalText = saveBtn.querySelector("span").textContent;
      saveBtn.classList.add("success");
      saveBtn.querySelector("span").textContent = "Preferences Saved!";
      saveBtn.disabled = true;

      setTimeout(() => {
        saveBtn.classList.remove("success");
        saveBtn.querySelector("span").textContent = originalText;
        saveBtn.disabled = false;
      }, 1800);

    } catch (err) {
      console.error("Error saving preferences:", err);
      alert("Failed to save settings. Please try again.");
    }
  });

  // Google Auth Button Handler
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      // 1. Try Chrome native getAuthToken first
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (!chrome.runtime.lastError && token) {
          await fetchAndSaveGoogleUser(token);
          return;
        }

        console.warn("getAuthToken failed, attempting launchWebAuthFlow fallback...", chrome.runtime.lastError);

        // 2. Fallback to launchWebAuthFlow with configured OAuth Client ID
        const redirectUri = chrome.identity.getRedirectURL();
        const cid = typeof googleClientId !== "undefined" ? googleClientId : "523401799544-94cgm4rc47ejg5u03m9cttch1g44c330.apps.googleusercontent.com";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(cid)}&` +
          `response_type=token&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")}`;

        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
              console.error("Auth flow error:", chrome.runtime.lastError);
              alert("Sign-in failed: " + (chrome.runtime.lastError ? chrome.runtime.lastError.message : "Cancelled"));
              return;
            }

            try {
              const urlObj = new URL(redirectUrl);
              const hashParams = new URLSearchParams(urlObj.hash.substring(1));
              const accessToken = hashParams.get("access_token");

              if (!accessToken) {
                throw new Error("No access token returned.");
              }

              await fetchAndSaveGoogleUser(accessToken);
            } catch (err) {
              console.error("Failed to authenticate user:", err);
              alert("Could not process Google Sign-In data.");
            }
          }
        );
      });
    });
  }

  async function fetchAndSaveGoogleUser(token) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const googleUser = await res.json();

      const userAuth = {
        uid: googleUser.id,
        email: googleUser.email,
        idToken: token
      };

      await chrome.storage.local.set({ userAuth });
      window.location.reload();
    } catch (err) {
      console.error("Failed to store user authentication:", err);
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await chrome.storage.local.remove("userAuth");
      window.location.reload();
    });
  }

  // Update status badge helper
  function updateStatus(hasKey) {
    if (hasKey) {
      statusBadge.textContent = "Active";
      statusBadge.classList.remove("disconnected");
    } else {
      statusBadge.textContent = "Key Missing";
      statusBadge.classList.add("disconnected");
    }
  }
});
