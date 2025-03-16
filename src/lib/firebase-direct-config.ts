import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCkXZVnN3FDe4ma3-E0yyFsDqT2VNqw5O4",
  authDomain: "handloomdb-5178c.firebaseapp.com",
  databaseURL: "https://handloomdb-5178c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "handloomdb-5178c",
  storageBucket: "handloomdb-5178c.firebasestorage.app",
  messagingSenderId: "501362312581",
  appId: "1:501362312581:web:556e281e5e506795e4f0ec",
  measurementId: "G-9M6H1NYHJC"
};

// Initialize Firebase with direct config for testing
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export a direct login function for testing
export async function directLogin(email: string, password: string) {
  try {
    console.log("Attempting direct login with config:", {
      apiKey: firebaseConfig.apiKey.substring(0, 10) + "...",
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    });
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Direct login error:", error.code, error.message);
    return { success: false, error: error.message };
  }
}

export { auth }; 