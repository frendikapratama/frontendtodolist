import { useState, useEffect, useRef, useCallback } from "react";
import { useSubTask } from "../../hook/useSubTask";
import { Plus, UserPlus, X } from "lucide-react";
import PopupSelect from "../Task/PopupSelect";
import DatePickerPopup from "../Task/DatePickerPopup";
import toast from "react-hot-toast";

const SubtaskList = ({ taskId, groupId }) => {
  const {
    subtaskByTask,
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
    assignPicMutation,
    removePicMutation,
  } = useSubTask(taskId, groupId);

  const [subtaskName, setSubtaskName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [localSubtasks, setLocalSubtasks] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [showPicInput, setShowPicInput] = useState(null);
  const [picEmail, setPicEmail] = useState("");

  const buttonRefs = useRef({});
  const STATUS_OPTIONS = [
    "Not Started",
    "In Progress",
    "Done",
    "Blocked",
    "Hold",
  ];
  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];
  const NOTE_OPTIONS = [
    "Completed - ON Time",
    "Completed - Overdue",
    "Complete - Early",
    "Uncomplete",
    "Planning",
  ];

  useEffect(() => {
    if (subtaskByTask.data) {
      setLocalSubtasks(subtaskByTask.data);
    }
  }, [subtaskByTask.data]);

  const handleAssignPic = useCallback(
    (subtaskId) => {
      const trimmedEmail = picEmail.trim();
      if (!trimmedEmail) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        toast.error("Format email tidak valid");
        return;
      }

      assignPicMutation.mutate(
        { subtaskId, picEmail: trimmedEmail },
        {
          onSuccess: () => {
            setPicEmail("");
            setShowPicInput(null);
          },
        }
      );
    },
    [picEmail, assignPicMutation]
  );

  const handleRemovePic = useCallback(
    (subtaskId, userId) => {
      if (window.confirm("Hapus PIC dari subtask ini?")) {
        removePicMutation.mutate({ subtaskId, userId });
      }
    },
    [removePicMutation]
  );

  const handlePopupChange = useCallback(
    (subtaskId, field, value) => {
      updateSubTaskMutation.mutate({
        subtaskId,
        data: { [field]: value },
      });
      setActivePopup(null);
    },
    [updateSubTaskMutation]
  );

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

  if (subtaskByTask.isLoading) {
    return (
      <div className="ml-12 mt-1 mb-2 p-4 text-center text-gray-500">
        Loading subtasks...
      </div>
    );
  }

  return (
    <div className="ml-12 mt-1 mb-2">
      <div className="flex bg-[#D2C1B6] border-b border-gray-200">
        <div className="flex-1 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Task
        </div>
        <div className="w-32 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          PIC
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Status
        </div>
        <div className="w-32 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Priority
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Meeting Date
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Start Date
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Due Date
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Finish Date
        </div>
        <div className="w-60 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Note
        </div>
        <div className="w-40 px-6 py-3 text-xs font-semibold text-gray-600 uppercase items-center flex justify-center">
          Action
        </div>
      </div>

      {localSubtasks.map((s, index) => (
        <div
          key={s._id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex items-center hover:bg-gray-50 transition-opacity bg-[#F5F3EF] border-b border-gray-100 ${
            draggedItem === index ? "opacity-40" : ""
          }`}
        >
          {/* Name Column */}
          <div className="flex-1 flex items-center gap-3 px-6 py-3 cursor-grab active:cursor-grabbing">
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
                className="text-sm text-gray-700 hover:bg-gray-100 px-1 rounded cursor-text"
                onClick={() => {
                  setEditingSubtaskId(s._id);
                  setEditedName(s.nama);
                }}
              >
                {s.nama}
              </span>
            )}
          </div>

          {/* PIC Column */}
          <div className="w-32 px-6 py-3 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {s.pic && s.pic.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap">
                  {s.pic.map((picUser, idx) => (
                    <div
                      key={idx}
                      className="relative group"
                      title={picUser.email || "PIC"}
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                        {picUser.username
                          ? picUser.username.substring(0, 2).toUpperCase()
                          : "?"}
                      </div>
                      <button
                        onClick={() => handleRemovePic(s._id, picUser._id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {showPicInput === s._id ? (
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-40 px-2 py-1 text-xs border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={picEmail}
                  onChange={(e) => setPicEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAssignPic(s._id);
                    if (e.key === "Escape") {
                      setPicEmail("");
                      setShowPicInput(null);
                    }
                  }}
                  onBlur={() => {
                    if (picEmail.trim()) {
                      handleAssignPic(s._id);
                    } else {
                      setPicEmail("");
                      setShowPicInput(null);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setShowPicInput(s._id)}
                  className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  title="Assign PIC"
                >
                  <UserPlus className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                </button>
              )}
            </div>
          </div>

          {/* Status Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`status-${s._id}`] = el)}
              className="px-3 py-1.5 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200"
              onClick={() =>
                setActivePopup({ subtaskId: s._id, field: "status" })
              }
            >
              {s.status}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "status" && (
                <PopupSelect
                  value={s.status}
                  options={STATUS_OPTIONS}
                  onChange={(value) =>
                    handlePopupChange(s._id, "status", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`status-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Priority Column */}
          <div className="w-32 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`priority-${s._id}`] = el)}
              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
              onClick={() =>
                setActivePopup({ subtaskId: s._id, field: "priority" })
              }
            >
              {s.priority || "Medium"}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "priority" && (
                <PopupSelect
                  value={s.priority || "Medium"}
                  options={PRIORITY_OPTIONS}
                  onChange={(value) =>
                    handlePopupChange(s._id, "priority", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`priority-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Meeting Date Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`meeting_date-${s._id}`] = el)}
              className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={() =>
                setActivePopup({
                  subtaskId: s._id,
                  field: "meeting_date",
                })
              }
            >
              {s.meeting_date
                ? new Date(s.meeting_date).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Set date"}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "meeting_date" && (
                <DatePickerPopup
                  value={s.meeting_date}
                  onChange={(value) =>
                    handlePopupChange(s._id, "meeting_date", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`meeting_date-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Start Date Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`start_date-${s._id}`] = el)}
              className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={() =>
                setActivePopup({
                  subtaskId: s._id,
                  field: "start_date",
                })
              }
            >
              {s.start_date
                ? new Date(s.start_date).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Set date"}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "start_date" && (
                <DatePickerPopup
                  value={s.start_date}
                  onChange={(value) =>
                    handlePopupChange(s._id, "start_date", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`start_date-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Due Date Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`due_date-${s._id}`] = el)}
              className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={() =>
                setActivePopup({ subtaskId: s._id, field: "due_date" })
              }
            >
              {s.due_date
                ? new Date(s.due_date).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Set date"}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "due_date" && (
                <DatePickerPopup
                  value={s.due_date}
                  onChange={(value) =>
                    handlePopupChange(s._id, "due_date", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`due_date-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Finish Date Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`finish_date-${s._id}`] = el)}
              className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
              onClick={() =>
                setActivePopup({ subtaskId: s._id, field: "finish_date" })
              }
            >
              {s.finish_date
                ? new Date(s.finish_date).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Set date"}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "finish_date" && (
                <DatePickerPopup
                  value={s.finish_date}
                  onChange={(value) =>
                    handlePopupChange(s._id, "finish_date", value)
                  }
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`finish_date-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Note Column */}
          <div className="w-60 px-6 py-3 flex items-center justify-center">
            <span
              ref={(el) => (buttonRefs.current[`note-${s._id}`] = el)}
              className="px-3 py-1.5 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200"
              onClick={() =>
                setActivePopup({ subtaskId: s._id, field: "note" })
              }
            >
              {s.note}
            </span>
            {activePopup?.subtaskId === s._id &&
              activePopup?.field === "note" && (
                <PopupSelect
                  value={s.note}
                  options={NOTE_OPTIONS}
                  onChange={(value) => handlePopupChange(s._id, "note", value)}
                  onClose={() => setActivePopup(null)}
                  buttonRef={{
                    current: buttonRefs.current[`note-${s._id}`],
                  }}
                />
              )}
          </div>

          {/* Action Column */}
          <div className="w-40 px-6 py-3 flex items-center justify-center">
            <button className="bg-gray-100 rounded-xl p-1 text-black font-medium text-xs w-18 hover:bg-gray-200">
              Detail
            </button>
          </div>
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
