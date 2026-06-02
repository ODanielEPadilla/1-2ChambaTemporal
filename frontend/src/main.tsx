import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import Auth0ProviderWithNavigate from "./auth/Auth0ProviderWithNavigate";
import { ToastProvider } from "./components/Toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <ToastProvider>
          <App />
        </ToastProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>
);