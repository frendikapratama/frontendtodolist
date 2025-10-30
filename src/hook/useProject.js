import { useQuery } from "@tanstack/react-query";
import { getProjectById } from "../services/project";

export const useProject = () => {
  const projectDetail = (id) => {
    return useQuery({
      queryKey: ["project", id],
      queryFn: () => getProjectById(id),
      enabled: !!id,
    });
  };

  return { projectDetail };
};
