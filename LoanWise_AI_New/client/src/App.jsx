import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { MainLayout } from "./layouts/MainLayout";

import { Dashboard } from "./pages/Dashboard";
import { EligibilityAnalyzer } from "./pages/EligibilityAnalyzer";
import { AffordabilityCalculator } from "./pages/AffordabilityCalculator";
import { ScenarioLab } from "./pages/ScenarioLab";
import { LoanHistory } from "./pages/LoanHistory";
import { ModelInsights } from "./pages/ModelInsights";
import { HealthCenter } from "./pages/HealthCenter";
import { SettingsAbout } from "./pages/SettingsAbout";

import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AdminLogin } from "./pages/AdminLogin";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analyzer" element={<EligibilityAnalyzer />} />
            <Route path="affordability" element={<AffordabilityCalculator />} />
            <Route path="scenarios" element={<ScenarioLab />} />
            <Route path="history" element={<LoanHistory />} />
            <Route path="insights" element={<ModelInsights />} />
            <Route path="health" element={<HealthCenter />} />
            <Route path="about" element={<SettingsAbout />} />

            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="admin/login" element={<AdminLogin />} />

            <Route
              path="user/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
