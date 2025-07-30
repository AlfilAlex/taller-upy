import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Landing from './components/Landing.jsx';
import Generador from './components/Generador.jsx';
import Receptor from './components/Receptor.jsx';
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, REDIRECT_URI, COGNITO_SCOPE } from './config.js';

// Helper to decode a JWT and return its payload
function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return {};
  }
}

// Define a custom Material UI theme.  Feel free to adjust the
// palette or typography to better suit your brand colours.  The
// background colours provide a subtle contrast between the app bar
// and the content area.
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#2e7d32' },
    error: { main: '#d32f2f' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 }
  }
});

/**
 * Root component of the Re‑Crea HUB frontend.  It maintains the
 * selected role, user identifier and JWT token in its state and
 * passes them down to the different views.  React Router is used to
 * render the appropriate component based on the current path.
 */
function App() {
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [userId, setUserId] = useState(() => localStorage.getItem('userId') || '');
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  // On first render, handle Cognito redirect (authorization code) and
  // exchange it for tokens.  Only runs if Cognito is configured
  // and there is no existing token.
  useEffect(() => {
    async function handleCognitoCallback() {
      if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) return;
      if (token) return;
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) return;
      try {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI
        });
        const response = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });
        if (!response.ok) {
          console.error('Error al intercambiar el código por tokens');
          return;
        }
        const data = await response.json();
        const idToken = data.id_token;
        if (!idToken) {
          console.error('No se recibió id_token de Cognito');
          return;
        }
        const payload = decodeJwtPayload(idToken);
        const sub = payload.sub;
        const name = payload.name || payload.email || payload['cognito:username'] || 'Usuario';
        setUserId(sub);
        setUserName(name);
        setToken(idToken);
        localStorage.setItem('userId', sub);
        localStorage.setItem('userName', name);
        localStorage.setItem('token', idToken);
        // Remove code from the URL to avoid repeated exchanges
        params.delete('code');
        const newSearch = params.toString();
        const newUrl = newSearch ? `${window.location.pathname}?${newSearch}` : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (err) {
        console.error('Error en el flujo de autenticación:', err);
      }
    }
    handleCognitoCallback();
  }, [token]);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline provides a consistent baseline to build upon */}
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Landing
                role={role}
                setRole={setRole}
                userId={userId}
                setUserId={setUserId}
                token={token}
                setToken={setToken}
                userName={userName}
                setUserName={setUserName}
              />
            }
          />
          <Route
            path="/generador"
            element={<Generador role={role} userId={userId} token={token} userName={userName} />}
          />
          <Route
            path="/receptor"
            element={<Receptor role={role} userId={userId} token={token} userName={userName} />}
          />
          {/* Catch–all route redirects unknown paths to landing */}
          <Route
            path="*"
            element={
              <Landing
                role={role}
                setRole={setRole}
                userId={userId}
                setUserId={setUserId}
                token={token}
                setToken={setToken}
                userName={userName}
                setUserName={setUserName}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;