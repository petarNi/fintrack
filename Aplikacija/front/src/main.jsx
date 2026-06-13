import { createRoot } from 'react-dom/client'
import App from './components/App'
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AlertProvider } from "./context/AlertContext";
import "./styles/theme.css";
import "./styles/alert.css";

const root = createRoot(document.getElementById("root"))
root.render(
  <AlertProvider>
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </AlertProvider>
)
