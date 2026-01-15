'use client';

import { firebaseConfig, isFirebaseConfigValid } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// This object will hold the initialized Firebase services.
// It's declared outside the function to act as a singleton.
let firebaseServices: {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
} | null = null;

/**
 * Initializes Firebase services on the client-side.
 * This function ensures that Firebase is initialized only once.
 *
 * @returns An object containing the initialized Firebase app, auth, and firestore services.
 * @throws {Error} If the Firebase configuration is invalid.
 */
export function initializeFirebase() {
  // If the services are already initialized, return them.
  if (firebaseServices) {
    return firebaseServices;
  }

  // If Firebase apps are already running (e.g., from a previous initialization),
  // use the existing app to get the services.
  if (getApps().length) {
    const app = getApp();
    firebaseServices = {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
    return firebaseServices;
  }

  // Validate the configuration from environment variables.
  if (!isFirebaseConfigValid(firebaseConfig)) {
    // This error will be caught by developers during development if the .env file is missing.
    throw new Error(
      'Firebase configuration is invalid. Please check your .env.local file.'
    );
  }

  // Initialize the Firebase app with the validated configuration.
  const app = initializeApp(firebaseConfig);
  firebaseServices = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };

  return firebaseServices;
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
