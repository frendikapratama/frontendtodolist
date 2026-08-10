// import { io } from "socket.io-client";

// let socket = null;

// export const initSocket = (token) => {
//     socket = io(import.meta.env.VITE_API_URL, {
//         auth: { token }
//     });
//     socket.on("onlineUsers", (users) => {
//         console.log("ONLINE USERS RECEIVED:", users);
//         setOnlineUserId(users);
//     });
//     return socket;
// };

// export const getSocket = () => socket;

// src/config/socket.js
// import { io } from "socket.io-client";

// let socket = null;

// export const initSocket = (token) => {
//     const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
//     socket = io(SOCKET_URL, {
//         auth: { token },
//         withCredentials: true,
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionDelay: 1000,
//         reconnectionAttempts: 5
//     });
//     socket.on('connect', () => {
//         console.log('Socket connected:', socket.id);
//     });
//     socket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error.message);
//     });
//     socket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//     });
//     return socket;
// };

// export const getSocket = () => socket;
// src/config/socket.js
import { io } from "socket.io-client";

let socket = null;

export const initSocket = (token) => {
  const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;

  // kalau sudah ada socket aktif, disconnect dulu sebelum bikin baru
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: token ? { token } : {}, // guest -> kirim auth kosong, bukan token: null
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  socket.on("connect", () => {
    console.log(
      "Socket connected:",
      socket.id,
      token ? "(authenticated)" : "(guest)",
    );
  });
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });
  return socket;
};

export const getSocket = () => socket;
