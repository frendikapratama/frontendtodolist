import { useQuery } from "@tanstack/react-query";
import {
  getProgressByGroup,
  getProgressbyKuarter,
  getProgressbyProject,
  getProgressbyWorkspace,
  getProgressbyKuarterAll
} from "../services/progress";

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

export const useWorkspaceStats = (workspaceId) => {
  const workspaceStats = useQuery({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: () => getProgressbyWorkspace(workspaceId),
    enabled: !!workspaceId,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  return {
    workspaceStats,
  };
};
export const useKuarterStats = (kuarterId) => {
  const kuarterStats = useQuery({
    queryKey: ["kuarter-stats", kuarterId],
    queryFn: () => getProgressbyKuarter(kuarterId),
    enabled: !!kuarterId,
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  return {
    kuarterStats,
  };
};
export const useKuarterAll = () => {
  const kuarterStats = useQuery({
    queryKey: ["kuarter-all"],
    queryFn: () => getProgressbyKuarterAll(),
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  return {
    kuarterStats,
  };
};
