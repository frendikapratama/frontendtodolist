import api from "../api/axios";

export async function getMembersWorkspace(id) {
  const res = await api.get(`members/workspace/${id}`);
  return res.data.data;
}

export async function getMembersProject(id) {
  const res = await api.get(`members/project/${id}`);
  return res.data.data;
}
