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
export async function deleteSubTask(subtaskId) {
  const res = await api.delete(`subTask/${subtaskId}`);
  return res.data;
}

export async function getSubtaskByTask(taskId) {
  const res = await api.get(`subTask/ByTask?task=${taskId}`);
  return res.data.data;
}

export async function assignPicSubtask(subtaskId, picEmail) {
  const res = await api.put(`subTask/${subtaskId}`, { picEmail });
  return res.data.data;
}

export async function removePicSubtask(subtaskId, userId) {
  const res = await api.delete(`subTask/${subtaskId}/pic`, {
    data: { userId },
  });
  return res.data.data;
}
