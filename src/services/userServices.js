import api from "../api/axios";


export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.search) params.append("search", filters.search);
  if (filters.isSystemAdmin !== undefined && filters.isSystemAdmin !== "all") {
    params.append("isSystemAdmin", filters.isSystemAdmin);
  }
  if (filters.departemen && filters.departemen !== "all") {
    params.append("departemen", filters.departemen);
  }
  if (filters.divisi && filters.divisi !== "all") {
    params.append("divisi", filters.divisi);
  }
  if (filters.posisi && filters.posisi !== "all") {
    params.append("posisi", filters.posisi);
  }

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  // Check if there is a file in the data, in which case we might need multipart,
  // but typically updating from admin is JSON unless uploading a photo.
  // The backend controller allowedFields has photo handled if req.file is present.
  const config = userData instanceof FormData 
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  const response = await api.put(`/users/${id}`, userData, config);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const addUserToWorkspace = async (userId, workspaceId, role) => {
  const response = await api.post(`/users/${userId}/workspaces`, { workspaceId, role });
  return response.data;
};

export const removeUserFromWorkspace = async (userId, workspaceId) => {
  const response = await api.delete(`/users/${userId}/workspaces/${workspaceId}`);
  return response.data;
};

export const updateUserWorkspaceRole = async (userId, workspaceId, role) => {
  const response = await api.put(`/users/${userId}/workspaces/${workspaceId}/role`, { role });
  return response.data;
};
