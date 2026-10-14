import React, { useState, useEffect } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const MainLayout = () => {
  const [theme, setTheme] = useState("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    server: "checking",
    database: "checking",
    ml_model: "checking"
  });

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const baseNavItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/analyzer", label: "Eligibility Analyzer", icon: "🎯" },
    { path: "/affordability", label: "Affordability Calculator", icon: "🧮" },
    { path: "/scenarios", label: "What-If Scenario Lab", icon: "🔬" },
    { path: "/history", label: "Analysis History", icon: "📜" },
    { path: "/insights", label: "Model Insights", icon: "📈" },
    { path: "/health", label: "System & Data Health", icon: "🩺" },
    { path: "/about", label: "Settings / About", icon: "⚙️" }
  ];

  const authNavItems = [];
  if (isAuthenticated) {
    authNavItems.push({ path: "/user/dashboard", label: "My Dashboard", icon: "👤" });
    if (isAdmin) {
      authNavItems.push({ path: "/admin/dashboard", label: "Admin Console", icon: "🛡️" });
    }
  }

  const allNavItems = [...baseNavItems, ...authNavItems];

  const getPageTitle = () => {
    const active = allNavItems.find((item) => item.path === location.pathname);
    if (active) return active.label;
    if (location.pathname === "/login") return "Sign In";
    if (location.pathname === "/register") return "Create Account";
    if (location.pathname === "/forgot-password") return "Password Recovery";
    if (location.pathname === "/admin/login") return "Admin Authentication";
    return "LoanWise AI";
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
          {allNavItems.map((item) => (
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
          {isAuthenticated ? (
            <div style={{ marginBottom: "12px", background: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "8px" }}>
              <div style={{ fontSize: "12px", color: "#ffffff", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                Role: {user?.role === "admin" ? "Admin 🛡️" : "Applicant"}
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ width: "100%", marginTop: "8px", padding: "4px 8px", fontSize: "11px" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <Link to="/login" className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-secondary btn-sm" style={{ width: "100%" }}>
                Register Account
              </Link>
            </div>
          )}

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

            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  to="/user/dashboard"
                  style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}
                >
                  👤 {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

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
