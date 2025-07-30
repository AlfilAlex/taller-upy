import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import {
  Storefront as StorefrontIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

/**
 * Landing page of the application.  It allows the user to choose
 * between the “Generador” and “Receptor” roles, define a user
 * identifier and optionally provide a JWT token.  The selection and
 * identifiers are persisted in localStorage so that subsequent
 * reloads remember the session.
 */
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, REDIRECT_URI, COGNITO_SCOPE } from '../config.js';

function Landing({ role, setRole, userId, setUserId, token, setToken, userName, setUserName }) {
  const navigate = useNavigate();
  const [tempId, setTempId] = useState(userId || '');
  const [tempToken, setTempToken] = useState(token || '');
  const [msg, setMsg] = useState({ open: false, type: 'error', text: '' });

  // Generate a pseudo–random user id when the component first loads
  useEffect(() => {
    if (!userId) {
      const randomId = Math.random().toString(36).substring(2, 10);
      setTempId(randomId);
    }
  }, []);

  const handleRoleSelect = (selected) => {
    // When using Cognito, userId and token are filled automatically.  In
    // manual mode, ensure that the user has provided an identifier.
    if (!token && !tempId) {
      setMsg({ open: true, type: 'error', text: 'Debes proporcionar un identificador de usuario' });
      return;
    }
    const finalUserId = token ? userId : tempId;
    const finalToken = token ? token : tempToken;
    setRole(selected);
    setUserId(finalUserId);
    setToken(finalToken);
    if (userName) setUserName(userName);
    localStorage.setItem('role', selected);
    localStorage.setItem('userId', finalUserId);
    localStorage.setItem('token', finalToken);
    if (userName) localStorage.setItem('userName', userName);
    navigate(selected === 'generador' ? '/generador' : '/receptor');
  };

  // Initiates the Cognito hosted UI login flow
  const handleLogin = () => {
    if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
      setMsg({ open: true, type: 'error', text: 'Cognito no está configurado. Revise config.js' });
      return;
    }
    const url = `https://${COGNITO_DOMAIN}/login?client_id=${COGNITO_CLIENT_ID}&response_type=code&scope=${encodeURIComponent(COGNITO_SCOPE)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = url;
  };

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Re‑Crea HUB
          </Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 8 }} maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Bienvenido a Re‑Crea HUB
        </Typography>
        <Typography variant="body1" align="center" gutterBottom>
          Selecciona tu rol para comenzar.  Utilizaremos tu identificador y
          token para asociar tus acciones.
        </Typography>
        {!token ? (
          <Box display="flex" flexDirection="column" alignItems="center" mb={4} mt={2} gap={2}>
            {/* <TextField
              label="Identificador de usuario"
              variant="outlined"
              fullWidth
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
              helperText="Este identificador se utilizará para todas tus operaciones"
            />
            <TextField
              label="Token JWT (opcional)"
              variant="outlined"
              fullWidth
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              helperText="Si tu API requiere autenticación, introduce tu token aquí"
            /> */}
            {COGNITO_DOMAIN && COGNITO_CLIENT_ID && (
              <Button variant="contained" color="secondary" onClick={handleLogin}>
                Iniciar sesión con Cognito
              </Button>
            )}
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" alignItems="center" mb={4} mt={2} gap={2}>
            <Typography variant="h6">Hola, {userName || userId}</Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona tu rol para continuar
            </Typography>
          </Box>
        )}
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Card
              variant="outlined"
              sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { boxShadow: 6 } }}
              onClick={() => handleRoleSelect('generador')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <StorefrontIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h5" gutterBottom> Soy Generador </Typography>
                <Typography variant="body2">
                  Publica lotes de materiales que ya no necesitas y ayuda a promover la
                  economía circular.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Card
              variant="outlined"
              sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { boxShadow: 6 } }}
              onClick={() => handleRoleSelect('receptor')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <ShoppingCartIcon color="secondary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h5" gutterBottom> Soy Receptor </Typography>
                <Typography variant="body2">
                  Reserva o adquiere los lotes publicados por otros usuarios y da
                  una segunda vida a los materiales.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar
          open={msg.open}
          autoHideDuration={4000}
          onClose={() => setMsg({ ...msg, open: false })}
        >
          <Alert
            onClose={() => setMsg({ ...msg, open: false })}
            severity={msg.type}
            sx={{ width: '100%' }}
          >
            {msg.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Landing;