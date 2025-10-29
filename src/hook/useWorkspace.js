import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getWorkspaces,
  createWorkspace,
  getWorkspaceById,
} from "../services/workspace";
import toast from "react-hot-toast";
import { addProjectToWorkspace } from "../services/project";

export const useWorkspace = () => {
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
    mutationFn: (data) => createWorkspace(data),
    onSuccess: () => {
      toast.success("Workspace created successfully");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      resetForm();
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah aset");
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
    onSuccess: () => {
      toast.success("Project berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
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
    formData,
    setFormData,
    workspacesQuery,
    createMutation,
    handleChange,
    WorkspaceDetail,
    addProjectMutation,
  };
};
