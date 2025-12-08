import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const api = axios.create({
  baseURL: `${API_URL}/api/`,
  headers: {
    "Content-Type": "application/json",
  },
});

//  interceptor supaya token selalu ikut
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export { API_URL };
export { SOCKET_URL };
export default api;
