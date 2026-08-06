// Firebase Web SDK REST / Quota Manager for Eloquix Chrome Extension

async function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// Fetch user profile from Firestore using REST API
async function getUserProfile(userId, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${userId}`;
  
  try {
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${idToken}` }
    });

    if (res.status === 404) {
      // User doc does not exist yet, create default free plan doc
      return await initializeUserProfile(userId, idToken);
    }

    if (!res.ok) {
      throw new Error(`Firestore read error: ${res.statusText}`);
    }

    const data = await res.json();
    return parseFirestoreDoc(data);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    throw err;
  }
}

// Initialize default document for new user
async function initializeUserProfile(userId, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${userId}`;
  const today = await getTodayDateString();

  const body = {
    fields: {
      plan: { stringValue: "free" },
      status: { stringValue: "active" },
      lastResetDate: { stringValue: today },
      commentsGeneratedToday: { integerValue: "0" },
      dailyLimit: { integerValue: String(PLAN_LIMITS.free) }
    }
  };

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Failed to initialize user document in Firestore.");
  }

  const data = await res.json();
  return parseFirestoreDoc(data);
}

// Parse Firestore Document format to clean JS object
function parseFirestoreDoc(doc) {
  const fields = doc.fields || {};
  return {
    plan: fields.plan?.stringValue || "free",
    status: fields.status?.stringValue || "active",
    lastResetDate: fields.lastResetDate?.stringValue || "",
    commentsGeneratedToday: parseInt(fields.commentsGeneratedToday?.integerValue || "0", 10),
    dailyLimit: parseInt(fields.dailyLimit?.integerValue || String(PLAN_LIMITS.free), 10)
  };
}

// Verify and Increment Daily Quota
async function verifyAndIncrementQuota(userId, idToken) {
  let profile = await getUserProfile(userId, idToken);
  const today = await getTodayDateString();

  // Reset daily count if date changed
  if (profile.lastResetDate !== today) {
    profile.commentsGeneratedToday = 0;
    profile.lastResetDate = today;
  }

  // Check quota limit
  const limit = PLAN_LIMITS[profile.plan] || PLAN_LIMITS.free;
  if (profile.commentsGeneratedToday >= limit) {
    throw new Error(`Daily limit reached (${profile.commentsGeneratedToday}/${limit} generated today). Upgrade your plan to get more AI comments!`);
  }

  // Increment usage count in Firestore
  const newCount = profile.commentsGeneratedToday + 1;
  const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=commentsGeneratedToday&updateMask.fieldPaths=lastResetDate`;
  
  const body = {
    fields: {
      commentsGeneratedToday: { integerValue: String(newCount) },
      lastResetDate: { stringValue: today }
    }
  };

  await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return {
    used: newCount,
    limit: limit,
    plan: profile.plan
  };
}
