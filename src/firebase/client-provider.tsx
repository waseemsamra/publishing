'use client';

import { useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseInstances {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<FirebaseInstances>({ app: null, auth: null, db: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigValid(firebaseConfig)) {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);
      setInstances({ app, auth, db });
    } else {
      console.warn("Firebase configuration is missing or incomplete. Firebase services will be unavailable.");
    }
    setLoading(false);
  }, []);

  return (
    <FirebaseProvider value={{ ...instances, loading }}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
