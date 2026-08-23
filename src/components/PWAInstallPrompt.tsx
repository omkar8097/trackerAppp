import React, { useState } from 'react';
import { Download, X, WifiOff, Sparkles, Smartphone, Share } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isOnline, isIOS, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-amber-500/90 text-slate-950 font-medium text-xs shadow-xl backdrop-blur-md border border-amber-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <WifiOff className="w-4 h-4 text-slate-950 flex-shrink-0" />
          <span>You are currently offline. ExpenseFlow is running with offline caching.</span>
        </div>
      )}

      {/* Android / Chrome PWA Floating Install Prompt */}
      {isInstallable && !isInstalled && !dismissed && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900/95 border border-emerald-500/30 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-sm text-white">Install ExpenseFlow App</h4>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> PWA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Install on your home screen for fast offline access and an app-like experience.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={promptInstall}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Instructions Banner */}
      {isIOS && !isInstalled && !dismissed && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/30 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Share className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white">Install on iPhone / iPad</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Tap the <span className="font-semibold text-cyan-400 inline-flex items-center gap-0.5"><Share className="w-3 h-3 inline" /> Share</span> icon in Safari, then select <span className="font-semibold text-emerald-400">"Add to Home Screen"</span>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
