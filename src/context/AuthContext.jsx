import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { initSocket, getSocket } from "../config/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [allUser, setAllUser] = useState([]);
  const [onlineUserId, setOnlineUserId] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const newSocket = initSocket(token);
    setSocket(newSocket);

    newSocket.on("onlineUsers", (users) => {
      setOnlineUserId(users);
    });
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
    newSocket.on("user:offline", ({ userId, lastSeen }) => {
      setAllUser((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, lastSeen } : u)),
      );
    });

    const interval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("heartbeat");
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      newSocket.off("onlineUsers");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("user:offline");
      newSocket.off("disconnect");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get("/refresh");
        const token = res.data.accessToken;
        setToken(token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const userRes = await api.get("/users/me");
        setUser(userRes.data.user);
      } catch (err) {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!token) return;
      try {
        const res = await api.get("/users");
        const users = res.data.users || res.data.data || res.data || [];
        setAllUser(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setAllUser([]);
      }
    };
    fetchAllUsers();
  }, [token]);

  const login = async (token) => {
    setToken(token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const res = await api.get("users/me");
      setUser(res.data.user || res.data.data);
    } catch (err) {
      logout();
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {}
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put("users/me", updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Update failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        user,
        setUser,
        loading,
        updateProfile,
        onlineUserId,
        allUser,
        socket, // ← expose socket agar bisa dipakai di hook lain
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
