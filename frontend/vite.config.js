import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the Re‑Crea HUB frontend.
// This file registers the React plugin so that JSX and modern
// JavaScript syntax are properly handled.  No additional
// configuration is required unless the backend domain is different
// than the one serving the frontend (in which case a proxy could
// be declared here).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});