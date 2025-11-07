import api from "../api/axios";

export async function sendCollaborationRequest(data) {
  const res = await api.post("/collaboration/send", data);
  return res.data;
}

export async function getCollaborationRequests(workspaceId, type, status) {
  const params = new URLSearchParams();
  params.append("workspaceId", workspaceId);
  params.append("type", type);
  if (status) params.append("status", status);

  const res = await api.get(`/collaboration?${params.toString()}`);
  return res.data.data;
}

export async function approveCollaboration(requestId) {
  const res = await api.put(`/collaboration/${requestId}/approve`);
  return res.data;
}

export async function rejectCollaboration(requestId) {
  const res = await api.put(`/collaboration/${requestId}/reject`);
  return res.data;
}

export async function getWorkspaceProjects(workspaceId) {
  const res = await api.get(`/collaboration/workspace/${workspaceId}/projects`);
  return res.data.data;
}
