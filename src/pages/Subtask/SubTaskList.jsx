import { useState, useEffect } from "react";
import { useSubTask } from "../../hook/useSubTask";
import { Plus } from "lucide-react";

const SubtaskList = ({ taskId, subtasks, groupId }) => {
  const {
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
  } = useSubTask(taskId, groupId);
  const [subtaskName, setSubtaskName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [localSubtasks, setLocalSubtasks] = useState(subtasks);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    setLocalSubtasks(subtasks);
  }, [subtasks]);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newSubtasks = [...localSubtasks];
    const [removed] = newSubtasks.splice(draggedItem, 1);
    newSubtasks.splice(index, 0, removed);

    setLocalSubtasks(newSubtasks);
    setDraggedItem(index);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem === null) return;

    updatePositionSubTaskMutation.mutate({
      taskId,
      data: { subTaskId: localSubtasks.map((s) => s._id) },
    });

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleEdit = (subtaskId) => {
    if (!editedName.trim()) return;
    updateSubTaskMutation.mutate({
      subtaskId,
      data: { nama: editedName.trim() },
    });
    setEditingSubtaskId(null);
  };

  const handleEditKeyDown = (e, subtaskId) => {
    if (e.key === "Enter") handleEdit(subtaskId);
    if (e.key === "Escape") setEditingSubtaskId(null);
  };

  const handleAdd = () => {
    if (!subtaskName.trim()) return;
    addSubTaskMutation.mutate(
      { taskId, data: { nama: subtaskName.trim() } },
      {
        onSuccess: () => {
          setSubtaskName("");
          setShowForm(false);
        },
      }
    );
  };

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setSubtaskName("");
      setShowForm(false);
    }
  };

  return (
    <div className="ml-12 mt-1 mb-2">
      {localSubtasks.map((s, index) => (
        <div
          key={s._id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 py-2 px-4 hover:bg-gray-50 rounded transition-opacity ${
            draggedItem === index
              ? "opacity-40"
              : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="cursor-grab active:cursor-grabbing">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>

          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />

          {editingSubtaskId === s._id ? (
            <input
              type="text"
              className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
              value={editedName}
              autoFocus
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={() => handleEdit(s._id)}
              onKeyDown={(e) => handleEditKeyDown(e, s._id)}
            />
          ) : (
            <span
              className="text-sm text-gray-700 hover:bg-gray-100 px-1 rounded cursor-pointer"
              onClick={() => {
                setEditingSubtaskId(s._id);
                setEditedName(s.nama);
              }}
            >
              {s.nama}
            </span>
          )}
        </div>
      ))}
      {showForm ? (
        <div className="flex gap-2 px-4 py-2">
          <input
            type="text"
            placeholder="Subtask name"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={() =>
              subtaskName.trim() ? handleAdd() : setShowForm(false)
            }
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 mt-1 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
