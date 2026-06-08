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

export async function deleteComment(id) {
  const res = await api.delete(`/comment/${id}`);
  return res.data.data;
}

export async function editComment(commentId, data) {
  const res = await api.put(`/comment/${commentId}`, data);
  return res.data.data;
}

// Subtask comment endpoints
export async function getCommentSubtask(subtaskId) {
  const res = await api.get(`/subtask-comment/${subtaskId}`);
  return res.data.data;
}

export async function createCommentSubtask(subtaskId, data) {
  const res = await api.post(`/subtask-comment/${subtaskId}`, data);
  return res.data.data;
}

export async function replyCommentSubtask(subtaskId, commentId, data) {
  const res = await api.post(
    `/subtask-comment/${subtaskId}/reply/${commentId}`,
    data
  );
  return res.data.data;
}

export async function deleteCommentSubtask(id) {
  const res = await api.delete(`/subtask-comment/${id}`);
  return res.data.data;
}

export async function editCommentSubtask(commentId, data) {
  const res = await api.put(`/subtask-comment/${commentId}`, data);
  return res.data.data;
}

