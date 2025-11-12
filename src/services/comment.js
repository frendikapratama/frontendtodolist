import api from "../api/axios";

export async function getComment(taskId) {
  const res = await api.get(`/comment/${taskId}`);
  return res.data.data;
}

export async function createComment(taskId, data) {
  const res = await api.post(`/comment/${taskId}`, data);
  return res.data.data;
}

export async function replyComment(taskId, commentId, data) {
  const res = await api.post(`/comment/${taskId}/reply/${commentId}`, data);
  return res.data.data;
}
