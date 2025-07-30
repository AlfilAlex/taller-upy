import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Entry point of the React application.  This file mounts the root
// component into the DOM.  Vite will replace this script tag when
// bundling for production.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);