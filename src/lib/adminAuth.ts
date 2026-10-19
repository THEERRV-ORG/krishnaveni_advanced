import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import { firebaseApp, isFirebaseConfigured, useEmulators } from './firebase';

export { isFirebaseConfigured };

let authInstance: Auth | null = null;

function auth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp());
    if (useEmulators) connectAuthEmulator(authInstance, 'http://127.0.0.1:9099', { disableWarnings: true });
  }
  return authInstance;
}

export function watchAdminUser(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth(), callback);
}

export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    return (await signInWithPopup(auth(), provider)).user;
  } catch (err: any) {
    // Pop-ups are often blocked on phones; fall back to a full-page Google sign-in.
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth(), provider);
      return null;
    }
    throw err;
  }
}

export async function signOutAdmin(): Promise<void> {
  if (isFirebaseConfigured) await signOut(auth());
}

/** Readable message for a failed Firestore call made by an admin. */
export function adminErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code;
  if (code === 'permission-denied') return 'This account is not allowed to make that change.';
  if (code === 'unavailable') return 'Could not reach the database. Check your connection and try again.';
  return err instanceof Error && err.name === 'BookingError' ? err.message : fallback;
}
