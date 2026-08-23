import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { firebaseAuth, firebaseGoogleProvider } from '../firebase/firebase';
import { getStoredFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig } from '../firebase/config';
import type { FirebaseConfigState } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isDemoMode: boolean;
  configState: FirebaseConfigState;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  registerWithEmail: (e: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  enableDemoMode: () => void;
  updateFirebaseCredentials: (newConfig: Omit<FirebaseConfigState, 'isConfigured' | 'isDemoMode'>) => void;
  resetFirebaseCredentials: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configState, setConfigState] = useState<FirebaseConfigState>(getStoredFirebaseConfig());
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!configState.isConfigured);

  useEffect(() => {
    if (!configState.isConfigured || !firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      if (user) {
        setIsDemoMode(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configState.isConfigured]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!firebaseAuth) throw new Error('Firebase Auth is not configured.');
    await signInWithEmailAndPassword(firebaseAuth, email, pass);
    setIsDemoMode(false);
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (!firebaseAuth) throw new Error('Firebase Auth is not configured.');
    await createUserWithEmailAndPassword(firebaseAuth, email, pass);
    setIsDemoMode(false);
  };

  const loginWithGoogle = async () => {
    if (!firebaseAuth || !firebaseGoogleProvider) {
      throw new Error('Firebase Google Auth is not configured.');
    }
    await signInWithPopup(firebaseAuth, firebaseGoogleProvider);
    setIsDemoMode(false);
  };

  const logoutUser = async () => {
    if (firebaseAuth && currentUser) {
      await signOut(firebaseAuth);
    }
    setCurrentUser(null);
    setIsDemoMode(true);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const updateFirebaseCredentials = (newConfig: Omit<FirebaseConfigState, 'isConfigured' | 'isDemoMode'>) => {
    saveFirebaseConfig(newConfig);
    const updated = getStoredFirebaseConfig();
    setConfigState(updated);
    if (updated.isConfigured) {
      setIsDemoMode(false);
    }
    window.location.reload();
  };

  const resetFirebaseCredentials = () => {
    clearFirebaseConfig();
    setConfigState(getStoredFirebaseConfig());
    setIsDemoMode(true);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isDemoMode,
        configState,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logoutUser,
        enableDemoMode,
        updateFirebaseCredentials,
        resetFirebaseCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
