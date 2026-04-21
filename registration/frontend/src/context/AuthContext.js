import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchMe();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error(error);
      logout();
    }
  };

  const login = async (email, password, options = {}) => {
    const body = { email, password };
    if (options.portal) body.portal = options.portal;
    const res = await axios.post("/api/auth/login", body);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data);
    }
    return res.data;
  };

  const registerUser = async (name, email, password, role) => {
    const res = await axios.post("/api/auth/register", { name, email, password, role });
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setUser(res.data);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, isAuthenticated: !!user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
