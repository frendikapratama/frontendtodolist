import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { initSocket, getSocket } from "../config/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [allUser, setAllUser] = useState([]);
  const [onlineUserId, setOnlineUserId] = useState([])
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   if (!token) return;
  //   const newSocket = initSocket(token);
  //   setSocket(newSocket);
  //   newSocket.on("onlineUsers", (users) => {
  //     setOnlineUserId(users);
  //   });
  //   const interval = setInterval(() => {
  //     newSocket.emit("heartbeat");
  //   }, 60000);
  //   return () => {
  //     clearInterval(interval);
  //     newSocket.disconnect();
  //   };
  // }, [token]);
  // useEffect(() => {
  //   const initAuth = async () => {
  //     try {
  //       const res = await api.get("/refresh");
  //       const token = res.data.accessToken;

  //       setToken(token);
  //       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //       const userRes = await api.get("/users/me");
  //       setUser(userRes.data.user);
  //     } catch (err) {
  //       setUser(null);
  //       setToken(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   initAuth();
  // }, []);

  // useEffect(() => {
  //   fetch("/api/users/")
  //     .then(res => res.json())
  //     .then(data => setAllUser(data))
  // }, [])
  // useEffect(() => {
  //   socket.on("onlineUsers", (users) => {
  //     setOnlineUserId(users);
  //   });
  //   return () => {
  //     socket.off("onlineUsers");
  //   };
  // }, []);
  // useEffect(() => {
  //   if (!token) return;
  //   const newSocket = initSocket(token);
  //   setSocket(newSocket);
  //   newSocket.on("onlineUsers", (users) => {
  //     setOnlineUserId(users);
  //   });
  //   const interval = setInterval(() => {
  //     newSocket.emit("heartbeat");
  //   }, 60000);
  //   return () => {
  //     clearInterval(interval);
  //     newSocket.off("onlineUsers");
  //     newSocket.disconnect();
  //   };
  // }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const newSocket = initSocket(token);
    setSocket(newSocket);
    newSocket.on("onlineUsers", (users) => {
      setOnlineUserId(users);
    });
    newSocket.on("connect", () => {
      console.log('Socket connected in AuthContext:', newSocket.id);
    });
    newSocket.on("connect_error", (error) => {
      console.error('Socket connection error in AuthContext:', error.message);
    });
    newSocket.on("disconnect", (reason) => {
      console.log('Socket disconnected in AuthContext:', reason);
    });
    const interval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("heartbeat");
      } else {
        console.log('Socket not connected, skipping heartbeat');
      }
    }, 30000);
    return () => {
      clearInterval(interval);
      newSocket.off("onlineUsers");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, [token]);

  // Initialize auth on mount
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
    // sessionStorage.setItem("token", newToken);
    // localStorage.setItem("token", newToken);
    setToken(token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      const res = await api.get("users/me");
      setUser(res.data.user || res.data.data);
    } catch (err) {
      console.log("failed get data user", err);
      logout();
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // ignore error
    }
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };
  const updateProfile = async (updateData) => {
    try {
      const res = await api.put("users/me", updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUser(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error("Update error details:", {
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        data: err.response?.data,
        status: err.response?.status,
      });

      return {
        success: false,
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Update failed",
      };
    }
  };

  // useEffect(() => {
  //   // const savedToken = sessionStorage.getItem("token");
  //   const savedToken = localStorage.getItem("token");
  //   if (savedToken) {
  //     setToken(savedToken);
  //     api
  //       .get("users/me")
  //       .then((res) => setUser(res.data.user))
  //       .catch(() => logout())
  //       .finally(() => setLoading(false));
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);

  return (
    <AuthContext.Provider
      value={{ token, login, logout, user, setUser, loading, updateProfile, onlineUserId, allUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
