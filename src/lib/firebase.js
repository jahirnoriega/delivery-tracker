// Firebase client setup. Values come from Vite env variables (see .env.example).
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Reuse the app across hot reloads instead of initializing it twice.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signOutUser = () => signOut(auth);

/** Only this account can use the tracker (also enforced by database.rules.json). */
export const TRACKER_OWNER = (import.meta.env.VITE_OWNER_EMAIL ?? "").toLowerCase();
