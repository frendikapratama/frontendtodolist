import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useEffect } from "react";
import { useGroup } from "../../hook/useGroups";

const GroupCard = ({ group, index }) => {
  const { taskByGroup, updateTaskMutation } = useTask(group._id);
  const { updateGroupMutation } = useGroup();
  const [isDragOver, setIsDragOver] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.nama);

  const handleNameEdit = (e) => {
    e.preventDefault();
    const newName = editedName.trim();

    if (!newName || newName === group.nama) {
      setIsEditing(false);
      setEditedName(group.nama);
      return;
    }

    updateGroupMutation.mutate({
      groupId: group._id,
      data: { nama: newName },
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const handleTaskDrop = (event) => {
      const { taskId, sourceGroupId, targetGroupId, targetIndex } =
        event.detail;

      if (targetGroupId === group._id && sourceGroupId !== group._id) {
        updateTaskMutation.mutate({
          taskId,
          data: {
            groupId: group._id,
            position: targetIndex,
          },
        });
      }
    };

    document.addEventListener("taskDrop", handleTaskDrop);
    return () => document.removeEventListener("taskDrop", handleTaskDrop);
  }, [group._id, updateTaskMutation]);

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
          {isEditing ? (
            <form onSubmit={handleNameEdit} className="m-0">
              <input
                type="text"
                className=" text-white placeholder-white placeholder-opacity-75 border-0 rounded px-2 py-1 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-base font-semibold w-[200px]"
                value={editedName}
                autoFocus
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameEdit}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditedName(group.nama);
                  }
                }}
              />
            </form>
          ) : (
            <h3
              className="text-white font-semibold text-base cursor-pointer hover:underline"
              onClick={() => {
                setIsEditing(true);
                setEditedName(group.nama);
              }}
            >
              {group.nama}
            </h3>
          )}
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
