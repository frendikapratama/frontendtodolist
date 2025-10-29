import api from "../api/axios";

export async function addSubTask(taskId, data) {
  const res = await api.post(`subTask/${taskId}`, data);
  return res.data.data;
}

export async function updateSubTask(subtaskId, data) {
  const res = await api.put(`subTask/${subtaskId}`, data);
  return res.data.data;
}

export async function positionSubTask(taskId, data) {
  const res = await api.patch(`subTask/${taskId}`, data);
  return res.data.data;
}
