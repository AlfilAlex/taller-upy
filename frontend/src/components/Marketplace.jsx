import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { listLots } from '../utils/api';

/**
 * Vista de marketplace para el rol receptor.  Muestra un listado de lotes
 * disponibles y permite filtrar por material o dirección.  Cuando el
 * usuario hace clic en "Ver Detalles" se navega a la pantalla de
 * detalle del lote.
 */
export default function Marketplace() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [lots, setLots] = useState([]);
  const [filter, setFilter] = useState('');

  // Obtiene un identificador de receptor único y carga los lotes disponibles
  useEffect(() => {
    let uid = localStorage.getItem('receptorId');
    if (!uid) {
      uid = 'receptor-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('receptorId', uid);
    }
    setUserId(uid);
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const items = await listLots({ status: 'OPEN' });
      setLots(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtra los lotes en memoria según el texto introducido
  const lotsFiltered = lots.filter((l) => {
    const text = filter.toLowerCase();
    return (
      (l.material && l.material.toLowerCase().includes(text)) ||
      (l.address?.line1 && l.address.line1.toLowerCase().includes(text))
    );
  });

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Marketplace de Lotes
      </Typography>
      <TextField
        label="Buscar por material o dirección..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <Grid container spacing={2}>
        {lotsFiltered.map((lote) => (
          <Grid item xs={12} md={6} lg={4} key={lote.pk}>
            <Card>
              <CardContent>
                <Typography variant="h6">{lote.material}</Typography>
                <Typography variant="body2" paragraph>
                  Condición: {lote.condition} | Peso: {lote.weightKg} kg
                </Typography>
                <Typography variant="caption">
                  Publicado por: {lote.ownerId}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/receptor/lote/${encodeURIComponent(lote.pk)}`)}
                >
                  Ver Detalles
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}