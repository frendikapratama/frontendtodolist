import api from "../api/axios";

export async function getWorkspaces() {
  const res = await api.get("workspaces");
  return res.data.data;
}

export async function createWorkspace(kuarterId, data) {
  const res = await api.post(`workspaces/${kuarterId}`, data);
  return res.data;
}

export async function getWorkspaceById(id) {
  const res = await api.get(`workspaces/${id}`);
  return res.data.data;
}
export async function updateWorkspace(id, data) {
  const res = await api.put(`workspaces/${id}`, data);
  return res.data.data;
}

export async function deleteWorkspace(id) {
  const res = await api.delete(`workspaces/${id}`);
  return res.data.data;
}
export async function getProgressBarWorkspace(id) {
  const res = await api.get(`workspaces/${id}`);
  return res.data.data;
}
