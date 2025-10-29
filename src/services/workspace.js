import api from "../api/axios";

export async function getWorkspaces(data) {
  const res = await api.get("workspaces", data);
  return res.data.data;
}

export async function createWorkspace(data) {
  const res = await api.post(`workspaces`, data);
  return res.data;
}

export async function getWorkspaceById(id) {
  const res = await api.get(`workspaces/${id}`);
  return res.data.data;
}
