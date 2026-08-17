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
  apiKey: getEnvVar('FIREBASE_API_KEY', 'AIzaSyBuaI7XcvOxdUmwX8Xawz1vb1GGKDr-TVI'),
  authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', 'eloquix-609b8.firebaseapp.com'),
  projectId: getEnvVar('FIREBASE_PROJECT_ID', 'eloquix-609b8'),
  storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', 'eloquix-609b8.firebasestorage.app'),
  messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', '427738230416'),
  appId: getEnvVar('FIREBASE_APP_ID', '1:427738230416:web:ab265d08ba3827d583f215'),
  measurementId: getEnvVar('FIREBASE_MEASUREMENT_ID', 'G-8F86HP7G2Y')
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
