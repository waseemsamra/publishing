// This configuration is used for client-side Firebase services.
// It's safe to expose these values as they are used for connecting to your
// Firebase project, and security is enforced by Firestore Security Rules.

export const firebaseConfig = {
  apiKey: "AIzaSyDCwvx9a-hfyKGR_srL-ht3CV0LINL3us0",
  authDomain: "studio-2860611950-e038a.firebaseapp.com",
  projectId: "studio-2860611950-e038a",
  storageBucket: "studio-2860611950-e038a.appspot.com",
  messagingSenderId: "979095252413",
  appId: "1:979095252413:web:b629025993bffd0d03b6d4"
};

// A function to check if the Firebase configuration is valid.
export function isFirebaseConfigValid(config: object): boolean {
  return Object.values(config).every(value => Boolean(value));
}
