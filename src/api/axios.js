import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const api = axios.create({
  baseURL: `${API_URL}/api/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh') &&
      !originalRequest.url.includes('/login') 
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.get("/refresh");
        const token = res.data.accessToken;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        originalRequest.headers["Authorization"] = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        delete api.defaults.headers.common["Authorization"];
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { API_URL };
export { SOCKET_URL };
export default api;
