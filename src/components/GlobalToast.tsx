import React, { createContext, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[200] animate-slide-up">
          <div className="bg-navy-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-navy-700 flex items-center gap-3">
            <i className="ph-bold ph-check-circle text-emerald-400 text-xl animate-bounce"></i>
            <p className="text-sm font-semibold tracking-wide">{toastMsg}</p>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => {
        console.log('[Toast]', msg);
      },
    };
  }
  return context;
};
