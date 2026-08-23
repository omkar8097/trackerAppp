import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, enableDemoMode, configState } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!configState.isConfigured) {
      setError('Firebase is not configured yet. Please configure API keys first or use Demo Mode.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    if (!configState.isConfigured) {
      setError('Firebase is not configured yet. Please configure API keys first or use Demo Mode.');
      return;
    }
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In failed.');
    }
  };

  const handleGuestDemo = () => {
    enableDemoMode();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">
                {isRegister ? 'Create Firebase Account' : 'Sign In to Firebase'}
              </h3>
              <p className="text-xs text-slate-400">Manage your finances with Cloud Firestore sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-semibold text-slate-950 text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          {/* Social / Google Auth */}
          {configState.isConfigured && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          )}

          {/* Toggle between Register/Login and Guest */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 hover:underline font-medium"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>

            <button
              onClick={handleGuestDemo}
              className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" /> Guest Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
