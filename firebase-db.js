// Backend API Client Helper for User Profile & Quota Tracking

async function getUserProfile(userId, idToken) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/user/profile?uid=${encodeURIComponent(userId || "guest_user")}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": idToken ? `Bearer ${idToken}` : ""
      }
    });

    if (!res.ok) {
      throw new Error(`Backend error: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.success && data.profile) {
      return data.profile;
    }

    // Default fallback
    return {
      plan: "free",
      commentsGeneratedToday: 0,
      dailyLimit: PLAN_LIMITS.free
    };
  } catch (err) {
    return {
      plan: "free",
      commentsGeneratedToday: 0,
      dailyLimit: PLAN_LIMITS.free
    };
  }
}

async function verifyAndRegisterUser(userAuth) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        uid: userAuth.uid,
        email: userAuth.email,
        idToken: userAuth.idToken
      })
    });

    if (!res.ok) {
      throw new Error(`Auth verification failed: ${res.statusText}`);
    }

    const data = await res.json();
    return data.profile;
  } catch (err) {
    console.error("User registration with backend server failed:", err);
    throw err;
  }
}
