import api from "../api/axios";

export async function getGanByProject(projectId) {
  const res = await api.get(`ganchart/project/${projectId}`);
  return res.data;
}
