import React, { useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, HelpCircle } from 'lucide-react';
import { ToastContext } from './toastContextDef';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const toastTimersRef = useRef(new Map());

  // Dismiss a specific toast
  const dismiss = useCallback((id) => {
    if (toastTimersRef.current.has(id)) {
      clearTimeout(toastTimersRef.current.get(id));
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Base toast trigger
  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 7);
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // Keep maximum 5 concurrent toasts

      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        toastTimersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  // Helper methods
  const success = useCallback(
    (message, options = {}) => addToast({ ...options, type: 'success', message }),
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => addToast({ ...options, type: 'error', message }),
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => addToast({ ...options, type: 'info', message }),
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => addToast({ ...options, type: 'warning', message }),
    [addToast]
  );

  // Themed Confirm Dialog Promise
  const confirm = useCallback(
    ({
      title = 'पुष्टि आवश्यक है (Confirmation)',
      message = 'क्या आप निश्चित रूप से यह क्रिया संपन्न करना चाहते हैं?',
      confirmText = 'स्वीकार करें',
      cancelText = 'रद्द करें',
      isDestructive = false
    }) => {
      return new Promise((resolve) => {
        setConfirmDialog({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          isDestructive,
          onConfirm: () => {
            setConfirmDialog(null);
            resolve(true);
          },
          onCancel: () => {
            setConfirmDialog(null);
            resolve(false);
          }
        });
      });
    },
    []
  );

  const toastMethods = {
    toast: addToast,
    success,
    error,
    info,
    warning,
    dismiss,
    confirm
  };

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}

      {/* In-App Toast Container - Safe Area Aware on Mobile */}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="region"
        aria-label="सूचनाएं (Notifications)"
        className="fixed z-[9999] top-3 right-3 sm:top-5 sm:right-5 left-3 sm:left-auto flex flex-col gap-2.5 max-w-sm w-full pointer-events-none pt-[env(safe-area-inset-top,10px)]"
      >
        {toasts.map((item) => {
          const isSuccess = item.type === 'success';
          const isError = item.type === 'error';
          const isWarning = item.type === 'warning';

          const borderColor = isSuccess
            ? 'border-emerald-500/50 shadow-emerald-950/40'
            : isError
            ? 'border-rose-500/60 shadow-rose-950/50'
            : isWarning
            ? 'border-amber-500/60 shadow-amber-950/40'
            : 'border-[#C58B4E]/50 shadow-[#C58B4E]/20';

          const glowColor = isSuccess
            ? 'from-emerald-500/10'
            : isError
            ? 'from-rose-500/15'
            : isWarning
            ? 'from-amber-500/10'
            : 'from-[#C58B4E]/15';

          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-[#140A04]/95 backdrop-blur-xl border ${borderColor} shadow-2xl p-3.5 sm:p-4 text-[#F7E7D6] transition-all duration-300 transform translate-y-0 animate-fade-in flex items-start gap-3`}
            >
              {/* Subtle radiant background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${glowColor} to-transparent pointer-events-none`}
              />

              {/* Status Icon */}
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info className="w-5 h-5 text-[#E0A96D]" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="font-dharmik font-bold text-xs sm:text-sm text-[#F3CA9D] mb-0.5">
                    {item.title}
                  </h4>
                )}
                <p className="text-xs sm:text-sm text-[#F7E7D6] leading-relaxed break-words font-medium">
                  {item.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="बंद करें"
                className="shrink-0 p-1 text-[#D4A373] hover:text-[#FFF] rounded-lg transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Spiritual Themed Confirm Dialog */}
      {confirmDialog?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
        >
          <div className="relative max-w-md w-full rounded-3xl bg-[#140A04]/95 border border-[#C58B4E]/50 shadow-2xl p-6 sm:p-7 text-[#F7E7D6] space-y-4">
            {/* Header with Diya / Question Icon */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#C58B4E]/20">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-400'
                    : 'bg-[#C58B4E]/20 border-[#C58B4E]/50 text-[#F3CA9D]'
                }`}
              >
                {confirmDialog.isDestructive ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <HelpCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="confirm-dialog-title"
                  className="font-dharmik text-base sm:text-lg font-bold text-[#F3CA9D]"
                >
                  {confirmDialog.title}
                </h3>
              </div>
            </div>

            {/* Description Body */}
            <p
              id="confirm-dialog-desc"
              className="text-xs sm:text-sm text-[#F7E7D6]/90 leading-relaxed"
            >
              {confirmDialog.message}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#D4A373] hover:text-[#FFF] hover:bg-white/5 border border-transparent transition-all"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  confirmDialog.isDestructive
                    ? 'bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white shadow-rose-900/40 border border-rose-400/40'
                    : 'bg-gradient-to-r from-[#D4A373] via-[#C58B4E] to-[#8C4B19] hover:brightness-110 text-[#120A05] shadow-[#C58B4E]/30 border border-[#F3CA9D]'
                }`}
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
