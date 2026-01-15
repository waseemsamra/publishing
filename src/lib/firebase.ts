import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase
let app;
if (!isFirebaseConfigValid(firebaseConfig)) {
  console.warn("Firebase configuration is missing or incomplete. Please check your .env file.");
  // Provide dummy objects to prevent app crash
  app = {
    name: "mock-app",
    options: {},
    automaticDataCollectionEnabled: false,
  };
} else {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, firebaseConfig };
