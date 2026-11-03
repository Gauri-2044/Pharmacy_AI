import React, { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { ToastContext } from "./useToast";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = "info", duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = "Success", duration = 4000) =>
      addToast({ title, message, type: "success", duration }),
    error: (message, title = "Error", duration = 5000) =>
      addToast({ title, message, type: "error", duration }),
    info: (message, title = "Information", duration = 4000) =>
      addToast({ title, message, type: "info", duration }),
    warning: (message, title = "Warning", duration = 4500) =>
      addToast({ title, message, type: "warning", duration }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full px-4 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              item.type === "success"
                ? "bg-[#0b241c]/95 border-emerald-500/50 text-emerald-100 shadow-emerald-950/40"
                : item.type === "error"
                ? "bg-[#291215]/95 border-rose-500/50 text-rose-100 shadow-rose-950/40"
                : item.type === "warning"
                ? "bg-[#2d220a]/95 border-amber-500/50 text-amber-100 shadow-amber-950/40"
                : "bg-[#0b1f3a]/95 border-blue-500/50 text-blue-100 shadow-blue-950/40"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {item.type === "error" && <AlertCircle className="h-5 w-5 text-rose-400" />}
              {item.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              {item.type === "info" && <Info className="h-5 w-5 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              {item.title && (
                <p className="font-semibold text-sm leading-tight text-white mb-0.5">
                  {item.title}
                </p>
              )}
              <p className="text-xs opacity-90 leading-relaxed break-words">{item.message}</p>
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
