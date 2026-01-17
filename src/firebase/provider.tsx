'use client';

import { createContext, useContext, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextValue {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

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
  const contextValue = db && auth && app ? { app, auth, db } : null;

  return (
    <FirebaseContext.Provider value={contextValue}>
      {contextValue && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => {
    const context = useFirebase();
    return context?.app ?? null;
}
export const useFirestore = () => {
    const context = useFirebase();
    return context?.db ?? null;
}
export const useFirebaseAuth = () => {
    const context = useFirebase();
    return context?.auth ?? null;
}
