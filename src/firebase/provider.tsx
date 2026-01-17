'use client';

import { createContext, useContext, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== 'undefined' && isFirebaseConfigValid(firebaseConfig)) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      console.error("Firebase initialization error:", e);
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  // This provider's main purpose is now to render the error listener
  // when firebase is available.
  return (
    <>
      {db && <FirebaseErrorListener />}
      {children}
    </>
  );
}

export const useFirebaseApp = (): FirebaseApp | null => {
    return app;
}
export const useFirestore = (): Firestore | null => {
    return db;
}
export const useFirebaseAuth = (): Auth | null => {
    return auth;
}
