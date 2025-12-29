import api from "../api/axios";

export async function getKuarter(params = {}) {
  const res = await api.get("kuarter", { params });
  return res.data.data;
}

export async function createKuarter(data) {
  const res = await api.post("kuarter", data);
  return res.data.data;
}

export async function updateKuarter(kuarterId, data) {
  const res = await api.put(`kuarter/${kuarterId}`, data);
  return res.data.data;
}

export async function deleteKuarter(kuarterId, data) {
  const res = await api.delete(`kuarter/${kuarterId}`, data);
  return res.data.data;
}

export async function getKuarterById(id) {
  const res = await api.get(`kuarter/${id}`);
  return res.data.data;
}
