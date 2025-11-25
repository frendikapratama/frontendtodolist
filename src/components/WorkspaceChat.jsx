import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../api/axios";

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
        // Cek apakah pesan sudah ada berdasarkan _id
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) {
          return prev; // Jangan tambahkan jika sudah ada
        }
        return [...prev, message];
      });
    });

    newSocket.on("user:joined", (data) => {
      console.log(`${data.username} joined`);
    });

    newSocket.on("user:left", (data) => {
      console.log(`${data.username} left`);
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
      <div style={styles.header}>
        <h3 style={styles.title}>Workspace Chat</h3>
        {/* <span style={isConnected ? styles.statusOnline : styles.statusOffline}>
          {isConnected ? "● Online" : "● Offline"}
        </span> */}
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
                  msg.sender._id === currentUser._id ? "#007bff" : "#f1f1f1",
                color: msg.sender._id === currentUser._id ? "white" : "black",
              }}
            >
              {msg.sender._id !== currentUser._id && (
                <div style={styles.senderName}>{msg.sender.username}</div>
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
    height: "600px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px 8px 0 0",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
  },
  statusOnline: {
    color: "#28a745",
    fontSize: "14px",
    fontWeight: 500,
  },
  statusOffline: {
    color: "#dc3545",
    fontSize: "14px",
    fontWeight: 500,
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#fafafa",
  },
  loading: {
    textAlign: "center",
    color: "#666",
    padding: "20px",
  },
  emptyState: {
    textAlign: "center",
    color: "#999",
    padding: "40px 20px",
    fontSize: "14px",
  },
  message: {
    maxWidth: "70%",
    padding: "10px 15px",
    borderRadius: "12px",
    wordWrap: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  senderName: {
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "5px",
    opacity: 0.8,
  },
  timestamp: {
    fontSize: "11px",
    marginTop: "5px",
    opacity: 0.7,
  },
  image: {
    maxWidth: "100%",
    maxHeight: "300px",
    borderRadius: "8px",
    marginBottom: "8px",
    objectFit: "cover",
  },
  fileLink: {
    color: "inherit",
    textDecoration: "underline",
    display: "block",
    marginBottom: "5px",
  },
  typingIndicator: {
    padding: "10px 15px",
    fontSize: "13px",
    fontStyle: "italic",
    color: "#666",
    backgroundColor: "#f9f9f9",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #ddd",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "0 0 8px 8px",
  },
  attachButton: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "18px",
    transition: "background-color 0.2s",
  },
  selectedFileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    fontSize: "12px",
  },
  selectedFile: {
    color: "#495057",
    maxWidth: "150px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  removeFileButton: {
    background: "none",
    border: "none",
    color: "#dc3545",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0 4px",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    outline: "none",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "background-color 0.2s",
  },
};

export default WorkspaceChat;
export { chatApi };
