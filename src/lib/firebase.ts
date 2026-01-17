import { initializeApp, getApps, getApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigValid(config: FirebaseOptions): boolean {
  return Object.values(config).every(value => Boolean(value));
}

let app: FirebaseApp | null;
let auth: Auth | null;
let db: Firestore | null;

if (isFirebaseConfigValid(firebaseConfig)) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // This will be true during the build process on Vercel if env vars are not available at build time.
  // It's important to handle the null case in the rest of the app.
  console.warn("Firebase configuration is missing or incomplete. This is expected during the build process if environment variables are not set. Firebase services will be unavailable server-side.");
  app = null;
  auth = null;
  db = null;
}

export { app, auth, db, firebaseConfig };
