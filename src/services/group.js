import api from "../api/axios";

export async function addGroupToProject(projectId, data) {
  const res = await api.post(`group/${projectId}`, data);
  return res.data.data;
}

export async function updategroup(groupId, data) {
  const res = await api.put(`group/${groupId}`, data);
  return res.data.data;
}

export async function updateGroupPositions(projectId, groupIds) {
  const res = await api.put(`group/${projectId}/positions`, { groupIds });
  return res.data;
}

export async function deleteGroup(groupId) {
  const res = await api.delete(`group/${groupId}`);
  return res.data.data;
}

export async function getGroupsByKuarter(kuarterId) {
  if (!kuarterId) return [];
  const res = await api.get(`group/kuarter/${kuarterId}`);
  return res.data.data || [];
}
