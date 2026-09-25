import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  createProject,
  deleteProject,
  getProjectById,
  updateProject,
  getAllProjects,
} from "../services/project";
import toast from "react-hot-toast";
import { useState } from "react";
export const useProject = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [sites, setSites] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);

  const [limit] = useState(25); // dulu: const [limit, setLimit] = useState(10);
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: [
      "projects",
      search,
      status,
      projectManager,
      sites,
      divisionId,
      page,
      limit,
    ],
    queryFn: () =>
      getAllProjects({
        search,
        status,
        projectManager,
        sites,
        divisionId,
        page,
        limit,
      }),
  });

  const projectDetail = (id) => {
    return useQuery({
      queryKey: ["project", id],
      queryFn: () => getProjectById(id),
      enabled: !!id,
    });
  };

  const createProjectMutation = useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: () => {
      toast.success("Project berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
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
      toast.error("Failed to create project");
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: (_, variables) => {
      toast.success("The project was successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
      await queryClient.cancelQueries({ queryKey: ["project", projectId] });
      const previousProject = queryClient.getQueryData(["project", projectId]);

      if (previousProject) {
        queryClient.setQueryData(["project", projectId], (old) => ({
          ...old,
          ...data,
        }));
      }

      return { previousProject };
    },
    onSuccess: (updatedProject, variables) => {
      toast.success("Project Updated Successfully");
      queryClient.setQueryData(["project", variables.projectId], (oldData) => {
        if (!oldData) return updatedProject;
        return {
          ...oldData,
          ...updatedProject,
          groups: updatedProject.groups || oldData.groups || [],
        };
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          ["project", variables.projectId],
          context.previousProject,
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

  return {
    projectDetail,
    createProjectMutation,
    deleteProjectMutation,
    updateProjectMutation,
    projectQuery,
    search,
    setSearch,
    status,
    setStatus,
    projectManager,
    setProjectManager,
    sites,
    setSites,
    divisionId,
    setDivisionId,
    page,
    setPage,
    limit,
    // setLimit,
  };
};
