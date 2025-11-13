import api from "../api/axios";

export async function addGroupToProject(projectId, data) {
  const res = await api.post(`group/${projectId}`, data);
  return res.data.data;
}

export async function updategroup(groupId, data) {
  const res = await api.put(`group/${groupId}`, data);
  return res.data.data;
}

export async function deleteGroup(groupId) {
  const res = await api.delete(`group/${groupId}`);
  return res.data.data;
}
