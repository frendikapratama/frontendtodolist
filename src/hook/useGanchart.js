import { useQuery } from "@tanstack/react-query";
import { getGanByProject } from "../services/ganchart";

export const useGanchart = (projectId) => {
  const ganchartByproject = useQuery({
    queryKey: ["ganchart", projectId],
    queryFn: () => getGanByProject(projectId),
    enabled: !!projectId,
  });

  return ganchartByproject;
};
