import api from "../../api/axios";

export async function getFacilities(page = 1, limit = 25, search = "") {
  const res = await api.get(
    `/facilities?page=${page}&limit=${limit}&search=${search}`,
  );
  return {
    data: res.data.data,
    pagination: res.data.pagination,
  };
}

export async function createFacilities(data) {
  const res = await api.post("/facilities", data);
  return res.data.data;
}

export async function updateFacilities(id, data) {
  const res = await api.put(`/facilities/${id}`, data);
  return res.data.data;
}

export async function deleteFacilities(id, data) {
  const res = await api.delete(`/facilities/${id}`, data);
  return res.data.data;
}
