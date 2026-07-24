import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { addGroupToProject, updategroup, deleteGroup, getGroupsByKuarter, updateGroupPositions } from "../services/group";
import toast from "react-hot-toast";
export const useGroup = () => {
  const queryClient = useQueryClient();

  const addGroupMutation = useMutation({
    mutationFn: ({ projectId, data }) => addGroupToProject(projectId, data),
    onSuccess: () => {
      toast.success("Group added successfully");
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Failed to add project");
      }
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data, hideToast }) => updategroup(groupId, data),
    onSuccess: (data, variables) => {
      if (!variables.hideToast) {
        toast.success("Group updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to update group");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId) => deleteGroup(groupId),
    onSuccess: (groupId) => {
      toast.success("Delete group successfully");
      queryClient.invalidateQueries({ queryKey: ["project"] });
      queryClient.invalidateQueries({ queryKey: ["project"], groupId });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Failed to delete group ");
      }
    },
  });

  const updateGroupPositionsMutation = useMutation({
    mutationFn: ({ projectId, groupIds }) => updateGroupPositions(projectId, groupIds),
    onSuccess: () => {
      toast.success("Group position updated successfully");
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: () => {
      toast.error("Failed to update group positions");
    },
  });

  return {
    addGroupMutation,
    updateGroupMutation,
    deleteMutation,
    updateGroupPositionsMutation,
  };
};

export const useGroupsByKuarter = (kuarterId) => {
  const groupsQuery = useQuery({
    queryKey: ["groups-kuarter", kuarterId],
    queryFn: () => getGroupsByKuarter(kuarterId),
    enabled: !!kuarterId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return groupsQuery;
};
