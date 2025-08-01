import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';

// Base64 encoded fallback image used when a lot does not provide
// its own photo.  This simple grey block is embedded directly
// into the bundle to avoid additional network requests.
const DEFAULT_IMAGE = 'data:image/png;base64,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';
import { API_BASE_URL } from '../config.js';

/**
 * View for “Receptor” users.  Displays a list of lots in the
 * “OPEN” state fetched from the backend and allows the user to
 * reserve one.  A local filter by material is applied in the client
 * to refine the results.
 */
function Receptor({ role, userId, token, userName }) {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [filterMaterial, setFilterMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  // Redirect if the role is not correct
  useEffect(() => {
    if (role !== 'receptor') navigate('/');
  }, [role]);

  // Reload the lots whenever the filter changes
  useEffect(() => {
    fetchLots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMaterial]);

  // Fetch open lots from the API
  const fetchLots = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const createdDay = today.toISOString().slice(0, 10).replace(/-/g, '');
      const query = `?status=OPEN&createdDay=${createdDay}`;
      const headers = {};
      if (token) headers['Authorization'] = token;
      const res = await fetch(`${API_BASE_URL}/lots${query}`, { headers });
      if (res.ok) {
        const items = await res.json();
        // API may return an array or an object keyed by PK
        const list = Array.isArray(items) ? items : Object.values(items);
        const filtered = filterMaterial ? list.filter((lot) => lot.material === filterMaterial) : list;
        setLots(filtered);
      } else {
        const err = await res.text();
        throw new Error(err || 'Error al listar lotes');
      }
    } catch (err) {
      setMessage({ open: true, type: 'error', text: `Error al cargar lotes: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Reserve a specific lot
  const handleReserve = async (lot) => {
    try {
      setLoading(true);
      // Derive the lot identifier: prefer the explicit id field, otherwise extract from pk
      const lotId = lot.id || (lot.pk ? lot.pk.replace(/^lot#/, '') : undefined);
      if (!lotId) throw new Error('ID de lote no encontrado');
      const endpoint = `${API_BASE_URL}/lots/${lotId}/reserve`;
      const headers = {};
      if (token) headers['Authorization'] = token;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers
      });
      if (res.ok) {
        setMessage({ open: true, type: 'success', text: 'Lote reservado con éxito' });
        // Refresh the list to reflect the reserved status
        fetchLots();
      } else {
        const err = await res.text();
        throw new Error(err || 'Error al reservar');
      }
    } catch (err) {
      setMessage({ open: true, type: 'error', text: `Error al reservar: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Re‑Crea HUB – Receptor
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Usuario: {userName || userId}
          </Typography>
          <Button color="inherit" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Cambiar rol
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel id="filter-material-label">Filtrar por material</InputLabel>
              <Select
                labelId="filter-material-label"
                value={filterMaterial}
                label="Filtrar por material"
                onChange={(e) => setFilterMaterial(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="madera">Madera</MenuItem>
                <MenuItem value="metal">Metal</MenuItem>
                <MenuItem value="vidrio">Vidrio</MenuItem>
                <MenuItem value="textil">Textil</MenuItem>
                <MenuItem value="plastico">Plástico</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {lots.map((lot) => (
              <Grid item xs={12} sm={6} md={4} key={lot.id || lot.pk}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {lot.images && lot.images.length > 0 ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={Array.isArray(lot.images) ? lot.images[0] : lot.images}
                      alt={lot.material}
                    />
                  ) : (
                    <CardMedia
                      component="img"
                      height="180"
                      image={DEFAULT_IMAGE}
                      alt="Sin imagen"
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ textTransform: 'capitalize' }}>
                      {lot.material}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Condición: {lot.condition}
                      <br />
                      Peso: {lot.weightKg} kg
                      <br />
                      Tipo: {lot.scheme === 'donacion' ? 'Donación' : 'Venta'}
                      <br />
                      Precio: {lot.scheme === 'donacion' ? 'Gratis' : `$${lot.price}`}
                    </Typography>
                    {lot.address && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Dirección: {lot.address.line1}
                        {lot.address.city ? `, ${lot.address.city}` : ''}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      onClick={() => handleReserve(lot)}
                      disabled={loading}
                    >
                      Reservar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {(!lots || lots.length === 0) && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center" sx={{ mt: 4 }}>
                  No hay lotes disponibles.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
        <Snackbar
          open={message.open}
          autoHideDuration={5000}
          onClose={() => setMessage({ ...message, open: false })}
        >
          <Alert
            onClose={() => setMessage({ ...message, open: false })}
            severity={message.type}
            sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Receptor;