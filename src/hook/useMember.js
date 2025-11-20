import { useQuery } from "@tanstack/react-query";
import { getMembersProject, getMembersWorkspace } from "../services/member";

export const useMember = (type, id) => {
  const membersWorkspaceQuery = useQuery({
    queryKey: ["members-workspace", id],
    queryFn: () => getMembersWorkspace(id),
    enabled: !!id && type === "workspace",
  });

  const membersProjectQuery = useQuery({
    queryKey: ["members-project", id],
    queryFn: () => getMembersProject(id),
    enabled: !!id && type === "project",
  });

  return {
    membersProjectQuery,
    membersWorkspaceQuery,
  };
};
