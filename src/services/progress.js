import api from "../api/axios";

export async function getProgressByGroup(groupId) {
  const res = await api.get(`progress/group/${groupId}`);
  return res.data.data;
}
export async function getProgressbyProject(projectId) {
  const res = await api.get(`progress/project/${projectId}`);
  return res.data;
}
export async function getProgressbyWorkspace(workspaceId) {
  const res = await api.get(`progress/workspace/${workspaceId}`);
  return res.data.data;
}
