import api from "../api/axios";

// export async function getByGroup(groupId) {
//   const res = await api.get(`task/ByGroup?groups=${groupId}`);
//   return res.data.data;
// }

// export async function getByGroup(groupId, searchQuery = "") {
//   const params = new URLSearchParams({ groups: groupId });

//   if (searchQuery && searchQuery.trim() !== "") {
//     params.append("search", searchQuery.trim());
//   }

//   const res = await api.get(`/task/ByGroup?${params.toString()}`);
//   return res.data.data;
// }

export async function getByGroup(groupId, filters = {}) {
  const params = new URLSearchParams({ groups: groupId });

  // Add all filters to params
  if (filters.search && filters.search.trim() !== "") {
    params.append("search", filters.search.trim());
  }

  if (filters.status && filters.status !== "all") {
    params.append("status", filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    params.append("priority", filters.priority);
  }

  if (filters.note && filters.note !== "all") {
    params.append("note", filters.note);
  }

  if (filters.picEmail && filters.picEmail.trim() !== "") {
    params.append("picEmail", filters.picEmail.trim());
  }

  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }

  const res = await api.get(`/task/ByGroup?${params.toString()}`);
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

export const fetchMyWork = async () => {
  const res = await api.get(`task/my-work`);
  return res.data.data;
};
export const fetchMyWorkAgendaMeeting = async () => {
  const res = await api.get(`task/my-work-agenda-meeting`);
  return res.data.data;
};

// export async function myWork(taskId, token, userData = null) {
//   const res = await api.get(
//     `/task/${taskId}/accept-pic-invite?token=${token}`,
//     userData
//   );
//   return res.data;
// }
