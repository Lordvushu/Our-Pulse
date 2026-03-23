import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Platform = 'ios' | 'android' | null;

const getPlatform = (): Platform => {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return null;
};

const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true);

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem('install-dismissed')) return;

    const p = getPlatform();
    setPlatform(p);

    if (p === 'android') {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as Event & { prompt: () => void });
        setShow(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }

    if (p === 'ios') {
      // Show after a short delay so it doesn't feel aggressive
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('install-dismissed', '1');
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    }
    dismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto"
        >
          <div className="glass-card p-4 shadow-xl shadow-pulse-blue/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-btn-start to-pulse-btn-end flex items-center justify-center shrink-0">
                  <span className="text-white text-lg">💙</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-pulse-blue dark:text-sky-100">Add to Home Screen</p>
                  {platform === 'ios' ? (
                    <p className="text-xs text-pulse-label/80 dark:text-sky-300/80 mt-0.5 leading-relaxed">
                      Tap <Share size={11} className="inline mb-0.5" /> then <strong>"Add to Home Screen"</strong> for quick one-tap access
                    </p>
                  ) : (
                    <p className="text-xs text-pulse-label/80 dark:text-sky-300/80 mt-0.5">
                      Install Our Pulse for quick one-tap access
                    </p>
                  )}
                </div>
              </div>
              <button onClick={dismiss} className="text-pulse-label/50 hover:text-pulse-label dark:text-sky-300/50 dark:hover:text-sky-300 transition-colors shrink-0 mt-0.5">
                <X size={16} />
              </button>
            </div>

            {platform === 'android' && (
              <button
                onClick={install}
                className="mt-3 w-full bg-gradient-to-r from-pulse-btn-start to-pulse-btn-end text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Install App
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
