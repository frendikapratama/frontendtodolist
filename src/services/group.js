import api from "../api/axios";

export async function addGroupToProject(projectId, data) {
  const res = await api.post(`group/${projectId}`, data);
  return res.data.data;
}
