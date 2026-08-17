// Frontend Configuration for Quick Comment AI Chrome Extension
// Communicates with backend API server and companion auth website

const BACKEND_URL = "http://localhost:5000";
const WEBSITE_URL = "http://localhost:5173";

// Fallback Payment Links if backend is unreachable
const PAYMENT_LINKS = {
  inr: {
    pro: "https://rzp.io/rzp/8fyIuiTV",
    ultra: "https://rzp.io/rzp/AKMnRQ9h"
  },
  usd: {
    pro: "https://rzp.io/rzp/lwkO8dn8",
    ultra: "https://rzp.io/rzp/5SoMpUI"
  }
};

// Plan limits for display reference
const PLAN_LIMITS = {
  free: 2,
  pro: 20,
  ultra: 50
};

// Auto-detect if user is in India based on browser timezone
function isIndiaUser() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Kolkata" || tz === "Asia/Calcutta";
  } catch (e) {
    return true;
  }
}
