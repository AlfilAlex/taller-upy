import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Snackbar
} from '@mui/material';
import Alert from '@mui/material/Alert';
// Ya no utilizamos las funciones de utilidades antiguas para crear y listar
// lotes.  En su lugar empleamos el hook useApi para llamar a las rutas
// REST expuestas por el backend serverless.
import { useApi } from "../utils/useApi";

// Catálogos de opciones permitidas según el modelo de DynamoDB.
const MATERIALS = ['madera', 'metal', 'vidrio', 'textil', 'plastico'];
const CONDITIONS = ['A', 'B', 'C'];
const SCHEMES = ['donacion', 'venta'];

/**
 * Panel principal para el rol Generador.  Permite publicar nuevos lotes y
 * muestra la lista de lotes que pertenecen al usuario activo.  Los datos
 * del usuario se almacenan en localStorage para persistir entre
 * recargas.  Todas las operaciones contra el backend se realizan
 * mediante las funciones definidas en src/utils/api.js.
 */
export default function GeneratorDashboard() {
  const api = useApi(); 
  const [userId, setUserId] = useState('');
  const [newLot, setNewLot] = useState({
    material: '',
    condition: 'B',
    weightKg: '',
    scheme: 'donacion',
    price: '',
    addressLine1: '',
    city: 'Mérida',
    images: []
  });
  const [myLots, setMyLots] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  console.error('GeneratorDashboard mounted');
  // Al montar, genera o recupera un identificador de usuario único para el rol generador
  useEffect(() => {
    let uid = localStorage.getItem('generatorId');
    if (!uid) {
      uid = 'generator-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('generatorId', uid);
    }
    setUserId(uid);
  }, []);

  // Cuando el userId esté definido, carga los lotes publicados por este usuario
  useEffect(() => {
    if (userId) {
      fetchLots();
    }
  }, [userId]);

  // Solicita al backend la lista de lotes del generador
  const fetchLots = async () => {
    try {
      // Obtenemos todos los lotes disponibles.  El backend no admite
      // filtrar por ownerId, por lo que filtramos en el cliente.  Si
      // necesitas limitar por estado o fecha puedes añadir parámetros
      // de consulta como `?status=OPEN` o `?day=YYYYMMDD`.
      const items = await api('/lots');
      if (Array.isArray(items)) {
        const mine = items.filter((l) => l.ownerId === userId);
        setMyLots(mine);
      } else {
        setMyLots([]);
      }
    } catch (err) {
      console.error(err);
      setMyLots([]);
    }
  };

  // Actualiza los valores del formulario. Para el campo de imágenes se
  // convierte FileList a un array normal.
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'images' && files) {
      setNewLot((prev) => ({ ...prev, images: Array.from(files) }));
    } else {
      setNewLot((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Envía el formulario para publicar un lote en la base de datos
  const handlePublish = async () => {
    console.log('Publicando lote:', newLot);
    try {
      if (!newLot.material || !newLot.weightKg || !newLot.addressLine1) {
        setNotification({ open: true, message: 'Completa los campos obligatorios', severity: 'warning' });
        return;
      }
      if (newLot.images.length < 2) {
        setNotification({ open: true, message: 'Debes seleccionar al menos 2 imágenes', severity: 'warning' });
        return;
      }
      // Construye el objeto del lote conforme al contrato del backend
      // serverless.  El backend generará la clave primaria (pk) y
      // asociará el ownerId a partir del usuario autenticado, por lo que
      // sólo enviamos los campos propios del lote.  Se utiliza una UUID
      // para el campo `id`, necesario para componer la clave primaria
      // internamente en el backend.
      const lotInfo = {
        id: crypto.randomUUID(),
        material: newLot.material,
        condition: newLot.condition,
        weightKg: Number(newLot.weightKg),
        scheme: newLot.scheme,
        price: newLot.scheme === 'donacion' ? 0 : Number(newLot.price),
        address: {
          line1: newLot.addressLine1,
          city: newLot.city
        },
        images: newLot.images.map((f) => f.name)
      };
      console.log(lotInfo);
      // Envía la solicitud a la ruta POST /lots.  El hook useApi
      // agregará automáticamente el encabezado Authorization.
      await api('/lots', { method: 'POST', body: lotInfo });
      setNotification({ open: true, message: 'Lote publicado correctamente', severity: 'success' });
      // Restablece el formulario a sus valores por defecto
      setNewLot({
        material: '',
        condition: 'B',
        weightKg: '',
        scheme: 'donacion',
        price: '',
        addressLine1: '',
        city: 'Mérida',
        images: []
      });
      fetchLots();
    } catch (err) {
      console.error(err);
      setNotification({ open: true, message: 'Error al publicar el lote', severity: 'error' });
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Panel del Generador
      </Typography>
      <Grid container spacing={2}>
        {/* Formulario de publicación */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Publicar Nuevo Lote
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="material-label">Material</InputLabel>
                <Select
                  labelId="material-label"
                  name="material"
                  value={newLot.material}
                  label="Material"
                  onChange={handleChange}
                >
                  {MATERIALS.map((mat) => (
                    <MenuItem key={mat} value={mat}>
                      {mat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel id="condition-label">Condición</InputLabel>
                <Select
                  labelId="condition-label"
                  name="condition"
                  value={newLot.condition}
                  label="Condición"
                  onChange={handleChange}
                >
                  {CONDITIONS.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Peso (kg)"
                name="weightKg"
                type="number"
                fullWidth
                margin="normal"
                value={newLot.weightKg}
                onChange={handleChange}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="scheme-label">Esquema</InputLabel>
                <Select
                  labelId="scheme-label"
                  name="scheme"
                  value={newLot.scheme}
                  label="Esquema"
                  onChange={handleChange}
                >
                  {SCHEMES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {newLot.scheme === 'venta' && (
                <TextField
                  label="Precio"
                  name="price"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={newLot.price}
                  onChange={handleChange}
                />
              )}
              <TextField
                label="Dirección (línea 1)"
                name="addressLine1"
                fullWidth
                margin="normal"
                value={newLot.addressLine1}
                onChange={handleChange}
              />
              <TextField
                label="Ciudad"
                name="city"
                fullWidth
                margin="normal"
                value={newLot.city}
                onChange={handleChange}
              />
              <Box sx={{ marginY: 2 }}>
                <Typography variant="body1">Imágenes (mín. 2)</Typography>
                <input type="file" name="images" multiple accept="image/*" onChange={handleChange} />
              </Box>
              <Button variant="contained" color="primary" onClick={handlePublish}>
                Publicar Lote
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Lista de lotes publicados */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Mis Lotes Publicados
          </Typography>
          {myLots && myLots.length > 0 ? (
            myLots.map((lote) => {
              const key = lote.pk || lote.id;
              return (
                <Card key={key} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{lote.material}</Typography>
                    <Typography variant="body2">
                      Condición: {lote.condition} | Peso: {lote.weightKg} kg
                    </Typography>
                    <Typography variant="body2">
                      Esquema: {lote.scheme}
                      {lote.scheme === 'venta' && ` | Precio: ${lote.price}`}
                    </Typography>
                    <Typography variant="caption">
                      Estado: {lote.status || 'OPEN'}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Typography>No tienes lotes publicados.</Typography>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}