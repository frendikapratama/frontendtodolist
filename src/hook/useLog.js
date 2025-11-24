import { useQuery } from "@tanstack/react-query";
import { getLogsByGroup } from "../services/logs";

export const useLog = (groupId) => {
    const logsByGroup = useQuery({
        queryKey: ["logs", groupId, "activity"],
        queryFn: () => getLogsByGroup(groupId),
        enabled: !!groupId,
        retry: 2,
    });

    return { logsByGroup };
};
