import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev.slice(-3), { id, type, message, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showSuccess = useCallback((message: string, title?: string) => showToast(message, 'success', title), [showToast]);
  const showError = useCallback((message: string, title?: string) => showToast(message, 'error', title), [showToast]);
  const showInfo = useCallback((message: string, title?: string) => showToast(message, 'info', title), [showToast]);
  const showWarning = useCallback((message: string, title?: string) => showToast(message, 'warning', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {/* Toast Container - Mobile responsive top floating banner */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[9999] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-fade-in ${
              t.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-white shadow-emerald-950/50'
                : t.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/50 text-white shadow-rose-950/50'
                : t.type === 'warning'
                ? 'bg-amber-950/95 border-amber-500/50 text-white shadow-amber-950/50'
                : 'bg-gray-900/95 border-gray-800 text-white shadow-black/80'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
              {t.type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
              {t.type === 'warning' && <AlertTriangle size={18} className="text-amber-400" />}
              {t.type === 'info' && <Info size={18} className="text-blue-400" />}
            </div>

            <div className="flex-1 space-y-0.5 pr-2">
              {t.title && <h5 className="text-xs font-bold uppercase tracking-wider">{t.title}</h5>}
              <p className="text-xs text-gray-200 leading-snug">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white p-0.5 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
