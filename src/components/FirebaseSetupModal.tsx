import React, { useState } from 'react';
import { X, Database, HelpCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseSetupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { configState, updateFirebaseCredentials, resetFirebaseCredentials } = useAuth();
  
  const [apiKey, setApiKey] = useState(configState.apiKey || '');
  const [authDomain, setAuthDomain] = useState(configState.authDomain || '');
  const [projectId, setProjectId] = useState(configState.projectId || '');
  const [storageBucket, setStorageBucket] = useState(configState.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(configState.messagingSenderId || '');
  const [appId, setAppId] = useState(configState.appId || '');
  const [activeTab, setActiveTab] = useState<'form' | 'env'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirebaseCredentials({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    });
    onClose();
  };

  const envSnippet = `VITE_FIREBASE_API_KEY=${apiKey || 'your-api-key'}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain || 'your-project.firebaseapp.com'}
VITE_FIREBASE_PROJECT_ID=${projectId || 'your-project-id'}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket || 'your-project.appspot.com'}
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId || '123456789'}
VITE_FIREBASE_APP_ID=${appId || '1:123456789:web:abcdef'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Firebase Project Settings</h3>
              <p className="text-xs text-slate-400">Connect your Firebase Authentication & Firestore Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'form'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Form
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'env'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            .env.local File Snippet
          </button>
        </div>

        <div className="p-6">
          {/* Status Indicator */}
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
            configState.isConfigured
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            {configState.isConfigured ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <HelpCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
            )}
            <div className="text-xs leading-relaxed">
              <span className="font-semibold block text-sm mb-0.5">
                {configState.isConfigured ? 'Firebase Connected' : 'Running in Offline / Demo Mode'}
              </span>
              {configState.isConfigured
                ? 'Your application is connected to your live Firebase project with realtime Firestore synchronization.'
                : 'You can test all UI features instantly in Demo Mode. To store live data, enter your Firebase API keys below.'}
            </div>
          </div>

          {activeTab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    API Key <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Project ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="my-expense-app-123"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="my-expense-app-123.firebaseapp.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Storage Bucket</label>
                  <input
                    type="text"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="my-expense-app-123.appspot.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Messaging Sender ID</label>
                  <input
                    type="text"
                    value={messagingSenderId}
                    onChange={(e) => setMessagingSenderId(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="1:1234567890:web:abcdef..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {configState.isConfigured ? (
                  <button
                    type="button"
                    onClick={resetFirebaseCredentials}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Switch to Demo Mode
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Save keys to connect live database</span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Save & Apply Config
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Alternatively, you can create a <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">.env.local</code> file in your project root directory and copy the configuration variables below:
              </p>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto select-all leading-relaxed">
                {envSnippet}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
