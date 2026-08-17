// Frontend Configuration for Eloquix Chrome Extension
// Communicates with backend API server and companion auth website

const BACKEND_URL = "http://localhost:5000";
const WEBSITE_URL = "http://localhost:5173";

// Fallback Payment Links if backend is unreachable
const PAYMENT_LINKS = {
  inr: {
    pro: "https://rzp.io/rzp/YJ677Vl",
    ultra: "https://rzp.io/rzp/Oyz6stR"
  },
  usd: {
    pro: "https://rzp.io/rzp/twQPHug",
    ultra: "https://rzp.io/rzp/7d2rZJB"
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
