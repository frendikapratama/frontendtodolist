import { useCallback } from 'react';

// Task -> Subtask
export const STATUS_MAPPING = {
    "To Do": "Not Started",
    "In Progress": "In Progress",
    "Done": "Done",
    "Blocked": "Blocked",
    "Hold": "Hold"
};

// Subtask -> Task
export const REVERSE_STATUS_MAPPING = {
    "Not Started": "To Do",
    "In Progress": "In Progress",
    "Done": "Done",
    "Blocked": "Blocked",
    "Hold": "Hold"
};

export const useStatusSync = () => {
    const determineTaskStatus = useCallback((subtasks) => {
        if (!subtasks || subtasks.length === 0) return null;
        const statuses = subtasks.map(s => s.status);
        if (statuses.includes("Blocked")) return "Blocked";
        if (statuses.includes("Hold")) return "Hold";
        if (statuses.every(s => s === "Done")) return "Done";
        if (statuses.includes("In Progress")) return "In Progress";
        if (statuses.every(s => s === "Not Started")) return "To Do";
        return "In Progress";
    }, []);
    const syncTasktoSubtasks = useCallback((taskStatus, subtasks, updateSubTaskMutation) => {
        const targetSubtaskStatus = STATUS_MAPPING[taskStatus];
        if (!targetSubtaskStatus || !subtasks || subtasks.length === 0) return;
        subtasks.forEach(subtask => {
            if (subtask.status !== targetSubtaskStatus) {
                updateSubTaskMutation.mutate({
                    subtaskId: subtask._id,
                    data: { status: targetSubtaskStatus }
                });
            }
        });
    }, []);

    const syncSubtasktoTask = useCallback((subtasks, taskId, taskCurrentStatus, updateTaskMutation) => {
        const determinedStatus = determineTaskStatus(subtasks);
        if (determinedStatus && determinedStatus !== taskCurrentStatus) {
            updateTaskMutation.mutate({
                taskId,
                data: { status: determinedStatus }
            });
        }
    }, [determineTaskStatus]);

    return {
        determineTaskStatus,
        syncTasktoSubtasks,
        syncSubtasktoTask,
        STATUS_MAPPING,
        REVERSE_STATUS_MAPPING
    };
};