import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (newToken) => {
    // sessionStorage.setItem("token", newToken);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    try {
      const res = await api.get("users/me");
      setUser(res.data.user);
    } catch (err) {
      console.log("failed get data user", err);
      logout();
    }
  };

  const logout = () => {
    // sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
  const updateProfile = async (updateData) => {
    try {
      console.log("Sending update data:", updateData);
      const res = await api.put("users/me", updateData);
      console.log("Update response:", res.data);
      setUser(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error("Update error details:", {
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        data: err.response?.data,
        status: err.response?.status
      });

      return {
        success: false,
        message: err.response?.data?.message || err.response?.data?.error || "Update failed"
      };
    }
  };

  useEffect(() => {
    // const savedToken = sessionStorage.getItem("token");
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      api
        .get("users/me")
        .then((res) => setUser(res.data.user))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, login, logout, user, setUser, loading, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
