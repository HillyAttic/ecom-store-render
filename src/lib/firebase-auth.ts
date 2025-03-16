import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Check if environment variables are loaded
console.log("Environment API Key:", typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Key exists" : "Key is undefined or empty");

// Your Firebase configuration with direct string values for debugging
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "missing-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

console.log("Firebase config API Key:", firebaseConfig.apiKey);
console.log("Firebase config:", {
  apiKey: firebaseConfig.apiKey?.substring(0, 10) + "...",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string) => {
  console.log("Attempting to sign in with:", email);
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Sign out
 */
export const logOut = async () => {
  return signOut(auth);
};

export { auth }; 