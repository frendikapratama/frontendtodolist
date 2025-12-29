import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";
import { API_URL, SOCKET_URL } from "../api/axios";
import { useQueryClient } from "@tanstack/react-query";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  // const API_URL = import.meta.env.VITE_SOCKET_URL || 'https://planify.itvault.cloud' ;

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => {
      // console.log("Notification socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      // console.log("Notification socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("notification:new", (notification) => {
      // console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icon.png",
        });
      }
    });

    // Di NotificationContext.jsx, dalam useEffect socket
    // Setelah listener notification:new, tambahkan:

    newSocket.on("notification:comment", (data) => {
      console.log("Comment notification received:", data);
      // Invalidate query untuk refresh comments
      queryClient.invalidateQueries(["comment", data.taskId]);

      // Tampilkan notifikasi jika bukan user yang comment
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: "TASK_COMMENT",
          title: data.title,
          message: data.message,
          isRead: false,
          createdAt: data.timestamp,
          project: data.projectId,
          metadata: {
            taskName: data.taskName,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
          },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("notification:reply", (data) => {
      console.log("Reply notification received:", data);
      // Invalidate query untuk refresh comments
      queryClient.invalidateQueries(["comment", data.taskId]);

      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: "TASK_REPLY_COMMENT",
          title: data.title,
          message: data.message,
          isRead: false,
          createdAt: data.timestamp,
          project: data.projectId,
          metadata: {
            taskName: data.taskName,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
          },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("notification:subtask-comment", (data) => {
      console.log("Subtask comment notification received:", data);
      // Invalidate dengan query key yang benar
      queryClient.invalidateQueries(["subtask-comment", data.subtaskId]);

      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: "SUBTASK_COMMENT",
          title: data.title,
          message: data.message,
          isRead: false,
          createdAt: data.timestamp,
          project: data.projectId,
          metadata: {
            subtaskName: data.subtaskName,
            taskName: data.taskName,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
          },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("notification:subtask-reply", (data) => {
      console.log("Subtask reply notification received:", data);
      queryClient.invalidateQueries(["subtask-comment", data.subtaskId]);

      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: "SUBTASK_REPLY_COMMENT",
          title: data.title,
          message: data.message,
          isRead: false,
          createdAt: data.timestamp,
          project: data.projectId,
          metadata: {
            subtaskName: data.subtaskName,
            taskName: data.taskName,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
          },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
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

    newSocket.on("notification:attachment", (data) => {
      console.log("Attachment notification received:", data);

      // Invalidate query untuk refresh attachments
      queryClient.invalidateQueries(["attachments", data.taskId]);

      // Tampilkan notifikasi
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
          type: "TASK_ATTACHMENT_UPLOADED",
          title: data.title,
          message: data.message,
          isRead: false,
          createdAt: data.timestamp,
          project: data.projectId,
          metadata: {
            taskName: data.taskName,
            fileName: data.fileName,
            projectId: data.projectId,
            workspaceId: data.workspaceId,
          },
        },
        ...prev,
      ]);
      setUnreadCount((prev) => prev + 1);
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
      // console.error("Error fetching notifications:", error);
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
