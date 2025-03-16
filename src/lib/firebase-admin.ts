import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export function initAdmin() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  return getAuth();
}

export async function verifyToken(token: string) {
  try {
    const auth = initAdmin();
    const decodedToken = await auth.verifyIdToken(token);
    return { valid: true, uid: decodedToken.uid };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, uid: null };
  }
} 