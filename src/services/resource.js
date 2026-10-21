import api from "../api/axios";

export async function getResources(params = {}) {
  const response = await api.get("resources", { params });
  return response.data.data;
}

export async function getResource(id) {
  const response = await api.get(`resources/${id}`);
  return response.data.data;
}

export async function createResource(data) {
  const response = await api.post("resources", data);
  return response.data;
}

export async function updateResource(id, data) {
  const response = await api.put(`resources/${id}`, data);
  return response.data;
}

export async function deleteResource(id) {
  const response = await api.delete(`resources/${id}`);
  return response.data;
}

// Planning related functions (retain existing implementations)
export async function getResourcePlanning(projectId) {
  const response = await api.get(`resources/planning/project/${projectId}`);
  return response.data;
}

export async function createResourcePlanning(projectId, data) {
  const response = await api.post(`resources/planning/project/${projectId}`, data);
  return response.data;
}

export async function updateResourcePlanning(projectId, planId, data) {
  const response = await api.put(`resources/planning/project/${projectId}/${planId}`, data);
  return response.data;
}

export async function deleteResourcePlanning(projectId, planId) {
  const response = await api.delete(`resources/planning/project/${projectId}/${planId}`);
  return response.data;
}
