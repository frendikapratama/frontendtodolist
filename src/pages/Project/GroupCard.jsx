import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
import { useQueryClient } from "@tanstack/react-query";
const GroupCard = ({ group, index }) => {
  const queryClient = useQueryClient();
  const { taskByGroup, updateTaskMutation } = useTask(group._id);
  const taskCount = taskByGroup.data?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-6 py-3.5 flex items-center justify-between cursor-pointer"
        style={{
          background:
            index % 3 === 0
              ? "#579bfc"
              : index % 3 === 1
              ? "#00c875"
              : "#fdab3d",
        }}
      >
        <div className="flex items-center gap-3">
          <ChevronDown className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold text-base">{group.nama}</h3>
          <span className="text-xs text-white bg-opacity-20 px-2.5 py-1 rounded-full font-medium">
            {taskCount} items
          </span>
        </div>
        <button className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition">
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const taskId = e.dataTransfer.getData("taskId");
          const sourceGroupId = e.dataTransfer.getData("sourceGroupId");

          if (sourceGroupId && sourceGroupId !== group._id) {
            updateTaskMutation.mutate(
              {
                taskId,
                data: { groupId: group._id },
              },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["task"] });
                },
              }
            );
          }
        }}
      >
        <TaskList groupId={group._id} />
      </div>
    </div>
  );
};

export default GroupCard;
