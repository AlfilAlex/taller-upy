import { useAuth } from "react-oidc-context";

// Hook que devuelve un fetch pre‑configurado con Authorization:
export function useApi() {
  const auth = useAuth();
  const token = auth.user?.access_token;

  // ⚠️ Mientras se carga auth devolvemos un fetch que lanza error
  if (auth.isLoading) {
    return async () => {
      throw new Error("auth loading");
    };
  }

  return async function apiFetch(endpoint, { method = "GET", body } = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const res = await fetch(import.meta.env.VITE_API_URL + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) throw new Error(await res.text());
    if (res.status === 204) return null; // sin cuerpo
    return res.json();
  };
}
