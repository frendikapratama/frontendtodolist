import api from "../api/axios";

export async function getCostsByProject(projectId, params = {}) {
  const res = await api.get(`costs/project/${projectId}`, { params });
  return res.data;
}

export async function getCostById(id) {
  const res = await api.get(`costs/${id}`);
  return res.data.data;
}

export async function createCost(data) {
  const res = await api.post(`costs`, data);
  return res.data;
}

export async function updateCost(id, data) {
  const res = await api.put(`costs/${id}`, data);
  return res.data;
}

export async function updateCostStatus(id, data) {
  const res = await api.patch(`costs/${id}/status`, data);
  return res.data;
}

export async function deleteCost(id) {
  const res = await api.delete(`costs/${id}`);
  return res.data;
}
