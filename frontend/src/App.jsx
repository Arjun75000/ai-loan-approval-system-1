import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { EligibilityAnalyzer } from "./pages/EligibilityAnalyzer";
import { AffordabilityCalculator } from "./pages/AffordabilityCalculator";
import { ScenarioLab } from "./pages/ScenarioLab";
import { LoanHistory } from "./pages/LoanHistory";
import { ModelInsights } from "./pages/ModelInsights";
import { HealthCenter } from "./pages/HealthCenter";
import { SettingsAbout } from "./pages/SettingsAbout";

export default function App() {
  return (
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
