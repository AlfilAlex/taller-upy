// src/views/Generador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Box, Container, Grid,
  FormControl, InputLabel, Select, MenuItem, TextField,
  Button, Snackbar, Alert, Stack, CircularProgress,
  IconButton
} from '@mui/material';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Image as ImageIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { API_BASE_URL } from '../config.js';


// Puedes ajustar el orden o añadir más si lo necesitas
export const NEARBY_CITIES = [
  { value: 'merida',    label: 'Mérida' },      // cabecera estatal
  { value: 'kanasin',   label: 'Kanasín' },     // conurbada al oriente
  { value: 'uman',      label: 'Umán' },        // conurbada al suroeste
  { value: 'progreso',  label: 'Progreso' },    // puerto principal
  { value: 'hunucma',   label: 'Hunucmá' },     // corredor industrial
  { value: 'motul',     label: 'Motul' },       // nodo regional oriente‑norte
  { value: 'tixkokob',  label: 'Tixkokob' },    // artesanías de henequén
  { value: 'conkal',    label: 'Conkal' },      // crecimiento habitacional
  { value: 'chicxulub', label: 'Chicxulub Pto.' },
  { value: 'chelem',    label: 'Chelem' }
];

export const CONDITION_OPTIONS = [
  { code: 'A', label: 'Dañado' },
  { code: 'B', label: 'Con detalles' },
  { code: 'C', label: 'Como nuevo' }
];



/* -------------------------------------------------------------------
 *  UTILIDAD: Redimensionar y comprimir una imagen < 1 KB             */
const resizeAndCompress = (
  file,
  { maxSide = 120, targetBytes = 30000, mime = 'image/jpeg' } = {}
) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        /* 1. Escalar manteniendo proporciones */
        const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        /* 2. Comprimir iterativamente */
        const qualities = [0.7, 0.5, 0.3, 0.15, 0.07]; // prueba de mayor a menor
        let finalDataUrl = null;

        for (const q of qualities) {
          const dataUrl = canvas.toDataURL(mime, q);
          // Cálculo aproximado: Base64 -> bytes = (len * 0.75) - padding
          const bytes = Math.ceil((dataUrl.length - 'data:image/jpeg;base64,'.length) * 0.75);
          if (bytes <= targetBytes) {
            finalDataUrl = dataUrl;
            break;
          }
        }
        /* 3. Resolver con la imagen válida o null para descartar */
        resolve(finalDataUrl); // null si no pasó el filtro
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

/* ------------------------------------------------------------------- */
function Generador({ role, userId, token, userName }) {
  const navigate = useNavigate();

  /* Redirección si el rol es incorrecto */
  useEffect(() => {
    if (role !== 'generador') navigate('/');
  }, [role]);

  /* ------------------------- Estado del formulario ----------------- */
  const initialForm = {
    material: '', condition: '', weightKg: '',
    scheme: '', price: '',
    address: { line1: '', city: 'merida', lat: '20.9888381', lng: '-89.7373046' },
    images: []
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, type: 'success', text: '' });

  /* --------------------------- Manejadores ------------------------- */
  const handleChange = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleAddressChange = (field) => (e) =>
    setForm((p) => ({ ...p, address: { ...p.address, [field]: e.target.value } }));

  /* --- Leer, redimensionar, comprimir y filtrar imágenes --- */
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files ?? []).slice(0, 5 - form.images.length);
    if (files.length === 0) return;

    const processed = await Promise.all(files.map(resizeAndCompress));
    const valid = processed.filter(Boolean);   // quita las descartadas
    if (valid.length === 0) {
      setMessage({
        open: true,
        type: 'warning',
        text: 'Ninguna imagen cumplió el tamaño máximo de 1 KB'
      });
      return;
    }
    setForm((p) => ({ ...p, images: [...p.images, ...valid] }));
  };

  /* --- Eliminar una imagen antes de enviar --- */
  const handleRemoveImage = (idx) =>
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== idx)
    }));

  /* --- Generar ID único para el lote --- */
  const generateId = () =>
    crypto?.randomUUID?.() ?? Math.random().toString(36).substring(2, 10);

  /* --- Enviar al backend --- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.material || !form.condition || !form.weightKg || !form.scheme) {
      setMessage({ open: true, type: 'error', text: 'Por favor completa los campos requeridos' });
      return;
    }
    const lot = {
      id: generateId(),
      material: form.material,
      status: 'OPEN',
      condition: form.condition,
      weightKg: Number(form.weightKg),
      scheme: form.scheme,
      price: form.scheme === 'donacion' ? 0 : Number(form.price),
      ownerId: userId,
      address: {
        line1: form.address.line1,
        city: form.address.city || 'Mérida',
        lat: form.address.lat ? Number(form.address.lat) : undefined,
        lng: form.address.lng ? Number(form.address.lng) : undefined
      },
      images: form.images
    };
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json', ...(token && { Authorization: token }) };
      const res = await fetch(`${API_BASE_URL}/lots`, {
        method: 'POST', headers, body: JSON.stringify(lot)
      });
      if (!res.ok) throw new Error(await res.text() || 'Error desconocido');
      await res.text();
      setMessage({ open: true, type: 'success', text: 'Lote creado exitosamente' });
      setForm(initialForm);
    } catch (err) {
      setMessage({ open: true, type: 'error', text: `Error al crear lote: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ UI -------------------------------- */
  return (
    <Box>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Re‑Crea HUB – Generador</Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>Usuario: {userName || userId}</Typography>
          <Button color="inherit" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Cambiar rol
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Crear nuevo lote</Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* ---------- Selector de material --------- */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="material-label">Material</InputLabel>
                <Select
                  labelId="material-label"
                  id="material"
                  value={form.material}
                  label="Material"
                  onChange={handleChange('material')}
                >
                  <MenuItem value="madera">Madera</MenuItem>
                  <MenuItem value="metal">Metal</MenuItem>
                  <MenuItem value="vidrio">Vidrio</MenuItem>
                  <MenuItem value="textil">Textil</MenuItem>
                  <MenuItem value="plastico">Plástico</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ---------- Condición ---------- */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="condition-label">Condición</InputLabel>
                <Select
                  labelId="condition-label"
                  id="condition"
                  value={form.condition}
                  label="Condición"
                  onChange={handleChange('condition')}
                >
                  {CONDITION_OPTIONS.map(({ code, label }) => (
                    <MenuItem value={code} key={code}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ---------- Peso ---------- */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="number" fullWidth required label="Peso (kg)"
                inputProps={{ min: 0.1, step: 0.1 }}
                value={form.weightKg} onChange={handleChange('weightKg')}
              />
            </Grid>

            {/* ---------- Esquema: donación / venta ---------- */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="scheme-label">Tipo</InputLabel>
                <Select
                  labelId="scheme-label"
                  id="scheme"
                  value={form.scheme}
                  label="Tipo"
                  onChange={handleChange('scheme')}
                >
                  <MenuItem value="donacion">Donación</MenuItem>
                  <MenuItem value="venta">Venta</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* ---------- Precio ---------- */}
            {form.scheme === 'venta' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number" fullWidth required label="Precio (MXN)"
                  inputProps={{ min: 1, step: 0.5 }}
                  value={form.price} onChange={handleChange('price')}
                />
              </Grid>
            )}

            {/* ---------- Dirección ---------- */}
            <Grid item xs={12}><Typography variant="subtitle1" sx={{ mt: 2 }}>Dirección</Typography></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required label="Línea 1"
                value={form.address.line1} onChange={handleAddressChange('line1')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="city-label">Ciudad</InputLabel>
                <Select
                  labelId="city-label"
                  id="city"
                  value={form.address.city}
                  label="Ciudad"
                  onChange={handleAddressChange('city')}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }} // evita listas largas
                >
                  {NEARBY_CITIES.map(({ value, label }) => (
                    <MenuItem value={value} key={value}>{label}</MenuItem>
                  ))}
                  {/* <MenuItem value="otra">Otra… (ingresar manual)</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>

            {/* {form.address.city === 'otra' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Ciudad (otra)"
                  value={form.address.cityOther ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      address: { ...p.address, cityOther: e.target.value }
                    }))
                  }
                />
              </Grid>
            )} */}

            <Grid item xs={12} sm={6}>
              <TextField type="number" fullWidth label="Latitud"
                value={form.address.lat} onChange={handleAddressChange('lat')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField type="number" fullWidth label="Longitud"
                value={form.address.lng} onChange={handleAddressChange('lng')}
              />
            </Grid>

            {/* ---------- Imágenes ---------- */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
                disabled={form.images.length >= 5}
              >
                Seleccionar imágenes
                <input
                  type="file" accept="image/*" multiple hidden
                  onChange={handleFilesChange}
                />
              </Button>

              {/* Previsualización + opción de borrar */}
              {form.images.length > 0 && (
                <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
                  {form.images.map((img, idx) => (
                    <Box key={idx}
                      sx={{
                        width: 80, height: 80, position: 'relative',
                        borderRadius: 1, overflow: 'hidden', border: '1px solid #ccc'
                      }}
                    >
                      <img
                        src={img} alt={`Imagen ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(idx)}
                        sx={{
                          position: 'absolute', top: 0, right: 0,
                          bgcolor: 'rgba(255,255,255,0.7)', p: 0.5
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
            </Grid>

            {/* ---------- Botón enviar ---------- */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit" variant="contained" color="primary"
                startIcon={<AddCircleOutlineIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Crear Lote'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* ---------- Snackbar ---------- */}
        <Snackbar
          open={message.open} autoHideDuration={5000}
          onClose={() => setMessage({ ...message, open: false })}
        >
          <Alert
            onClose={() => setMessage({ ...message, open: false })}
            severity={message.type} sx={{ width: '100%' }}
          >
            {message.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default Generador;
