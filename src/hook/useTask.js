import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getByGroup,
  addTask,
  updateTask,
  updateTaskPositions,
} from "../services/task";
import toast from "react-hot-toast";

export const useTask = (groupId) => {
  const queryClient = useQueryClient();

  // Query untuk fetch tasks
  const taskByGroup = useQuery({
    queryKey: ["task", groupId],
    queryFn: () => getByGroup(groupId),
    enabled: !!groupId,
  });

  // Mutation untuk add task
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

  return {
    taskByGroup,
    addTaskMutation,
    updateTaskMutation,
    updateTaskPositionsMutation,
  };
};
