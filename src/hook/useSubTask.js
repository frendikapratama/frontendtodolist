import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSubTask,
  updateSubTask,
  positionSubTask,
  getSubtaskByTask,
  assignPicSubtask,
  removePicSubtask,
} from "../services/subtask";

import toast from "react-hot-toast";

export const useSubTask = (taskId, groupId) => {
  const queryClient = useQueryClient();

  const addSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => addSubTask(taskId, data),
    onSuccess: () => {
      toast.success("Subtask berhasil ditambahkan");
      // Invalidate dan refetch subtask
      queryClient.invalidateQueries({ queryKey: ["subtask", taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });

      // Trigger manual refetch jika perlu
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

  // Ubah enabled menjadi true agar auto-fetch
  const subtaskByTask = useQuery({
    queryKey: ["subtask", taskId],
    queryFn: () => getSubtaskByTask(taskId),
    enabled: !!taskId, // Hanya fetch jika taskId ada
    staleTime: 0, // Selalu refetch ketika di-invalidate
  });

  return {
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
    assignPicMutation,
    removePicMutation,
    subtaskByTask,
  };
};
