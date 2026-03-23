import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Toast() {
  const { errorMsg, successMsg, showError, showSuccess } = useApp();

  // Clear on dismiss — reuse the setters to null
  const dismissError = () => showError('');
  const dismissSuccess = () => showSuccess('');

  return (
    <>
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-[320px] w-[90vw]"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1 text-[13px]">{errorMsg}</span>
            <button onClick={dismissError} className="shrink-0 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMsg && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-[320px] w-[90vw]"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="flex-1 text-[13px]">{successMsg}</span>
            <button onClick={dismissSuccess} className="shrink-0 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
