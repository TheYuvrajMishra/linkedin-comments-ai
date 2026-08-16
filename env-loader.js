// env-loader.js: Client side environment helper
window.ENV = window.ENV || {};

async function loadEnvVariables() {
  // All secret keys, Groq generation, auth, and database credentials
  // are securely handled by the Eloquix Backend API server (http://localhost:5000).
  window.ENV["BACKEND_URL"] = "http://localhost:5000";
}

loadEnvVariables();
