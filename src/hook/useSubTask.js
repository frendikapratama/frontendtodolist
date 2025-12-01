import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSubTask,
  updateSubTask,
  positionSubTask,
  getSubtaskByTask,
  assignPicSubtask,
  removePicSubtask,
  deleteSubTask,
} from "../services/subtask";

import toast from "react-hot-toast";

export const useSubTask = (taskId, groupId) => {
  const queryClient = useQueryClient();

  const addSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => addSubTask(taskId, data),
    onSuccess: () => {
      toast.success("Subtask berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
      queryClient.refetchQueries({ queryKey: ["subtask", taskId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah subtask");
      }
    },
  });

  const updateSubTaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }) => updateSubTask(subtaskId, data),
    onSuccess: () => {
      toast.success("Subtask berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal mengupdate subtask");
      }
    },
  });

  const updatePositionSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => positionSubTask(taskId, data),
    onSuccess: () => {
      toast.success("Posisi berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal mengubah posisi subtask");
      }
    },
  });

  const assignPicMutation = useMutation({
    mutationFn: ({ subtaskId, picEmail }) =>
      assignPicSubtask(subtaskId, picEmail),
    onSuccess: () => {
      toast.success("PIC berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambahkan PIC");
      }
    },
  });
  const deleteSubTaskMutation = useMutation({
    mutationFn: (subtaskId) => {
      console.log("mutationFn called with taskId:", subtaskId);
      return deleteSubTask(subtaskId);
    },
    onSuccess: (data) => {
      console.log("Delete success, response:", data);
      toast.success("Successfuly delete sub task");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
    },
    onError: (error) => {
      console.log("Delete error:", error);
      console.log("Error response:", error.response?.data);
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to delete task");
      }
    },
  });

  const removePicMutation = useMutation({
    mutationFn: ({ subtaskId, userId }) => removePicSubtask(subtaskId, userId),
    onSuccess: () => {
      toast.success("PIC berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menghapus PIC");
      }
    },
  });

  const subtaskByTask = useQuery({
    queryKey: ["subtask", taskId],
    queryFn: () => getSubtaskByTask(taskId),
    enabled: !!taskId,
    staleTime: 0,
  });

  return {
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
    assignPicMutation,
    removePicMutation,
    subtaskByTask,
    deleteSubTaskMutation,
  };
};
