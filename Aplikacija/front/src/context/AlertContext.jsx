import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState(null);

  const showAlert = (message,options={}) =>
    new Promise((resolve) => {
      setAlert({
        message,
        title: options.title || "Obaveštenje",
        type: "alert",
        confirmLabel: options.confirmLabel || "U redu",
        onConfirm: () => {
          setAlert(null);
          resolve();
        },
      });
    });

  const showConfirm = (message,options={}) =>
    new Promise((resolve) => {
      setAlert({
        message,
        title: options.title || "Potvrda",
        type: "confirm",
        confirmLabel: options.confirmLabel || "Potvrdi",
        cancelLabel: options.cancelLabel || "Odustani",
        onConfirm: () => {
          setAlert(null);
          resolve(true);
        },
        onCancel: () => {
          setAlert(null);
          resolve(false);
        },
      });
    });

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alert && (
        <div className="alert-overlay" onClick={() => setAlert(null)}>
          <div className="alert" onClick={(e) => e.stopPropagation()}>
            {alert.title && <h3 className="alert__title">{alert.title}</h3>}
            <p>{alert.message}</p>
            <div className="alert__actions">
              {alert.type === "confirm" && (
                <button className="btn btn--ghost" onClick={alert.onCancel}>
                  {alert.cancelLabel}
                </button>
              )}
              <button className="btn" onClick={alert.onConfirm}>
                {alert.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
    
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
