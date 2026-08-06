// Dynamic Config Loader from .env file
// Reads environment variables purely from .env at extension runtime

function getEnv(key) {
  return (window.ENV && window.ENV[key]) ? window.ENV[key] : "";
}

// Dynamically construct Firebase Configuration from .env
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID"),
  measurementId: getEnv("FIREBASE_MEASUREMENT_ID")
};

const googleClientId = getEnv("GOOGLE_OAUTH_CLIENT_ID");

// Pricing Tiers & Daily Limits
const PLAN_LIMITS = {
  free: 2,
  pro: 20,
  ultra: 50
};

// Razorpay Links loaded directly from .env variables
const PAYMENT_LINKS = {
  inr: {
    pro: getEnv("RAZORPAY_PRO_LINK_INR"),
    ultra: getEnv("RAZORPAY_ULTRA_LINK_INR")
  },
  usd: {
    pro: getEnv("RAZORPAY_PRO_LINK_USD"),
    ultra: getEnv("RAZORPAY_ULTRA_LINK_USD")
  }
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
