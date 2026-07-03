import api from "../../api/axios";

export async function mySchedule(page = 1, limit = 6, search = "") {
  const res = await api.get(
    `/schedule/my-schedule?page=${page}&limit=${limit}&search=${search}`,
  );
  return {
    schedule: res.data.data,
    pagination: res.data.pagination,
  };
}
