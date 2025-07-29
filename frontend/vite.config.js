import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Re‑Crea HUB frontend.  This file sets up the
// React plugin and defines a default development port.  When you run
// `npm run dev` the application will be served at http://localhost:5173 by
// default.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});