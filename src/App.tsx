import React from "react"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import Patients from "./pages/Patients"
import Schedule from "./pages/Schedule"
import Financial from "./pages/Financial"
import Inventory from "./pages/Inventory"
import Procedures from "./pages/Procedures"
import Assets from "./pages/Assets"
import Branches from "./pages/Branches"
import Staff from "./pages/Staff"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import { ThemeProvider } from "./components/ThemeProvider"
import { AuthProvider, useAuth } from "./components/AuthContext"

import ErrorBoundary from "./components/ErrorBoundary"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAuthReady } = useAuth();
  
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="pacientes" element={<Patients />} />
                <Route path="agenda" element={<Schedule />} />
                <Route path="financeiro" element={<Financial />} />
                <Route path="estoque" element={<Inventory />} />
                <Route path="procedimentos" element={<Procedures />} />
                <Route path="patrimonio" element={<Assets />} />
                <Route path="filiais" element={<Branches />} />
                <Route path="equipe" element={<Staff />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
