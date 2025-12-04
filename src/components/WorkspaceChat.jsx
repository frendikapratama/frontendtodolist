import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../api/axios";
import { API_URL } from "../api/axios";
const chatApi = {
  async getWorkspaceMessages(workspaceId, page = 1, limit = 50) {
    const res = await api.get(
      `/chat/workspace/${workspaceId}?page=${page}&limit=${limit}`
    );
    return res.data.data;
  },

  async uploadFile(workspaceId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/chat/upload/${workspaceId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  },
};

const WorkspaceChat = ({ workspaceId, currentUser, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Guard: pastikan token dan currentUser tersedia
    if (!token || !currentUser) {
      console.warn("Token or currentUser not available yet");
      return;
    }

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ["polling"],
      withCredentials: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      newSocket.emit("join:workspace", workspaceId);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    newSocket.on("joined:workspace", (data) => {
      console.log("Joined workspace:", data.workspaceId);
    });

    newSocket.on("chat:message", (message) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) {
          return prev;
        }
        return [...prev, message];
      });
    });

    newSocket.on("user:joined", (data) => {
      console.log(`${data.username} joined`);
      setOnlineUsers((prev) => {
        if (!prev.find((u) => u.userId === data.userId)) {
          return [...prev, { userId: data.userId, username: data.username }];
        }
        return prev;
      });
    });

    newSocket.on("user:left", (data) => {
      console.log(`${data.username} left`);
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    newSocket.on("workspace:users", (data) => {
      setOnlineUsers(data.users || []);
      setTotalMembers(data.totalMembers || 0);
    });

    newSocket.on("chat:typing", ({ userId, username, isTyping: typing }) => {
      setIsTyping((prev) => ({
        ...prev,
        [userId]: typing ? username : null,
      }));

      setTimeout(() => {
        setIsTyping((prev) => ({
          ...prev,
          [userId]: null,
        }));
      }, 3000);
    });

    newSocket.on("chat:edited", (message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === message._id ? message : msg))
      );
    });

    newSocket.on("chat:deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    newSocket.on("chat:read", ({ messageId, userId, readAt }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === messageId) {
            const alreadyRead = msg.readBy?.some(
              (r) => r.user === userId || r.user._id === userId
            );
            if (!alreadyRead) {
              return {
                ...msg,
                readBy: [...(msg.readBy || []), { user: userId, readAt }],
              };
            }
          }
          return msg;
        })
      );
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      alert(error.message);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave:workspace", workspaceId);
        newSocket.close();
      }
    };
  }, [workspaceId, token, currentUser, API_URL]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const data = await chatApi.getWorkspaceMessages(workspaceId);
        setMessages(data);
      } catch (error) {
        console.error("Error loading messages:", error);
        alert("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = () => {
    if (!socket) return;

    socket.emit("chat:typing", { workspaceId, isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:typing", { workspaceId, isTyping: false });
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedFile) return;
    if (!socket || !isConnected) {
      alert("Not connected to chat server");
      return;
    }

    try {
      let fileUrl = null;
      let fileName = null;
      let type = "text";

      if (selectedFile) {
        const uploadData = await chatApi.uploadFile(workspaceId, selectedFile);
        fileUrl = uploadData.fileUrl;
        fileName = uploadData.fileName;
        type = uploadData.fileType;
      }

      // Kirim via socket, biarkan server yang emit kembali
      socket.emit("chat:send", {
        workspaceId,
        message: newMessage || fileName,
        type,
        fileUrl,
        fileName,
      });

      // Clear form
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const typingUsers = Object.values(isTyping).filter(Boolean);

  return (
    <div style={styles.container}>
      {/* Info Bar */}
      <div style={styles.infoBar}>
        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>👥</span>
          <div style={styles.infoText}>
            <div style={styles.infoLabel}>Members</div>
            <div style={styles.infoValue}>{totalMembers || "..."}</div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>{isConnected ? "🟢" : "🔴"}</span>
          <div style={styles.infoText}>
            <div style={styles.infoLabel}>Status</div>
            <div style={styles.infoValue}>
              {isConnected ? "Online" : "Offline"}
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.infoItem}>
          <span style={styles.infoIcon}>💬</span>
          <div style={styles.infoText}>
            <div style={styles.infoLabel}>Active Now</div>
            <div style={styles.infoValue}>{onlineUsers.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {isLoading ? (
          <div style={styles.loading}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyState}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              style={{
                ...styles.message,
                alignSelf:
                  msg.sender._id === currentUser._id
                    ? "flex-end"
                    : "flex-start",
                backgroundColor:
                  msg.sender._id === currentUser._id ? "#6366F1" : "#EEF2FF",
                color: msg.sender._id === currentUser._id ? "white" : "#1F2937",
                animation: "fadeIn 0.5s ease-in-out",
              }}
            >
              {msg.sender._id !== currentUser._id && (
                <div style={{ ...styles.senderName, color: "#4F46E5" }}>
                  {msg.sender.username}
                </div>
              )}

              {msg.type === "image" && msg.fileUrl && (
                <img
                  src={`${API_URL}${msg.fileUrl}`}
                  alt={msg.fileName}
                  style={styles.image}
                />
              )}

              {msg.type === "file" && msg.fileUrl && (
                <a
                  href={`${API_URL}${msg.fileUrl}`}
                  download
                  style={styles.fileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 {msg.fileName}
                </a>
              )}

              <div>{msg.message}</div>

              <div style={styles.timestamp}>
                {new Date(msg.createdAt).toLocaleTimeString()}
                {msg.isEdited && " (edited)"}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div style={styles.typingIndicator}>
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
          typing...
        </div>
      )}

      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={styles.attachButton}
          title="Attach file"
        >
          📎
        </button>

        {selectedFile && (
          <div style={styles.selectedFileContainer}>
            <span style={styles.selectedFile}>{selectedFile.name}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              style={styles.removeFileButton}
            >
              ✕
            </button>
          </div>
        )}

        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          style={styles.input}
          disabled={!isConnected}
        />

        <button
          type="submit"
          style={{
            ...styles.sendButton,
            opacity: isConnected ? 1 : 0.5,
            cursor: isConnected ? "pointer" : "not-allowed",
          }}
          disabled={!isConnected}
        >
          Send
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#FAFAFA",
    overflow: "hidden",
  },
  infoBar: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #0D1164 0%, #211832 100%)",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  infoIcon: {
    fontSize: "20px",
  },
  infoText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  infoLabel: {
    fontSize: "9px",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "11px",
    color: "white",
    fontWeight: "700",
  },
  divider: {
    width: "1px",
    height: "40px",
    background: "rgba(255, 255, 255, 0.2)",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    fontSize: "14px",
    backgroundColor: "#FAFAFA",
  },
  loading: {
    textAlign: "center",
    color: "#9CA3AF",
    padding: "20px",
  },
  emptyState: {
    textAlign: "center",
    color: "#6B7280",
    padding: "40px 20px",
    fontSize: "14px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px 15px",
    borderRadius: "12px",
    wordWrap: "break-word",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
  },
  senderName: {
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "5px",
    opacity: 0.9,
  },
  timestamp: {
    fontSize: "9px",
    marginTop: "1px",
    opacity: 0.6,
  },
  image: {
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: "8px",
    marginBottom: "8px",
    objectFit: "cover",
  },
  fileLink: {
    color: "#6366F1",
    textDecoration: "underline",
    display: "block",
    marginBottom: "5px",
    fontWeight: "500",
  },
  typingIndicator: {
    padding: "10px 15px",
    fontSize: "13px",
    fontStyle: "italic",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    borderTop: "1px solid #E5E7EB",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #E5E7EB",
    alignItems: "center",
    backgroundColor: "white",
  },
  attachButton: {
    padding: "8px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "18px",
    color: "#6B7280",
    transition: "all 0.2s ease",
  },
  selectedFileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    backgroundColor: "#EEF2FF",
    borderRadius: "6px",
    fontSize: "12px",
    border: "1px solid #C7D2FE",
  },
  selectedFile: {
    color: "#6366F1",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontWeight: "500",
  },
  removeFileButton: {
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
    fontWeight: "bold",
    transition: "color 0.2s ease",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    border: "1px solid #E5E7EB",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "white",
    color: "black",
    transition: "border-color 0.2s ease",
  },
  sendButton: {
    padding: "10px 20px",
    background: "linear-gradient(135deg, #0D1164 0%, #211832 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)",
  },
};

// Add CSS for fadeIn animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(
  `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,
  styleSheet.cssRules.length
);

export default WorkspaceChat;
export { chatApi };
