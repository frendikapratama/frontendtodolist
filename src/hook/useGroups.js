import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGroupToProject, updategroup } from "../services/group";
import toast from "react-hot-toast";
export const useGroup = () => {
  const queryClient = useQueryClient();

  const addGroupMutation = useMutation({
    mutationFn: ({ projectId, data }) => addGroupToProject(projectId, data),
    onSuccess: () => {
      toast.success("berhasil membuat group");
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah project");
      }
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data }) => updategroup(groupId, data),
    onSuccess: () => {
      toast.success("Group berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Gagal mengupdate Group");
      }
    },
  });

  return {
    addGroupMutation,
    updateGroupMutation,
  };
};
