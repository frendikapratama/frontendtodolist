import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useTask } from "../../hook/useTask";
import TaskList from "../Task/TaskList";
import { useState } from "react";
import { useEffect, useCallback } from "react";
import { useGroup } from "../../hook/useGroups";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const GroupCard = ({ group, index }) => {
  const { taskByGroup, updateTaskMutation } = useTask(group._id);
  const { updateGroupMutation, deleteMutation } = useGroup();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.nama);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    taskId: null,
  });

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

  const handleDelete = useCallback((groupId) => {
    setConfirmDelete({ show: true, groupId: groupId });
  }, []);
  const confirmDeleteGroup = useCallback(() => {
    if (confirmDelete.groupId) {
      deleteMutation.mutate(confirmDelete.groupId);
      setConfirmDelete({ show: false, groupId: null });
    } else {
    }
  }, [confirmDelete.groupId, deleteMutation]);

  return (
    <div className="bg-[#F0E4D3] rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-2 py-1 flex items-center justify-between cursor-pointer"
        style={{ background: getHeaderColor() }}
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-5 h-5 text-white cursor-pointer transition-transform duration-500 ${isOpen ? "rotate-0" : "-rotate-90"
              }`}
            onClick={() => setIsOpen(!isOpen) }
          />
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
        <button
          className="btn btn-sm p-1 w-12 h-6 hover:bg-orange-700 bg-red-800 text-[0.7em] border-none"
          onClick={() => handleDelete(group._id, group.nama)}
        >
          Delete
        </button>
      </div>
      <ConfirmDialog
        show={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, groupId: null })}
        onConfirm={confirmDeleteGroup}
        title="Delete Group"
        message="Are you sure want to delete this Group Task? this action can't be undo"
      />

      <div
        className={`
        ${isDragOver ? "bg-blue-50" : ""}
        transition-all duration-500 overflow-hidden
        ${isOpen ? "opacity-100" : "opacity-0 max-h-0"}
        `}
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
