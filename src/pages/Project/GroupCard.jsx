import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useEffect } from "react";

const GroupCard = ({ group, index }) => {
  const queryClient = useQueryClient();
  const { taskByGroup, updateTaskMutation } = useTask(group._id);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const handleTaskDrop = (event) => {
      const { taskId, sourceGroupId, targetGroupId, targetIndex } =
        event.detail;

      if (targetGroupId === group._id && sourceGroupId !== group._id) {
        console.log(`[DEBUG] GroupCard received drop event:`, {
          targetGroup: group.nama,
          targetIndex,
          taskId,
          currentTaskCount: taskByGroup.data?.length || 0,
        });

        updateTaskMutation.mutate(
          {
            taskId,
            data: {
              groupId: group._id,
              position: targetIndex,
            },
          },
          {
            onSuccess: () => {
              console.log(
                `[DEBUG] Successfully moved task ${taskId} to group ${group._id} at position ${targetIndex}`
              );
            },
            onError: (error) => {
              console.error(`[DEBUG] Error moving task:`, error);
            },
            onSettled: () => {
              console.log(`[DEBUG] Invalidating queries for tasks`);
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
            },
          }
        );
      }
    };

    document.addEventListener("taskDrop", handleTaskDrop);

    return () => {
      document.removeEventListener("taskDrop", handleTaskDrop);
    };
  }, [group._id, updateTaskMutation, queryClient, taskByGroup.data?.length]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const getHeaderColor = () => {
    const colors = ["#579bfc", "#00c875", "#fdab3d"];
    return colors[index % 3];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-6 py-3.5 flex items-center justify-between cursor-pointer"
        style={{ background: getHeaderColor() }}
      >
        <div className="flex items-center gap-3">
          <ChevronDown className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold text-base">{group.nama}</h3>
          <span className="text-xs text-white bg-opacity-20 px-2.5 py-1 rounded-full font-medium">
            {taskByGroup.data?.length || 0} items
          </span>
        </div>
        <button className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>

      <div
        className={isDragOver ? "bg-blue-50" : ""}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <TaskList groupId={group._id} />
      </div>
    </div>
  );
};
export default GroupCard;
