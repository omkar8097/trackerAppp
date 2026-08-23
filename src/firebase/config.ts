import type { FirebaseConfigState } from '../types';

const STORAGE_KEY = 'expense_tracker_firebase_config';

export const getStoredFirebaseConfig = (): FirebaseConfigState => {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  const isEnvValid = Boolean(envConfig.apiKey && envConfig.projectId);

  if (isEnvValid) {
    return {
      ...envConfig,
      isConfigured: true,
      isDemoMode: false,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return {
          ...parsed,
          isConfigured: true,
          isDemoMode: false,
        };
      }
    }
  } catch (e) {
    console.error('Failed to read firebase config from storage', e);
  }

  return {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    isConfigured: false,
    isDemoMode: true,
  };
};

export const saveFirebaseConfig = (config: Omit<FirebaseConfigState, 'isConfigured' | 'isDemoMode'>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save firebase config to storage', e);
  }
};

export const clearFirebaseConfig = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear firebase config from storage', e);
  }
};
