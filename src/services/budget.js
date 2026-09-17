import api from "../api/axios";

export async function getBudgetsByProject(projectId, params = {}) {
  const res = await api.get(`budgets/project/${projectId}`, { params });
  return res.data;
}

export async function getBudgetById(id) {
  const res = await api.get(`budgets/${id}`);
  return res.data.data;
}

export async function createBudget(data) {
  const res = await api.post(`budgets`, data);
  return res.data;
}

export async function updateBudget(id, data) {
  const res = await api.put(`budgets/${id}`, data);
  return res.data;
}

export async function updateBudgetStatus(id, data) {
  const res = await api.patch(`budgets/${id}/status`, data);
  return res.data;
}

export async function deleteBudget(id) {
  const res = await api.delete(`budgets/${id}`);
  return res.data;
}
