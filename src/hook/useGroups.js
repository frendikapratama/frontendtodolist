import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addGroupToProject } from "../services/group";
import toast from "react-hot-toast";
export const useGroup = () => {
  const queryClient = useQueryClient();
  const addGroupMutation = useMutation({
    mutationFn: ({ projectId, data }) => addGroupToProject(projectId, data),
    onSuccess: () => {
      toast.success("berhasil membuat group");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  return {
    addGroupMutation,
  };
};
