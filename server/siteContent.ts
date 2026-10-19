import { getApps, initializeApp } from 'firebase/app';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  type Firestore,
} from 'firebase/firestore/lite';
import type { ClinicInfo, Doctor, FAQItem } from '../src/types.js';
import { INITIAL_CLINIC_INFO, INITIAL_DOCTOR, INITIAL_FAQS } from '../src/data/initialData.js';

export interface SeoContent {
  clinic: ClinicInfo;
  doctor: Doctor;
  faqs: FAQItem[];
}

const FALLBACK: SeoContent = { clinic: INITIAL_CLINIC_INFO, doctor: INITIAL_DOCTOR, faqs: INITIAL_FAQS };
const TTL_MS = 5 * 60_000;

let cache: { value: SeoContent; expires: number } | null = null;
let firestore: Firestore | null | undefined;

// Reads only public documents, so it uses the web SDK with no credentials.
function connect(): Firestore | null {
  if (firestore !== undefined) return firestore;
  const apiKey = process.env.VITE_FIREBASE_API_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) {
    firestore = null;
    return null;
  }
  const app = getApps().find(a => a.name === 'seo') ?? initializeApp({ apiKey, projectId }, 'seo');
  firestore = getFirestore(app);
  if (process.env.VITE_USE_FIREBASE_EMULATORS === 'true') connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
  return firestore;
}

/** Clinic, doctor and FAQ text for page titles and structured data. Never throws. */
export async function getSeoContent(): Promise<SeoContent> {
  if (cache && cache.expires > Date.now()) return cache.value;
  const store = connect();
  if (!store) return FALLBACK;

  try {
    const [clinic, doctor, faqs] = await Promise.all([
      getDoc(doc(store, 'settings', 'clinic')),
      getDoc(doc(store, 'settings', 'doctor')),
      getDocs(query(collection(store, 'faqs'), orderBy('order'))),
    ]);
    const value: SeoContent = {
      clinic: (clinic.data() as ClinicInfo) ?? FALLBACK.clinic,
      doctor: (doctor.data() as Doctor) ?? FALLBACK.doctor,
      faqs: faqs.empty ? FALLBACK.faqs : faqs.docs.map(d => d.data() as FAQItem),
    };
    cache = { value, expires: Date.now() + TTL_MS };
    return value;
  } catch (err) {
    console.warn('[seo] Could not read Firestore; using built-in content.', (err as Error).message);
    cache = { value: FALLBACK, expires: Date.now() + 60_000 };
    return FALLBACK;
  }
}
