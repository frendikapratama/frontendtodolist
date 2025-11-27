import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token) return;

    const newSocket = io(API_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Notification socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Notification socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("notification:new", (notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icon.png",
        });
      }
    });

    newSocket.on("notification:marked-read", ({ notificationId }) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    newSocket.on("notification:all-marked-read", ({ unreadCount }) => {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(unreadCount);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, API_URL]);

  const fetchNotifications = async (page = 1, limit = 20) => {
    try {
      const response = await api.get("/notifications", {
        params: { page, limit },
      });
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  };

  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit("notification:read", { notificationId });
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit("notification:read-all");
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
