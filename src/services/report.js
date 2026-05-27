import api from "../api/axios";

export async function getReports(filters = {}) {
  const params = new URLSearchParams();

  if (filters.workspaceId) params.append("workspaceId", filters.workspaceId);
  if (filters.projectId) params.append("projectId", filters.projectId);
  if (filters.groupId) params.append("groupId", filters.groupId);
  if (filters.status && filters.status !== "all") params.append("status", filters.status);
  if (filters.priority && filters.priority !== "all") params.append("priority", filters.priority);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.search && filters.search.trim() !== "") params.append("search", filters.search.trim());
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);
  if (filters.export) params.append("export", filters.export);

  const res = await api.get(`/reports/tasks?${params.toString()}`);
  return res.data;
}
