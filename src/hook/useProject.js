import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { deleteProject, getProjectById } from "../services/project";
import toast from "react-hot-toast";

export const useProject = () => {
  const queryClient = useQueryClient();
  const projectDetail = (id) => {
    return useQuery({
      queryKey: ["project", id],
      queryFn: () => getProjectById(id),
      enabled: !!id,
    });
  };

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: (_, variables) => {
      toast.success("The project was successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables] });
    },
    onError: (error) => {
      const res = error.response?.data;
      if (Array.isArray(res?.error)) {
        res.error.forEach((msg) => toast.error(msg));
        return;
      }
      if (res?.message) {
        toast.error(res.message);
        return;
      }
      toast.error("Failed to delete project");
    },
  });
  return { projectDetail, deleteProjectMutation };
};
