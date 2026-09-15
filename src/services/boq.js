import api from "../api/axios";

/**
 * Get all BOQ items, sections, pagination, and totals for a project
 */
export async function getBOQByProject(projectId, params = {}) {
  const res = await api.get(`boq/project/${projectId}`, { params });
  return res.data.data;
}

/**
 * Get distinct list of sections for a project
 */
export async function getBOQSections(projectId) {
  const res = await api.get(`boq/project/${projectId}/sections`);
  return res.data.data;
}

/**
 * Get single BOQ item by id
 */
export async function getBOQItemById(itemId) {
  const res = await api.get(`boq/${itemId}`);
  return res.data.data;
}

/**
 * Create a new BOQ item for a project
 */
export async function createBOQItem(projectId, data) {
  const res = await api.post(`boq/project/${projectId}`, data);
  return res.data;
}

/**
 * Update an existing BOQ item
 */
export async function updateBOQItem(itemId, data) {
  const res = await api.put(`boq/${itemId}`, data);
  return res.data;
}

/**
 * Update BOQ item status
 */
export async function updateBOQStatus(itemId, status) {
  const res = await api.patch(`boq/${itemId}/status`, { status });
  return res.data;
}

/**
 * Delete a BOQ item
 */
export async function deleteBOQItem(itemId) {
  const res = await api.delete(`boq/${itemId}`);
  return res.data;
}
