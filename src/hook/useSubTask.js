import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addSubTask,
  updateSubTask,
  positionSubTask,
} from "../services/subtask";
import toast from "react-hot-toast";

export const useSubTask = (taskId, groupId) => {
  const queryClient = useQueryClient();

  const addSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => addSubTask(taskId, data),
    onSuccess: () => {
      toast.success("succes");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah sub task");
      }
    },
  });

  const updateSubTaskMutation = useMutation({
    mutationFn: ({ subtaskId, data }) => updateSubTask(subtaskId, data),
    onSuccess: () => {
      toast.success("updated");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal menambah sub task");
      }
    },
  });

  const updatePositionSubTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => positionSubTask(taskId, data),
    onSuccess: () => {
      toast.success("posisi succes");
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
    onError: (error) => {
      if (error.response?.data?.error) {
        error.response.data.error.forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error("Gagal posisi task ");
      }
    },
  });

  return {
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
  };
};
