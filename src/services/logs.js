// services/log.service.js
import api from "../api/axios";

export async function getLogsByGroup(groupId) {
    if (!groupId) return { logs: [] };
    try {
        const res = await api.get(`activity/all`, {
            withCredentials: true
        });
        // Filter logs by groupId
        const allLogs = res.data.logs || [];
        const filteredLogs = allLogs.filter(log => log.group === groupId);
        return { logs: filteredLogs };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { logs: [] };
    }
}
export async function getLogsById(userId) {
    if (!userId) return { logs: [] };
    try {
        const res = await api.get(`activity/all`, {
            withCredentials: true
        });
        // Filter logs by userId
        const allLogs = res.data.logs || [];
        const filteredLogs = allLogs.filter(log => log.user._id === userId);
        return { logs: filteredLogs };
    } catch (error) {
        console.error('Error fetching logs:', error);
        return { logs: [] };
    }
}

export async function getAllLogs() {
    try {
        const res = await api.get(`activity/all`, {
            withCredentials: true
        });
        return res.data.logs || [];
    } catch (error) {
        console.error('Error fetching all logs:', error);
        return [];
    }
}
export async function getLogsByKuarter(kuarterId) {
    try {
        const res = await api.get(`activity/kuarter/${kuarterId}`, {
            withCredentials: true
        });
        return res.data.logs || [];
    } catch (error) {
        console.error('Error fetching logs by kuarter:', error);
        return [];
    }
}
