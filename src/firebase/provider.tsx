'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

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

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<Omit<FirebaseContextValue, 'loading'>>({ app: null, auth: null, db: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigValid(firebaseConfig)) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      setInstances({ app, auth, db });
    } else {
      // This will be true during server-side builds and if .env is missing
      console.warn("Firebase configuration is missing or incomplete. Firebase services will be unavailable.");
    }
    setLoading(false);
  }, []);

  return (
    <FirebaseContext.Provider value={{ ...instances, loading }}>
      {!loading && instances.app && <FirebaseErrorListener />}
      {children}
    </FirebaseContext.Provider>
  );
}

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
