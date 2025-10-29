import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
const GroupCard = ({ group, index }) => {
  const { taskByGroup } = useTask(group._id);
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
      <TaskList groupId={group._id} />
    </div>
  );
};

export default GroupCard;
