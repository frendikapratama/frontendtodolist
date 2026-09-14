import api from "../api/axios";

export async function getAllProjects(params) {
  const res = await api.get(`project`, { params });
  return res.data;
}

export async function createProject(data) {
  const res = await api.post(`project`, data);
  return res.data.data;
}

export async function addProjectToWorkspace(workspaceId, data) {
  const res = await api.post(`project/${workspaceId}`, data);
  return res.data;
}

export async function getProjectById(id) {
  const res = await api.get(`project/${id}`);
  return res.data.data;
}

export async function deleteProject(id) {
  const res = await api.delete(`project/${id}`);
  return res.data.data;
}

export async function updateProject(id, data) {
  const res = await api.put(`project/${id}`, data);
  return res.data.data;
}
