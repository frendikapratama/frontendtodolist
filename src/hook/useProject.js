import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "../services/project";
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

  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, data }) => updateProject(projectId, data),
    onMutate: async ({ projectId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });

      // Snapshot previous value
      const previousProject = queryClient.getQueryData(["project", projectId]);

      // Optimistically update with only the name change
      if (previousProject) {
        queryClient.setQueryData(["project", projectId], (old) => ({
          ...old,
          nama: data.nama,
        }));
      }

      return { previousProject };
    },
    onSuccess: (updatedProject, variables) => {
      toast.success("Project Updated Successfully");

      // Update cache dengan merge data lama dan baru
      queryClient.setQueryData(["project", variables.projectId], (oldData) => {
        if (!oldData) return updatedProject;

        // Merge: keep groups from old data if not in new data
        return {
          ...oldData,
          ...updatedProject,
          groups: updatedProject.groups || oldData.groups || [],
        };
      });

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["workspace-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProject) {
        queryClient.setQueryData(
          ["project", variables.projectId],
          context.previousProject
        );
      }

      const res = error.response?.data;
      if (Array.isArray(res?.error)) {
        res.error.forEach((msg) => toast.error(msg));
        return;
      }
      if (res?.message) {
        toast.error(res.message);
        return;
      }
      toast.error("Failed to update project");
    },
  });

  return { projectDetail, deleteProjectMutation, updateProjectMutation };
};
