import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

const getEnvVar = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
    if (import.meta.env[key]) return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnvVar('FIREBASE_API_KEY', ''),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', ''),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', ''),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: getEnvVar('FIREBASE_APP_ID', ''),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', '')
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
