import api from "../api/axios";

export async function getAttachment(taskId) {
  const res = await api.get(`/attachment/${taskId}`);
  return res.data.data;
}

export async function createAttachment(taskId, formData) {
  const res = await api.post(`/attachment/${taskId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

export async function deleteAttachment(taskId, attachmentId) {
  const res = await api.delete(`/attachment/${taskId}/delete/${attachmentId}`);
  return res.data.data;
}
