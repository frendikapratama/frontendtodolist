import api from "../api/axios";

export async function getMembersWorkspace(id) {
  const res = await api.get(`members/workspace/${id}`);
  return res.data.data;
}

export async function getMembersProject(id) {
  const res = await api.get(`members/project/${id}`);
  return res.data.data;
}

export async function inviteMember(workspaceId, data) {
  const res = await api.post(`workspaces/${workspaceId}/invite`, data);
  return res.data;
}
export async function removeMember(workspaceId, userId) {
  const res = await api.delete(`workspaces/${workspaceId}/members/${userId}`);
  return res.data;
}
