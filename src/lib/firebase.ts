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

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Initialize Firebase only on the client side where the browser window object is available.
// This prevents the app from crashing during the server-side build process on platforms like Vercel,
// where environment variables may not be available at build time.
if (typeof window !== 'undefined') {
    if (isFirebaseConfigValid(firebaseConfig)) {
        try {
            app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            auth = getAuth(app);
            db = getFirestore(app);
        } catch (e) {
            console.error("Firebase initialization failed:", e);
            app = null;
            auth = null;
            db = null;
        }
    } else {
        console.error("Firebase configuration is missing or incomplete. Please check your .env.local file.");
    }
} else {
    // During server-side rendering or build, services will remain null.
    // Components using these services must handle the null case.
    if (!isFirebaseConfigValid(firebaseConfig)) {
        console.warn("Firebase configuration is missing or incomplete. This is expected during the build process if environment variables are not set. Firebase services will be unavailable server-side.");
    }
}


export { app, auth, db, firebaseConfig };
