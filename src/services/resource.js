import api from "../api/axios";

export const getResources = async (params = {}) => (await api.get("resources", { params })).data.data;
export const getResource = async (id) => (await api.get(`resources/${id}`)).data.data;
export const createResource = async (data) => (await api.post("resources", data)).data;
export const updateResource = async (id, data) => (await api.put(`resources/${id}`, data)).data;
export const deleteResource = async (id) => (await api.delete(`resources/${id}`)).data;
export const getResourcePlanning = async (projectId) => (await api.get(`resources/planning/project/${projectId}`)).data;
export const createResourcePlanning = async (projectId, data) => (await api.post(`resources/planning/project/${projectId}`, data)).data;
export const updateResourcePlanning = async (projectId, planId, data) => (await api.put(`resources/planning/project/${projectId}/${planId}`, data)).data;
export const deleteResourcePlanning = async (projectId, planId) => (await api.delete(`resources/planning/project/${projectId}/${planId}`)).data;
