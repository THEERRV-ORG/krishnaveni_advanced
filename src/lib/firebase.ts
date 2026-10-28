import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore/lite';

// The Firebase web config is public by design; the security rules in firestore.rules decide access.
// The server writes it into each page from its environment (server/clientConfig.ts); static hosts
// such as Vercel have no server, so the values Vite baked in at build time are the fallback.
const config = window.__APP_CONFIG__?.firebase ?? {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);
export const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

let dbInstance: Firestore | null = null;

export function firebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}

export function db(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(firebaseApp());
    if (useEmulators) connectFirestoreEmulator(dbInstance, '127.0.0.1', 8080);
  }
  return dbInstance;
}
