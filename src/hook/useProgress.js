// ========== hook/ ==========
import { useQuery } from "@tanstack/react-query";
import { getProgressByGroup, getProgressbyProject } from "../services/progress";

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

export const useProgressProject = (projectId) => {
  const progressByProject = useQuery({
    queryKey: ["task", projectId, "progress"],
    queryFn: () => getProgressbyProject(projectId),
    enabled: !!projectId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  return {
    progressByProject,
  };
};
