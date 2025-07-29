import { useAuth } from "react-oidc-context";
import React from "react";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (auth.isLoading) return <p>Cargando auth…</p>;
  if (auth.error) return <p>Error: {auth.error.message}</p>;

  if (!auth.isAuthenticated) {
    auth.signinRedirect(); // redirección OIDC
    return <p>Redirigiendo a login…</p>; // fallback mientras navega
  }
  return children;
}
