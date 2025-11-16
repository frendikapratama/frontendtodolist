import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
  deleteWorkspace,
  updateWorkspace,
} from "../services/workspace";
import toast from "react-hot-toast";
import { addProjectToWorkspace } from "../services/project";

export const useWorkspace = (kuarterId = null) => {
  const queryClient = useQueryClient();

  const initialFormData = {
    nama: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces(),
  });
  const createMutation = useMutation({
    mutationFn: ({ kuarterId, data }) => createWorkspace(kuarterId, data),
    onSuccess: (data, variables) => {
      toast.success("Workspace created successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (variables.kuarterId) {
        queryClient.invalidateQueries({
          queryKey: ["kuarter", variables.kuarterId],
        });
      }
      resetForm();
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah workspace");
      }
    },
  });

  const WorkspaceDetail = (id) => {
    return useQuery({
      queryKey: ["workspaces", id],
      queryFn: () => getWorkspaceById(id),
      enabled: !!id,
    });
  };

  const addProjectMutation = useMutation({
    mutationFn: ({ workspaceId, data }) =>
      addProjectToWorkspace(workspaceId, data),
    onSuccess: (data, variables) => {
      toast.success("Project berhasil ditambahkan");
      queryClient.invalidateQueries({
        queryKey: ["workspaces", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace-projects", variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
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

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({ id, data }) => updateWorkspace(id, data),
    onSuccess: (_, variables) => {
      toast.success("berhasil update workspace");
      queryClient.invalidateQueries({ queryKey: ["workspaces", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (variables.kuarterId) {
        queryClient.invalidateQueries({
          queryKey: ["kuarter", variables.kuarterId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["kuarter"] });
      }
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal edit workspaces");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteWorkspace(id),
    onSuccess: () => {
      toast.success("Berhasil menghapus workspace");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (kuarterId) {
        queryClient.invalidateQueries({
          queryKey: ["kuarter", kuarterId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["kuarter"] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menghapus workspace");
      }
    },
  });

  const getProgressBar = useMutation({
    
  })
  return {
    formData,
    setFormData,
    workspacesQuery,
    createMutation,
    handleChange,
    WorkspaceDetail,
    addProjectMutation,
    deleteMutation,
    updateWorkspaceMutation,
  };
};
