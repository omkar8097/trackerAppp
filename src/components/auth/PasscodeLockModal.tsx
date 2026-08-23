import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete, ShieldAlert, RotateCcw } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export const PasscodeLockModal: React.FC = () => {
  const { isLocked, securitySettings, verifyPin, unlockWithBiometrics, resetSecurityLock } = useSecurity();
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    setPinInput('');
    setErrorMsg(null);
    setShowConfirmReset(false);
  }, [isLocked]);

  // Handle Physical Keyboard Numbers
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePressDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDeleteDigit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, pinInput]);

  if (!isLocked) return null;

  const handlePressDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMsg(null);

      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = verifyPin(nextPin);
          if (!success) {
            triggerError();
          }
        }, 150);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const triggerError = () => {
    setIsShaking(true);
    setErrorMsg('Incorrect PIN. Please try again.');
    setPinInput('');
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleBiometricClick = async () => {
    const success = await unlockWithBiometrics();
    if (!success) {
      setErrorMsg('Biometric authentication failed.');
    }
  };

  const handleConfirmResetLock = () => {
    resetSecurityLock();
    setShowConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-emerald-500 animate-in fade-in duration-200">
      <div className="w-full max-w-sm flex flex-col items-center space-y-6 text-center">
        
        {/* App Logo & Header */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-2xl shadow-emerald-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">ExpenseFlow Security</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                Locked
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Enter your 4-digit PIN to access your tracker</p>
          </div>
        </div>

        {/* PIN 4-Dot Display */}
        <div className={`flex items-center gap-4 py-4 ${isShaking ? 'animate-bounce text-rose-500' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 scale-110'
                    : 'border-2 border-slate-700 bg-slate-900'
                }`}
              />
            );
          })}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl animate-in fade-in duration-150">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handlePressDigit(num)}
              className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/80 hover:bg-slate-800 active:scale-95 text-xl font-bold text-white transition-all mx-auto flex items-center justify-center shadow-md shadow-slate-950"
            >
              {num}
            </button>
          ))}

          {/* Biometric Button */}
          {securitySettings.isBiometricEnabled ? (
            <button
              onClick={handleBiometricClick}
              className="w-16 h-16 rounded-full bg-slate-900/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all mx-auto flex items-center justify-center shadow-md"
              title="Unlock with Biometrics (Fingerprint / Face ID)"
            >
              <Fingerprint className="w-7 h-7" />
            </button>
          ) : (
            <div className="w-16 h-16" />
          )}

          {/* Zero Button */}
          <button
            onClick={() => handlePressDigit('0')}
            className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/80 hover:bg-slate-800 active:scale-95 text-xl font-bold text-white transition-all mx-auto flex items-center justify-center shadow-md shadow-slate-950"
          >
            0
          </button>

          {/* Backspace Delete Button */}
          <button
            onClick={handleDeleteDigit}
            disabled={!pinInput.length}
            className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 active:scale-95 text-slate-400 hover:text-white transition-all mx-auto flex items-center justify-center disabled:opacity-30"
            title="Delete digit"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Forgot PIN / Emergency Reset Lock */}
        <div className="pt-4 border-t border-slate-900 w-full max-w-[280px]">
          {!showConfirmReset ? (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors py-1 flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Forgot PIN? Reset Lock
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-in fade-in duration-150">
              <p className="text-[11px] text-rose-300 font-medium">Clear 4-digit PIN & unlock ExpenseFlow?</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetLock}
                  className="px-3 py-1 rounded-xl text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20"
                >
                  Yes, Unlock & Reset PIN
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
