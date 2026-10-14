import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("loanwise_token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("loanwise_token");
      if (storedToken) {
        try {
          const res = await api.getProfile();
          if (res && res.user) {
            setUser(res.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem("loanwise_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || "Login failed");
  };

  const adminLogin = async (email, password) => {
    const res = await api.adminLogin({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem("loanwise_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || "Admin login failed");
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    if (res && res.token && res.user) {
      localStorage.setItem("loanwise_token", res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("loanwise_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    adminLogin,
    register,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
