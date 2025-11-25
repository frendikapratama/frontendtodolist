import { useQuery } from "@tanstack/react-query";
import { getLogsByGroup, getLogsById } from "../services/logs";

export const useLog = (groupId) => {
    const logsByGroup = useQuery({
        queryKey: ["logs", groupId, "activity"],
        queryFn: () => getLogsByGroup(groupId),
        enabled: !!groupId,
        retry: 2,
    });

    return { logsByGroup };
};
export const useLogId = (userId) => {
    const logsById = useQuery({
        queryKey: ["logsId", userId, "activityId"],
        queryFn: () => getLogsById(userId),
        enabled: !!userId,
        retry: 2,
    });

    return { logsById };
};
