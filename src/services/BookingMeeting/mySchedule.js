import api from "../../api/axios";

export async function mySchedule(page = 1, limit = 12, search = "") {
  const res = await api.get(
    `/schedule/my-schedule?page=${page}&limit=${limit}&search=${search}`,
  );
  return {
    schedule: res.data.data,
    pagination: res.data.pagination,
  };
}

export async function endMeeting(id, payload) {
  const { data } = await api.patch(`/meeting/${id}/end`, payload);
  return data;
}
