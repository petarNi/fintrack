import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    duration: 3000,
    exiting: false,
  });

  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    setToast(prev => {
      if (!prev.message) return prev;
      return { ...prev, exiting: true };
    });

    setTimeout(() => {
      setToast({ message: "", type: "success", duration: 3000, exiting: false });
    }, 300); 
  }, []);

  const scheduleHide = useCallback((duration) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (duration > 0) {
      timerRef.current = setTimeout(() => hideToast(), duration);
    }
  }, [hideToast]);

  const showToast = useCallback((message, type = "success", options = {}) => {
    if (!message) return;

    const { duration = 3000 } = options;
    setToast({ message, type, duration, exiting: false });
    scheduleHide(duration);
  }, [scheduleHide]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      {toast.message && (
        <div
          className={`toast toast--${toast.type} ${toast.exiting ? "toast--exit" : ""}`}
          role="status"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
