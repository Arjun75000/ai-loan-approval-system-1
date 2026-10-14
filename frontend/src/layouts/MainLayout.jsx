import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { api } from "../services/api";

export const MainLayout = () => {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    server: "checking",
    database: "checking",
    ml_model: "checking"
  });
  const location = useLocation();

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.getHealth();
        if (res && res.services) {
          setSystemStatus(res.services);
        }
      } catch (err) {
        setSystemStatus({
          server: "offline",
          database: "unavailable",
          ml_model: "unavailable"
        });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/analyzer", label: "Eligibility Analyzer", icon: "🎯" },
    { path: "/affordability", label: "Affordability Calculator", icon: "🧮" },
    { path: "/scenarios", label: "What-If Scenario Lab", icon: "🔬" },
    { path: "/history", label: "Analysis History", icon: "📜" },
    { path: "/insights", label: "Model Insights", icon: "📈" },
    { path: "/health", label: "System & Data Health", icon: "🩺" },
    { path: "/about", label: "Settings / About", icon: "⚙️" }
  ];

  const getPageTitle = () => {
    const active = navItems.find((item) => item.path === location.pathname);
    return active ? active.label : "LoanWise AI";
  };

  return (
    <div className="app-container">
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-badge">LW</div>
          <div className="logo-text">
            <h1>LoanWise AI</h1>
            <span>Risk Intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="disclaimer-tag">
            Decision Support Tool: Predictions are non-binding statistical estimates.
          </div>
        </div>
      </aside>

      <div className="main-layout">
        <header className="top-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              ☰
            </button>
            <div className="header-title">{getPageTitle()}</div>
          </div>

          <div className="header-right">
            <div
              className={`system-badge ${
                systemStatus.ml_model === "ready" ? "status-ready" : "status-warning"
              }`}
            >
              <span className="status-dot"></span>
              <span>ML: {systemStatus.ml_model === "ready" ? "Ready" : "Waiting"}</span>
            </div>

            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
          </div>
        </header>

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
