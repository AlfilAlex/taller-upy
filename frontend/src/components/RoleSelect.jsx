import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Componente inicial que permite elegir entre los roles de Generador y
// Receptor.  Usa Material UI para un diseño sencillo y agradable.
export default function RoleSelect() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: 8 }}>
      <Typography variant="h4" gutterBottom>
        Bienvenido a Re‑Crea HUB
      </Typography>
      <Typography variant="h6" gutterBottom>
        Selecciona tu rol para continuar:
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/generador')}
        >
          Soy Generador
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/receptor')}
        >
          Soy Receptor
        </Button>
      </Box>
    </Container>
  );
}