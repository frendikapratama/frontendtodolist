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
