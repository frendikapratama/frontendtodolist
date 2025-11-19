import api from "../api/axios";

export async function getDataGanttChartProject(projectId) {
    const res = await api.get(`ganchart/project/${projectId}`);
    return res.data.data;
}