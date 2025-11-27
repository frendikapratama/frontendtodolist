import { useQuery } from "@tanstack/react-query";
import { getLogsByGroup, getLogsById, getAllLogs, getLogsByKuarter } from "../services/logs";

export const useLog = (groupId) => {
    const logsByGroup = useQuery({
        queryKey: ["logs-group", groupId],
        queryFn: () => getLogsByGroup(groupId),
        enabled: !!groupId,
        retry: 2,
        staleTime: 30000,
    });

    return { logsByGroup };
};

export const useLogId = (userId) => {
    const logsById = useQuery({
        queryKey: ["logs-user", userId],
        queryFn: () => getLogsById(userId),
        enabled: !!userId,
        retry: 2,
        staleTime: 30000,
    });

    return { logsById };
};

export const useAllLogs = () => {
    const allLogs = useQuery({
        queryKey: ["logs-all"],
        queryFn: () => getAllLogs(),
        staleTime: 30000,
        retry: 2,
    });

    return { allLogs };
};
export const useKuarterLogs = (kuarterId) => {
    const kuarterLogs = useQuery({
        queryKey: ["logs-kuarter", kuarterId],
        queryFn: () => getLogsByKuarter(kuarterId),
        enabled: !!kuarterId,
        staleTime: 30000,
        retry: 2,
    });

    return { kuarterLogs };
};
