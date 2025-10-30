import api from "../api/axios";

export async function getByGroup(groupId) {
  const res = await api.get(`task/ByGroup?groups=${groupId}`);
  return res.data.data;
}

export async function addTask(groupId, data) {
  const res = await api.post(`task/${groupId}`, data);
  return res.data.data;
}

export async function updateTask(taskId, data) {
  const res = await api.put(`task/${taskId}`, data);
  return res.data.data;
}

export const updateTaskPositions = async (taskIds) => {
  const res = await api.put(`/task/positions`, { taskIds });
  return res.data.data;
};
