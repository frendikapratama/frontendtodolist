import api from "../api/axios";

export async function getByGroup(groupId) {
  const res = await api.get(`task/ByGroup?groups=${groupId}`);
  return res.data.data;
}
export async function getByProjectId(projectId) {
  const res = await api.get(`task/${projectId}`);
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
export async function deleteTask(taskId) {
  const res = await api.delete(`task/${taskId}`);
  return res.data;
}
export async function dialogTask(taskId, data) {
  const res = await api.put(`task/dialog/${taskId}`, data);
  return res.data.data;
}

export const updateTaskPositions = async (groupId, taskIds) => {
  const res = await api.put(`/task/positions/${groupId}`, { taskIds });
  return res.data.data;
};
export async function assignPic(taskId, picEmail) {
  const res = await api.put(`task/${taskId}`, { picEmail });
  return res.data;
}

export async function removePic(taskId, userId) {
  const res = await api.delete(`task/${taskId}/pic`, { data: { userId } });
  return res.data;
}

export async function acceptPicInvite(taskId, token, userData = null) {
  const res = await api.post(
    `/task/${taskId}/accept-pic-invite?token=${token}`,
    userData
  );
  return res.data;
}
