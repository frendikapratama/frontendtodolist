import api from "../api/axios";

export async function getDivision(data) {
  const response = await api.get(`/divisions`, { data });
  return response.data.data;
}
