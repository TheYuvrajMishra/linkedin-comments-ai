document.addEventListener("DOMContentLoaded", async () => {
  const toneSelect = document.getElementById("toneSelect");
  const customInstructionsInput = document.getElementById("customInstructions");
  const settingsForm = document.getElementById("settingsForm");
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

  // Load preferences from storage
  const preferences = await chrome.storage.local.get([
    "defaultTone",
    "customInstructions",
    "userAuth"
  ]);

  const activeBackendUrl = BACKEND_URL || "http://localhost:5000";
  if (preferences.defaultTone && toneSelect) toneSelect.value = preferences.defaultTone;
  if (preferences.customInstructions && customInstructionsInput) customInstructionsInput.value = preferences.customInstructions;

  // Check Backend Connection Status
  checkBackendHealth(activeBackendUrl);

  // Configure upgrade button links based on currency (INR vs USD)
  const isIndia = isIndiaUser();
  if (isIndia) {
    if (proBtn) {
      proBtn.href = PAYMENT_LINKS.inr.pro;
      proBtn.textContent = "⚡ Upgrade Pro (₹49/mo)";
    }
    if (ultraBtn) {
      ultraBtn.href = PAYMENT_LINKS.inr.ultra;
      ultraBtn.textContent = "🚀 Upgrade Ultra (₹99/mo)";
    }
  } else {
    if (proBtn) {
      proBtn.href = PAYMENT_LINKS.usd.pro;
      proBtn.textContent = "⚡ Upgrade Pro ($4.99/mo)";
    }
    if (ultraBtn) {
      ultraBtn.href = PAYMENT_LINKS.usd.ultra;
      ultraBtn.textContent = "🚀 Upgrade Ultra ($7.99/mo)";
    }
  }

  // Load User Account Quota info from Backend API Server
  const userAuth = preferences.userAuth;
  if (userAuth && userAuth.uid) {
    userEmail.textContent = userAuth.email || "Authenticated User";
    if (googleLoginBtn) googleLoginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    try {
      const profile = await getUserProfile(userAuth.uid, userAuth.idToken);
      updateQuotaUI(profile);
    } catch (e) {
      console.warn("Could not fetch user profile from backend:", e);
    }
  } else {
    userEmail.textContent = "Guest User";
    planPill.textContent = "FREE PLAN";
    if (googleLoginBtn) googleLoginBtn.style.display = "flex";
    if (logoutBtn) logoutBtn.style.display = "none";

    try {
      const profile = await getUserProfile("guest_user");
      updateQuotaUI(profile);
    } catch (e) {
      console.warn("Could not fetch guest profile:", e);
    }
  }

  function updateQuotaUI(profile) {
    const plan = (profile.plan || "free").toUpperCase();
    planPill.textContent = `${plan} PLAN`;

    const limit = profile.dailyLimit || PLAN_LIMITS[profile.plan] || 2;
    const used = profile.commentsGeneratedToday || 0;
    quotaText.textContent = `${used} / ${limit} used`;

    const percentage = Math.min(100, Math.round((used / limit) * 100));
    quotaFill.style.width = `${percentage}%`;
  }

  // Check Backend Server Health
  async function checkBackendHealth(serverUrl) {
    try {
      const res = await fetch(`${serverUrl}/api/v1/health`, { method: "GET" });
      const data = await res.json();

      if (res.ok && data.status === "ok") {
        if (data.hasGroqKey) {
          statusBadge.textContent = "Server Active";
          statusBadge.classList.remove("disconnected");
        } else {
          statusBadge.textContent = "Groq Key Missing";
          statusBadge.classList.add("disconnected");
        }
      } else {
        statusBadge.textContent = "Server Error";
        statusBadge.classList.add("disconnected");
      }
    } catch (err) {
      statusBadge.textContent = "Server Offline";
      statusBadge.classList.add("disconnected");
    }
  }

  // Save Preferences Listener
  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tone = toneSelect ? toneSelect.value : "insightful";
    const customInstructions = customInstructionsInput ? customInstructionsInput.value.trim() : "";

    try {
      await chrome.storage.local.set({
        defaultTone: tone,
        customInstructions: customInstructions
      });

      checkBackendHealth(BACKEND_URL);

      // Save animation feedback
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
      chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (!chrome.runtime.lastError && token) {
          await processGoogleUser(token);
          return;
        }

        const redirectUri = chrome.identity.getRedirectURL();
        const manifest = chrome.runtime.getManifest();
        const cid = manifest?.oauth2?.client_id || "";
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(cid)}&` +
          `response_type=token&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `scope=${encodeURIComponent("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile")}`;

        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
              alert("Sign-in failed: " + (chrome.runtime.lastError ? chrome.runtime.lastError.message : "Cancelled"));
              return;
            }

            try {
              const urlObj = new URL(redirectUrl);
              const hashParams = new URLSearchParams(urlObj.hash.substring(1));
              const accessToken = hashParams.get("access_token");

              if (!accessToken) throw new Error("No access token returned.");
              await processGoogleUser(accessToken);
            } catch (err) {
              console.error("Failed to authenticate user:", err);
              alert("Could not process Google Sign-In data.");
            }
          }
        );
      });
    });
  }

  async function processGoogleUser(token) {
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

      await verifyAndRegisterUser(userAuth);
      await chrome.storage.local.set({ userAuth });
      window.location.reload();
    } catch (err) {
      console.error("Failed to authenticate user with backend:", err);
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await chrome.storage.local.remove("userAuth");
      window.location.reload();
    });
  }
});
