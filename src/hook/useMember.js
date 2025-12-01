import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getMembersProject,
  getMembersWorkspace,
  inviteMember,
} from "../services/member";

export const useMember = (type, id) => {
  const queryClient = useQueryClient();
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

  const inviteMemberMutation = useMutation({
    mutationFn: ({ workspaceId, data }) => inviteMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["members-workspace", id]);
    },
  });

  return {
    membersProjectQuery,
    membersWorkspaceQuery,
    inviteMemberMutation,
  };
};
