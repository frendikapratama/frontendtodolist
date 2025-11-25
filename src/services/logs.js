// services/log.service.js
import api from "../api/axios";

export async function getLogsByGroup(groupId) {
    if (!groupId) return { logs: [] };
    const res = await api.get(`activity/group/${groupId}`, {
        withCredentials: true
    });
    return res.data;
}
export async function getLogsById(userId) {
    if (!userId) return { logs: [] };
    const res = await api.get(`activity/user/${userId}`, {
        withCredentials: true
    });
    return res.data;
}
