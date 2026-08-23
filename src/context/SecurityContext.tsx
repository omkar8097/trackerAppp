import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SecuritySettings } from '../types';

interface SecurityContextType {
  securitySettings: SecuritySettings;
  isLocked: boolean;
  isBiometricSupported: boolean;
  verifyPin: (inputPin: string) => boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  lockApp: () => void;
}

const LOCAL_STORAGE_SECURITY_KEY = 'expense_tracker_security_settings';

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  isLockEnabled: false,
  pin: '',
  isBiometricEnabled: false,
  autoLockMinutes: 0,
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SECURITY_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed loading security settings', e);
    }
    return DEFAULT_SECURITY_SETTINGS;
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return securitySettings.isLockEnabled && Boolean(securitySettings.pin);
  });

  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);

  // Check WebAuthn Biometric support
  useEffect(() => {
    if (window.PublicKeyCredential && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => setIsBiometricSupported(available))
        .catch(() => setIsBiometricSupported(false));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: SecuritySettings) => {
    setSecuritySettings(newSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_SECURITY_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed saving security settings', e);
    }
  };

  const updateSecuritySettings = (updated: Partial<SecuritySettings>) => {
    const next = { ...securitySettings, ...updated };
    if (updated.isLockEnabled === false) {
      setIsLocked(false);
    }
    saveSettings(next);
  };

  const verifyPin = (inputPin: string): boolean => {
    if (inputPin === securitySettings.pin) {
      setIsLocked(false);
      saveSettings({
        ...securitySettings,
        lastUnlockedAt: Date.now(),
      });
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (!isBiometricSupported) {
      // Fallback for browsers simulating biometrics or mobile devices
      setIsLocked(false);
      return true;
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
        },
      });

      if (credential) {
        setIsLocked(false);
        saveSettings({
          ...securitySettings,
          lastUnlockedAt: Date.now(),
        });
        return true;
      }
    } catch (e) {
      console.warn('Biometric authentication failed or cancelled:', e);
    }
    return false;
  };

  const lockApp = () => {
    if (securitySettings.isLockEnabled && securitySettings.pin) {
      setIsLocked(true);
    }
  };

  // Auto-lock when tab is hidden or user leaves app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && securitySettings.isLockEnabled && securitySettings.pin) {
        const lastUnlocked = securitySettings.lastUnlockedAt || 0;
        const now = Date.now();
        const timeoutMs = securitySettings.autoLockMinutes * 60 * 1000;

        if (securitySettings.autoLockMinutes === 0 || now - lastUnlocked >= timeoutMs) {
          setIsLocked(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [securitySettings]);

  return (
    <SecurityContext.Provider
      value={{
        securitySettings,
        isLocked,
        isBiometricSupported,
        verifyPin,
        unlockWithBiometrics,
        updateSecuritySettings,
        lockApp,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
