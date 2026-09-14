import api from "../api/axios";

export async function getParty(data) {
  const response = await api.get(`/party`, { data });
  return response.data.data;
}

export async function createParty(data) {
  const response = await api.post(`/party`, data);
  return response.data.data;
}

export async function updateParty(id, data) {
  const response = await api.put(`/party/${id}`, data);
  return response.data.data;
}

export async function deleteParty(id) {
  const response = await api.delete(`/party/${id}`);
  return response.data.data;
}
