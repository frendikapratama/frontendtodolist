import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getByGroup,
  addTask,
  updateTask,
  updateTaskPositions,
  assignPic,
  removePic,
  deleteTask,
  getByProjectId,
} from "../services/task";
import toast from "react-hot-toast";
import api from "../api/axios";

export const useTask = (groupId, projectId) => {
  const queryClient = useQueryClient();

  const taskByGroup = useQuery({
    queryKey: ["task", groupId],
    queryFn: () => getByGroup(groupId),
    enabled: !!groupId,
  });

  const taskByProject = (projectId) => {
    return useQuery({
      queryKey: ["task", "project", projectId],
      queryFn: () => getByProjectId(projectId),
      enabled: !!projectId,
    });
  };

  const addTaskMutation = useMutation({
    mutationFn: (taskData) => addTask(groupId, taskData),
    onSuccess: () => {
      toast.success("Successfully added Task");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to added task");
      }
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => updateTask(taskId, data),
    onSuccess: () => {
      toast.success("Successfully updated Task");
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: (error) => {
      const errors = error.response?.data?.error;
      if (Array.isArray(errors)) {
        errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error("Failed to update task");
      }
    },
  });
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId) => {
      console.log("mutationFn called with taskId:", taskId);
      return deleteTask(taskId);
    },
    onSuccess: (data) => {
      console.log("Delete success, response:", data);
      toast.success("Successfuly delete task");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
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

  const updateTaskPositionsMutation = useMutation({
    mutationFn: (taskIds) => updateTaskPositions(taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
    onError: () => {
      toast.error("Failed to update position task");
    },
  });

  const assignPicMutation = useMutation({
    mutationFn: ({ taskId, picEmail }) => assignPic(taskId, picEmail),
    onSuccess: (data) => {
      if (data.invited) {
        toast.success("Successfully invite PIC");
      } else {
        toast.success("Assign PIC success");
      }
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to assign PIC");
    },
  });

  const removePicMutation = useMutation({
    mutationFn: ({ taskId, userId }) => removePic(taskId, userId),
    onSuccess: () => {
      toast.success("Successfully delete PIC");
      queryClient.invalidateQueries({ queryKey: ["task", groupId] });
    },
    onError: () => {
      toast.error("Failed to delete PIC");
    },
  });

  return {
    taskByGroup,
    addTaskMutation,
    updateTaskMutation,
    updateTaskPositionsMutation,
    assignPicMutation,
    removePicMutation,
    deleteTaskMutation,
    taskByProject,
  };
};
