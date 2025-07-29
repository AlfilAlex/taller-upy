import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Button,
  Typography,
  Box
} from '@mui/material';
// Importamos únicamente las funciones necesarias.  En este caso
// utilizaremos useApi para obtener un cliente fetch con cabeceras de
// autenticación.
// No importamos listLots porque utilizamos useApi para recuperar todos los lotes
import { useApi } from '../utils/useApi';

/**
 * Pantalla de detalle para un lote específico.  Carga la información del
 * lote a partir de su clave primaria (pk) y permite reservarlo si se
 * encuentra disponible.  Después de reservar, redirige a la pantalla
 * de confirmación.
 */
export default function LotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const api = useApi();
  const [userId, setUserId] = useState('');

  useEffect(() => {
    let uid = localStorage.getItem('receptorId');
    if (!uid) {
      uid = 'receptor-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('receptorId', uid);
    }
    setUserId(uid);
    fetchLot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchLot = async () => {
    try {
      // Obtenemos todos los lotes y filtramos el deseado.  El backend
      // actual no permite recuperar un lote concreto por pk/id, por lo
      // que realizamos el filtrado en el cliente.
      const items = await api('/lots');
      if (Array.isArray(items)) {
        const found = items.find((item) => item.pk === id || item.id === id);
        setLot(found || null);
      } else {
        setLot(null);
      }
    } catch (err) {
      console.error(err);
      setLot(null);
    }
  };

  const handleReserve = async () => {
    try {
      // Reservamos el lote mediante la ruta PUT /lots/{id}/reserve.  El
      // backend utilizará la identidad del usuario autenticado (sub del
      // token) para marcar el receptor; no es necesario enviar userId.
      await api(`/lots/${id}/reserve`, { method: 'PUT' });
      navigate(`/receptor/confirmacion/${encodeURIComponent(id)}`);
    } catch (err) {
      console.error(err);
      alert('Error al reservar el lote');
    }
  };

  if (!lot) {
    return <Typography>Cargando...</Typography>;
  }

  const isAvailable = !lot.status || lot.status === 'OPEN';

  return (
    <Box sx={{ padding: 2 }}>
      <Card sx={{ padding: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {lot.material}
          </Typography>
          <Typography variant="body1" paragraph>
            Condición: {lot.condition}
          </Typography>
          <Typography variant="body1" paragraph>
            Peso: {lot.weightKg} kg
          </Typography>
          <Typography variant="body1" paragraph>
            Esquema: {lot.scheme}
            {lot.scheme === 'venta' && ` | Precio: ${lot.price}`}
          </Typography>
          {lot.address && (
            <Typography variant="body1" paragraph>
              Dirección: {lot.address.line1}, {lot.address.city}
            </Typography>
          )}
          <Typography variant="subtitle2">
            Estado: {lot.status || 'OPEN'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReserve}
            disabled={!isAvailable}
            sx={{ mt: 2 }}
          >
            {isAvailable ? 'Reservar Lote' : 'Lote no disponible'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}