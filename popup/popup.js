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

  const webAuthBtn = document.getElementById("webAuthBtn");
  const webAuthBtnText = document.getElementById("webAuthBtnText");

  const activeWebsiteUrl = (typeof WEBSITE_URL !== "undefined" ? WEBSITE_URL : "http://localhost:5173");
  const activeBackendUrl = (typeof BACKEND_URL !== "undefined" ? BACKEND_URL : "http://localhost:5000");

  // Load preferences from storage
  const preferences = await chrome.storage.local.get([
    "defaultTone",
    "customInstructions",
    "userAuth"
  ]);

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
  if (userAuth && userAuth.uid && userAuth.email) {
    userEmail.textContent = userAuth.email;
    if (webAuthBtnText) webAuthBtnText.textContent = "Manage Account on Website";

    try {
      const profile = await getUserProfile(userAuth.uid, userAuth.idToken);
      updateQuotaUI(profile);
    } catch (e) {
      console.warn("Could not fetch user profile from backend:", e);
    }
  } else {
    userEmail.textContent = "Not Authenticated";
    planPill.textContent = "FREE PLAN";
    if (webAuthBtnText) webAuthBtnText.textContent = "Log In on Companion Site";

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

  // Open Companion Auth Center Website at /extension route
  if (webAuthBtn) {
    webAuthBtn.addEventListener("click", () => {
      chrome.tabs.create({ url: activeWebsiteUrl + "/extension" });
    });
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
});
