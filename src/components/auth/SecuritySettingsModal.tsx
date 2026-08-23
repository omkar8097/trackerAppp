import React, { useState, useEffect } from 'react';
import { X, Shield, Lock, Fingerprint, Clock, Check, AlertCircle, ShieldOff } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { securitySettings, updateSecuritySettings, lockApp } = useSecurity();

  const [isLockEnabled, setIsLockEnabled] = useState(securitySettings.isLockEnabled);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(securitySettings.isBiometricEnabled);
  const [autoLockMinutes, setAutoLockMinutes] = useState(securitySettings.autoLockMinutes);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsLockEnabled(securitySettings.isLockEnabled);
    setNewPin('');
    setConfirmPin('');
    setIsBiometricEnabled(securitySettings.isBiometricEnabled);
    setAutoLockMinutes(securitySettings.autoLockMinutes);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isOpen, securitySettings]);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // If turning OFF lock
    if (!isLockEnabled) {
      updateSecuritySettings({
        isLockEnabled: false,
        pin: '',
        isBiometricEnabled: false,
        autoLockMinutes: 0,
      });
      setSuccessMsg('App Passcode Lock has been turned OFF.');
      setTimeout(() => onClose(), 800);
      return;
    }

    // If enabling lock or changing existing PIN
    if (isLockEnabled) {
      if (!securitySettings.pin && (!newPin || newPin.length !== 4)) {
        setErrorMsg('Please enter a valid 4-digit PIN.');
        return;
      }

      if (newPin) {
        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
          setErrorMsg('PIN must be exactly 4 numeric digits.');
          return;
        }
        if (newPin !== confirmPin) {
          setErrorMsg('PINs do not match. Please verify.');
          return;
        }
      }
    }

    const finalPin = newPin ? newPin : securitySettings.pin;

    updateSecuritySettings({
      isLockEnabled: true,
      pin: finalPin,
      isBiometricEnabled,
      autoLockMinutes,
    });

    setSuccessMsg('Security settings updated successfully!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleTurnOffLock = () => {
    updateSecuritySettings({
      isLockEnabled: false,
      pin: '',
      isBiometricEnabled: false,
      autoLockMinutes: 0,
    });
    setIsLockEnabled(false);
    setSuccessMsg('App Security Lock turned OFF successfully.');
    setTimeout(() => onClose(), 800);
  };

  const handleImmediateLock = () => {
    if (!securitySettings.isLockEnabled || !securitySettings.pin) {
      setErrorMsg('Please enable Passcode Lock and set a 4-digit PIN first.');
      return;
    }
    onClose();
    lockApp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-lg text-white">Security & Passcode Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Status Banners */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Toggle Passcode Lock */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-sm text-white block">Enable 4-Digit Passcode</span>
              <span className="text-xs text-slate-400">Require PIN to open ExpenseFlow</span>
            </div>
            <button
              onClick={() => setIsLockEnabled(!isLockEnabled)}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                isLockEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* PIN Setup Input Fields */}
          {isLockEnabled ? (
            <div className="space-y-3 pt-1 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  {securitySettings.pin ? 'Change 4-Digit PIN (Optional)' : 'Set New 4-Digit PIN'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4 digits (e.g. 1234)..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white font-mono tracking-widest text-center"
                />
              </div>

              {newPin.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm 4-Digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter 4 digits..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white font-mono tracking-widest text-center"
                  />
                </div>
              )}

              {/* Biometric Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-xs text-white block">Biometric Unlock</span>
                    <span className="text-[11px] text-slate-400">Fingerprint / Face ID support</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsBiometricEnabled(!isBiometricEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                    isBiometricEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Auto Lock Delay */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Auto-Lock Delay
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-white"
                >
                  <option value={0}>Immediately when app goes to background</option>
                  <option value={1}>After 1 minute in background</option>
                  <option value={5}>After 5 minutes in background</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <ShieldOff className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">
                App Lock is currently disabled. Anyone with access to your device can open ExpenseFlow.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
            {securitySettings.isLockEnabled && securitySettings.pin ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTurnOffLock}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1"
                >
                  <ShieldOff className="w-3.5 h-3.5" /> Turn Off Lock
                </button>
                <button
                  type="button"
                  onClick={handleImmediateLock}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5" /> Lock Now
                </button>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
              >
                Save Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
