// ========== hook/ ==========
import { useQuery } from "@tanstack/react-query";
import { getProgressByGroup } from "../services/progress";

export const useProgress = (groupId) => {
  const progressByGroup = useQuery({
    queryKey: ["task", groupId, "progress"],
    queryFn: () => getProgressByGroup(groupId),
    enabled: !!groupId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    progressByGroup,
  };
};
