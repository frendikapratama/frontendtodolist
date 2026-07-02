import api from "../../api/axios";

export async function mySchedule(page = 1, limit = 25, search = "") {
  const res = await api.get(
    `/schedule/my-schedule?page=${page}&limit=${limit}&search=${search}`,
  );
  return res.data.data;
}
