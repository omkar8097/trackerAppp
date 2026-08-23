import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { getStoredFirebaseConfig } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

export const initFirebase = () => {
  const config = getStoredFirebaseConfig();
  
  if (!config.apiKey || !config.projectId) {
    console.warn('Firebase configuration missing. Running in Demo Mode.');
    return { app: null, auth: null, db: null, googleProvider: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      app = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    return { app, auth, db, googleProvider, isConfigured: true };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { app: null, auth: null, db: null, googleProvider: null, isConfigured: false, error };
  }
};

const instances = initFirebase();

export const firebaseApp = instances.app;
export const firebaseAuth = instances.auth;
export const firebaseDb = instances.db;
export const firebaseGoogleProvider = instances.googleProvider;
export const isFirebaseConfigured = instances.isConfigured;
