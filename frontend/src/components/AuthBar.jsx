// src/components/AuthBar.jsx
import { useAuth } from "react-oidc-context";

export default function AuthBar() {
  const auth = useAuth();
  if (auth.isLoading) return null;
  if (auth.error)    return <p>⚠️ {auth.error.message}</p>;

  /* -------------- NO autenticado -------------- */
  if (!auth.isAuthenticated) {
    return (
      <div className="flex gap-4">
        {/* login */}
        <button className="btn-primary" onClick={() => auth.signinRedirect()}>
          Iniciar sesión
        </button>

        {/* signup (Cognito Hosted UI permite hint “signup”) */}
        <button
          className="btn-secondary"
          onClick={() =>
            auth.signinRedirect({
              extraQueryParams: { screen_hint: "signup" },
            })
          }
        >
          Crear cuenta
        </button>
      </div>
    );
  }

  /* -------------- SÍ autenticado -------------- */
  const { email } = auth.user.profile ?? {};
  return (
    <div className="flex gap-4 items-center">
      <span>{email}</span>
      <button className="btn-secondary" onClick={() => auth.signoutRedirect()}>
        Cerrar sesión
      </button>
    </div>
  );
}
