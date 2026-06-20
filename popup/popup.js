document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKey");
  const modelSelect = document.getElementById("modelSelect");
  const toneSelect = document.getElementById("toneSelect");
  const customInstructionsInput = document.getElementById("customInstructions");
  const settingsForm = document.getElementById("settingsForm");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const saveBtn = document.getElementById("saveBtn");
  const statusBadge = document.getElementById("statusBadge");

  // Load saved preferences
  try {
    const preferences = await chrome.storage.local.get([
      "groqApiKey",
      "defaultModel",
      "defaultTone",
      "customInstructions"
    ]);

    if (preferences.groqApiKey) {
      apiKeyInput.value = preferences.groqApiKey;
      updateStatus(true);
    } else {
      updateStatus(false);
    }

    if (preferences.defaultModel) {
      modelSelect.value = preferences.defaultModel;
    }
    if (preferences.defaultTone) {
      toneSelect.value = preferences.defaultTone;
    }
    if (preferences.customInstructions) {
      customInstructionsInput.value = preferences.customInstructions;
    }
  } catch (err) {
    console.error("Error loading preferences:", err);
  }

  // Toggle API key visibility
  togglePasswordBtn.addEventListener("click", () => {
    const type = apiKeyInput.getAttribute("type") === "password" ? "text" : "password";
    apiKeyInput.setAttribute("type", type);
    
    // Toggle icon state or opacity
    togglePasswordBtn.style.color = type === "text" ? "#fff" : "var(--text-secondary)";
  });

  // Save preferences
  settingsForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const tone = toneSelect.value;
    const customInstructions = customInstructionsInput.value.trim();

    try {
      await chrome.storage.local.set({
        groqApiKey: apiKey,
        defaultModel: model,
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
