import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import { redirect, useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isConnected,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    // Tidak redirect dan tidak close dropdown
  };

  // Tambahkan handler terpisah jika ingin navigate (opsional)
  const handleNavigateToProject = (notif, e) => {
    e.stopPropagation(); // Prevent parent click

    if (notif.project) {
      // Fix: Extract ID if project is object
      const projectId =
        typeof notif.project === "object"
          ? notif.project._id || notif.project.id
          : notif.project;

      navigate(`/project/${projectId}`);
      setIsOpen(false);
    }
  };
  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInSeconds = Math.floor((now - notifDate) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;

    return notifDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "TASK_STATUS_CHANGED":
        return "🔄";
      case "TASK_ASSIGNED":
        return "📋";
      case "TASK_COMMENT":
        return "💬";
      case "TASK_REPLY_COMMENT":
        return "💭";
      case "TASK_ATTACHMENT_UPLOADED":
        return "📎";
      case "TASK_DUE_SOON":
        return "⏰";
      case "TASK_OVERDUE":
        return "⚠️";
      case "MENTION":
        return "🏷️";
      case "SUBTASK_COMMENT":
        return "💬";
      case "REPLY_SUBTASK_COMMENT":
        return "💭";
      case "SUBTASK_ATTACHMENT_UPLOADED":
        return "📎";
      default:
        return "🔔";
    }
  };

  const getNotificationStyle = (notif) => {
    if (notif.type === "TASK_DUE_SOON" && notif.metadata?.daysRemaining) {
      const days = notif.metadata.daysRemaining;
      if (days === 1) return "bg-red-50 border-l-4 border-red-500";
      if (days === 2) return "bg-orange-50 border-l-4 border-orange-500";
      if (days <= 7) return "bg-yellow-50 border-l-4 border-yellow-500";
    }
    if (notif.type === "TASK_OVERDUE") {
      return "bg-red-50 border-l-4 border-red-500";
    }
    return !notif.isRead ? "bg-blue-50" : "";
  };
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell
          className={`w-6 h-6 text-white cursor-pointer transition-colors
    ${isConnected ? "text-white" : "text-gray-700"}
    group-hover:text-gray-900
  `}
        />

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/4 -translate-y-1/4">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <span
          className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl z-90 border border-gray-200 max-h-128 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800">
                Notifikasi
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    title="Tandai semua dibaca"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Tandai semua
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  Tidak ada notifikasi
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Notifikasi akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 hover:bg-gray-50 transition-colors  ${
                      !notif.isRead ? `${getNotificationStyle(notif)}` : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 text-2xl">
                        {getNotificationIcon(notif.type)}
                      </div>

                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`font-medium text-sm ${
                              !notif.isRead ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <div className="shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>

                        {notif.metadata && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {notif.metadata.workspaceName && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {notif.metadata.workspaceName}
                              </span>
                            )}
                            {notif.metadata.projectName && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {notif.metadata.projectName}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                          {formatDate(notif.createdAt)}
                          {notif.isRead && (
                            <Check className="w-3 h-3 text-gray-400" />
                          )}
                        </p>
                        {notif.project && (
                          <button
                            onClick={(e) => handleNavigateToProject(notif, e)}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                          >
                            Lihat Project →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
