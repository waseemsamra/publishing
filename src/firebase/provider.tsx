'use client';
import { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  db: null,
  loading: true,
});

export const FirebaseProvider = FirebaseContext.Provider;

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => {
    const { app } = useFirebase();
    return app;
}
export const useFirestore = () => {
    const { db } = useFirebase();
    return db;
}
export const useFirebaseAuth = () => {
    const { auth } = useFirebase();
    return auth;
}
