import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getByGroup,
  addTask,
  updateTask,
  updateTaskPositions,
  assignPic,
  removePic,
} from "../services/task";
import toast from "react-hot-toast";

export const useTask = (groupId) => {
  const queryClient = useQueryClient();

  const taskByGroup = useQuery({
    queryKey: ["task", groupId],
    queryFn: () => getByGroup(groupId),
    enabled: !!groupId,
  });

  const addTaskMutation = useMutation({
    mutationFn: (taskData) => addTask(groupId, taskData),
    onSuccess: () => {
      toast.success("Task berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Gagal menambahkan task");
      }
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => updateTask(taskId, data),
    onSuccess: () => {
      toast.success("Task berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Gagal mengupdate task");
      }
    },
  });

  const updateTaskPositionsMutation = useMutation({
    mutationFn: (taskIds) => updateTaskPositions(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: () => {
      toast.error("Gagal mengupdate posisi task");
    },
  });

  // TAMBAHKAN sebelum return statement

  const assignPicMutation = useMutation({
    mutationFn: ({ taskId, picEmail }) => assignPic(taskId, picEmail),
    onSuccess: (data) => {
      if (data.invited) {
        toast.success("Undangan PIC berhasil dikirim");
      } else {
        toast.success("PIC berhasil di-assign");
      }
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal assign PIC");
    },
  });

  const removePicMutation = useMutation({
    mutationFn: ({ taskId, userId }) => removePic(taskId, userId),
    onSuccess: () => {
      toast.success("PIC berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: () => {
      toast.error("Gagal menghapus PIC");
    },
  });
  return {
    taskByGroup,
    addTaskMutation,
    updateTaskMutation,
    updateTaskPositionsMutation,
    assignPicMutation,
    removePicMutation,
  };
};
