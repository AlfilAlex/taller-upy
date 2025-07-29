// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RoleSelect         from "./components/RoleSelect.jsx";
import GeneratorDashboard from "./components/GeneratorDashboard.jsx";
import Marketplace        from "./components/Marketplace.jsx";
import LotDetail          from "./components/LotDetail.jsx";
import Confirmation       from "./components/Confirmation.jsx";

import ProtectedRoute from "./auth/ProtectedRoute.jsx";      // 👈 nuevo
import AuthBar        from "./components/AuthBar.jsx";       // 👈 nuevo

export default function App() {
  return (
    <>
      {/* barra superior con botones de autenticación */}
      <AuthBar />                                            {/* 👈 nuevo */}

      <Routes>
        {/* --- Públicas --- */}
        <Route path="/" element={<RoleSelect />} />

        {/* --- Protegidas --- */}
        <Route
          path="/generador"
          element={
            <ProtectedRoute>
              <GeneratorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptor"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptor/lote/:id"
          element={
            <ProtectedRoute>
              <LotDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receptor/confirmacion/:id"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
