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
  fetchMyWork,
  fetchMyWorkAgendaMeeting,
  getProjectsWithMajorTask,
  getMajorTaskByProject,
} from "../services/task";
import toast from "react-hot-toast";

export const useTask = (groupId, filters = {} /*searchQuery = */) => {
  const queryClient = useQueryClient();

  const taskByGroup = useQuery({
    queryKey: ["task", groupId, filters], // Include all filters in queryKey
    queryFn: () => getByGroup(groupId, filters),
    enabled: !!groupId,
  });

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
      // queryClient.invalidateQueries({ queryKey: ["task", groupId, filters] });
      queryClient.invalidateQueries({
        queryKey: ["task", groupId],
      });
      queryClient.invalidateQueries({
        queryKey: ["task", groupId, "progress"],
      });
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
      toast.success("Successfully delete task");
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
    mutationFn: (taskIds) => updateTaskPositions(groupId, taskIds),
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
  };
};

export const useTaskByProject = (projectId) => {
  return useQuery({
    queryKey: ["task", "project", projectId],
    queryFn: () => getByProjectId(projectId),
    enabled: !!projectId,
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
};

export const useMyWork = () => {
  return useQuery({
    queryKey: ["myWork"],
    queryFn: fetchMyWork,
    refetchInterval: false,
  });
};

export const usemyWorkAgendaMeeting = () => {
  return useQuery({
    queryKey: ["myWorkAgendaMeeting"],
    queryFn: fetchMyWorkAgendaMeeting,
    refetchInterval: false,
  });
};

export const useMajorTaskByProject = (projectId, filters = {}) => {
  return useQuery({
    queryKey: ["task", "major", projectId, filters],
    queryFn: () => getMajorTaskByProject(projectId, filters),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
};

export const useProjectWithMajorTask = () => {
  return useQuery({
    queryKey: ["project", "major"],
    queryFn: getProjectsWithMajorTask,
  });
};
