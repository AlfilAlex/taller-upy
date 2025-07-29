// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "react-oidc-context";
import { WebStorageStateStore } from "oidc-client-ts";          // 👈
import App from "./App.jsx";
import { cognitoAuthConfig } from "./auth/cognitoConfig";

const oidcConfig = {
  ...cognitoAuthConfig,

  // Guarda los tokens en localStorage para persistir al cerrar pestaña
  userStore: new WebStorageStateStore({
    store: window.localStorage          // o sessionStorage si prefieres
  }),

  // Limpia ?code= y ?state= de la URL después del login
  onSigninCallback: () =>
    window.history.replaceState({}, "", window.location.pathname)
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
