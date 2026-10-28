import React, { useState, useEffect } from 'react';

export interface PwaInstallPromptProps {
  onInstalled?: () => void;
  className?: string;
}

const DISMISS_KEY = 'sb_pwa_prompt_dismissed';

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({
  onInstalled,
  className = '',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user dismissed recently
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 86400000) {
        return;
      }
    } catch {
      // Ignore
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      if (onInstalled) {
        onInstalled();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="banner"
      aria-label="Install App"
      className={`fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-slate-900/95 border border-cyan-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between text-slate-100 animate-slide-up ${className}`}
      data-testid="pwa-install-prompt"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-cyan-900/40">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-100">Install Stellar Bazaar</h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            One-tap cooperative buying on your home screen.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 ml-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          data-testid="pwa-install-btn"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
