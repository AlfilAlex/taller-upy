import React from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Typography, Paper, Box } from '@mui/material';

/**
 * Pantalla de confirmación que muestra un código de reserva generado a
 * partir del id del lote reservado.  Utiliza la librería react-qr-code
 * para renderizar un QR que se puede escanear.  También muestra el
 * valor textual del código al usuario.
 */
export default function Confirmation() {
  const { id } = useParams();
  const reservaCode = `RESERVA-${id}-${Date.now()}`;
  return (
    <Box sx={{ padding: 2 }}>
      <Paper sx={{ padding: 4, textAlign: 'center', marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          ¡Reserva Confirmada!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Código de Reserva:
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {reservaCode}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <QRCode value={reservaCode} />
        </Box>
      </Paper>
    </Box>
  );
}