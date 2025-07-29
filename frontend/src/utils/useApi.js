// src/utils/useApi.js  (💡js puro para poder usarlo en todo el código)
import { useAuth } from "react-oidc-context";

export function useApi() {
    const auth = useAuth();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    return async function apiFetch(path, { method = "GET", body } = {}) {
        console.log(`API call: ${method} ${baseUrl}${path}`, body);
        const headers = {
            "Content-Type": "application/json",
            ...(auth.user && { Authorization: `Bearer ${auth.user.access_token}` }),
        };

        const res = await fetch(baseUrl + path, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) throw new Error(await res.text());
        if (res.status === 204) return null;
        return res.json();
    };
}
