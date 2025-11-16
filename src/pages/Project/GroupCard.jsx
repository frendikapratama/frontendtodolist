import { ChevronDown, Trash2 } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
import { useState, useEffect } from "react";
import { useGroup } from "../../hook/useGroups";
import { useProgress } from "../../hook/useProgress";

const GroupCard = ({ group, index }) => {
  const { taskByGroup, updateTaskMutation } = useTask(group._id);
  const { updateGroupMutation, deleteMutation } = useGroup();
  const { progressByGroup } = useProgress(group._id);
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

  const handleDelete = (groupId, group_nama) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus group "${group_nama}"?`)
    ) {
      deleteMutation.mutate(groupId);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      done: "bg-green-100 text-green-700",
      in_progress: "bg-blue-100 text-blue-700",
      to_do: "bg-gray-100 text-gray-700",
      Hold: "bg-yellow-100 text-yellow-700",
      reject: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Get progress data
  const progressData = progressByGroup.data;

  return (
    <div className="bg-[#F0E4D3] rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-2 py-1 flex items-center justify-between cursor-pointer"
        style={{ background: getHeaderColor() }}
      >
        <div className="flex items-center gap-2">
          <ChevronDown className="w-5 h-5 text-white" />
          {isEditing ? (
            <input
              type="text"
              className="text-white placeholder-white placeholder-opacity-75 border-0 rounded px-2 py-1 focus:ring-2 focus:ring-white focus:ring-opacity-50 text-base font-semibold w-[200px]"
              style={{ background: "rgba(255, 255, 255, 0.2)" }}
              value={editedName}
              autoFocus
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameEdit(e);
                } else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditedName(group.nama);
                }
              }}
            />
          ) : (
            <h3
              className="text-white text-[0.8em] font-semibold text-base cursor-pointer hover:underline"
              onClick={() => {
                setIsEditing(true);
                setEditedName(group.nama);
              }}
            >
              {group.nama}
            </h3>
          )}
          <span className="text-xs text-white text-[0.7em] bg-opacity-20 px-2.5 py-1 rounded-full font-medium">
            {taskByGroup.data?.length || 0} items
          </span>
        </div>

        <Trash2
          className="text-red-500 hover:text-red-800 w-4 h-4 cursor-pointer"
          onClick={() => handleDelete(group._id, group.nama)}
          disabled={deleteMutation.isPending}
        />
      </div>

      {/* Progress Section */}
      {progressByGroup.isLoading ? (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-2.5 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ) : progressData ? (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {progressData.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressData.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex flex-wrap gap-2">
            {progressData.done > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  "done"
                )}`}
              >
                Done: {progressData.done}
              </span>
            )}
            {progressData.in_progress > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  "in_progress"
                )}`}
              >
                In Progress: {progressData.in_progress}
              </span>
            )}
            {progressData.to_do > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  "to_do"
                )}`}
              >
                To Do: {progressData.to_do}
              </span>
            )}
            {progressData.Hold > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  "Hold"
                )}`}
              >
                Hold: {progressData.Hold}
              </span>
            )}
            {progressData.reject > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                  "reject"
                )}`}
              >
                Reject: {progressData.reject}
              </span>
            )}
          </div>
        </div>
      ) : null}

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
