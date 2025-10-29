import api from "../api/axios";

export async function addProjectToWorkspace(workspaceId, data) {
  const res = await api.post(`project/${workspaceId}`, data);
  return res.data;
}

export async function getProjectById(id) {
  const res = await api.get(`project/${id}`);
  return res.data.data;
}
