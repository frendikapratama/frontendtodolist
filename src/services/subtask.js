import api from "../api/axios";

export async function addSubTask(taskId, data) {
  const res = await api.post(`subTask/${taskId}`, data);
  return res.data.data;
}
