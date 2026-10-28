import { getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite';

let firestore: Firestore | null | undefined;

// The server uses the web SDK with no credentials, so firestore.rules apply to it like any visitor.
// Returns null when the Firebase settings are missing.
export function serverFirestore(): Firestore | null {
  if (firestore !== undefined) return firestore;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    firestore = null;
    return null;
  }
  const app = getApps().find(a => a.name === 'server') ?? initializeApp({ apiKey, projectId }, 'server');
  firestore = getFirestore(app);
  if (process.env.VITE_USE_FIREBASE_EMULATORS === 'true') connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  return firestore;
}
