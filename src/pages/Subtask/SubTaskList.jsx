import { useState, useEffect, useRef, useCallback } from "react";
import { useSubTask } from "../../hook/useSubTask";
import { Plus, UserPlus, X, Trash2 } from "lucide-react";
import PopupSelect from "../Task/PopupSelect";
import DatePickerPopup from "../Task/DatePickerPopup";
import toast from "react-hot-toast";
import DialogDetail from "../Task/DialogDetail";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useMember } from "../../hook/useMember";
import { createPortal } from "react-dom";

// const SubtaskList = ({ taskId, groupId, workspaceId, onSubtaskStatusChange }) => {
const SubtaskList = ({ taskId, groupId, workspaceId }) => {
  const {
    subtaskByTask,
    addSubTaskMutation,
    updateSubTaskMutation,
    updatePositionSubTaskMutation,
    assignPicMutation,
    removePicMutation,
    deleteSubTaskMutation,
  } = useSubTask(taskId, groupId);
  const { membersWorkspaceQuery } = useMember("workspace", workspaceId);
  const [openDialog, setOpenDialog] = useState(false);
  const [subtaskName, setSubtaskName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [localSubtasks, setLocalSubtasks] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [picPopup, setPicPopup] = useState({ show: false, subtaskId: null });
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    subTaskId: null,
  });

  const buttonRefs = useRef({});
  const STATUS_OPTIONS = [
    "To Do",
    "In Progress",
    "Done",
    "Blocked",
    "Hold",
  ];
  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];
  const NOTE_OPTIONS = [
    "Completed - On Time",
    "Completed - Overdue",
    "Completed - Early",
    "Uncomplete",
    "Planning",
  ];

  useEffect(() => {
    if (subtaskByTask.data) {
      setLocalSubtasks(subtaskByTask.data);
    }
  }, [subtaskByTask.data]);

  const handleAssignPic = useCallback(
    (subtaskId, email) => {
      const trimmedEmail = email.trim();
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
            setPicPopup({ show: false, subtaskId: null });
          },
        }
      );
    },
    [assignPicMutation]
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
        const task = localSubtasks.find((t) => t._id === subtaskId);
        if (!task) {
          updateSubTaskMutation.mutate({ subtaskId, data: { [field]: value } });
          setActivePopup(null);
          return;
        }
        let updateData = { [field]: value };
        if (
          field !== "note" &&
          (field === "status" || field === "due_date" || field === "finish_date")
        ) {
          const newStatus = field === "status" ? value : task.status;
          const newDueDate = field === "due_date" ? value : task.due_date;
          const newFinishDate =
            field === "finish_date" ? value : task.finish_date;
          const autoNote = calculateAutoNote(
            newStatus,
            newDueDate,
            newFinishDate
          );
  
          if (autoNote) {
            updateData.note = autoNote;
          }
        }
        updateSubTaskMutation.mutate({ subtaskId, data: updateData });
        setActivePopup(null);
      },
      //   updateSubTaskMutation.mutate({ subtaskId, data: updateData },
      //     {
      //       onSuccess: ()=>{
      //         if(field === "status" && onSubtaskStatusChange){
      //           onSubtaskStatusChange();
      //         }
      //       }
      //     }
      //   );
      //   setActivePopup(null);
      // },
      // [localSubtasks, updateSubTaskMutation, onSubtaskStatusChange]
      [localSubtasks, updateSubTaskMutation]
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
    console.log(updatePositionSubTaskMutation);

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDeleteTask = useCallback((subTaskId) => {
    console.log("handle delete called by taskId:", subTaskId);
    setConfirmDelete({ show: true, subTaskId: subTaskId });
  }, []);
  const confirmDeleteTask = useCallback(() => {
    console.log("confirmDeleteTask called");
    console.log("confirmDelete state:", confirmDelete);

    if (confirmDelete.subTaskId) {
      console.log(
        "Calling deleteSubTaskMutation with:",
        confirmDelete.subTaskId
      );
      deleteSubTaskMutation.mutate(confirmDelete.subTaskId);
      setConfirmDelete({ show: false, subtaskId: null });
    } else {
      console.log("No taskId found in confirmDelete");
    }
  }, [confirmDelete.subTaskId, deleteSubTaskMutation]);

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
  const calculateAutoNote = (status, due_date, finish_date) => {
    if (status === "Done" && due_date && finish_date) {
      const dueDate = new Date(due_date).setHours(0, 0, 0, 0);
      const finishDate = new Date(finish_date).setHours(0, 0, 0, 0);
      if (finishDate === dueDate) {
        return "Completed - On Time";
      } else if (finishDate > dueDate) {
        return "Completed - Overdue";
      } else if (finishDate < dueDate) {
        return "Completed - Early";
      }
    }
    if (status === "To Do") {
      return "Planning";
    }
    if (["In Progress", "Blocked", "Hold"].includes(status)) {
      return "Uncomplete";
    }
    return null;
  };

  const PicPopup = ({ members, onSelect, onClose, buttonRef }) => {
    const [email, setEmail] = useState("");
    const popupRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          popupRef.current &&
          !popupRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)
        ) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, buttonRef]);

    const position = buttonRef.current?.getBoundingClientRect();

    const popupHeight = 300;
    const spaceBelow = window.innerHeight - (position?.bottom || 0);
    const shouldShowAbove = spaceBelow < popupHeight;

    return createPortal(
      <div
        ref={popupRef}
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-90 w-64"
        style={{
          top: shouldShowAbove
            ? `${(position?.top || 0) - popupHeight}px`
            : `${(position?.bottom || 0) + 5}px`,
          left: `${Math.min(position?.left || 0, window.innerWidth - 270)}px`,
        }}
      >
        <div className="text-xs font-semibold mb-2 text-gray-700">
          Select Member:
        </div>
        <div className="max-h-40 overflow-y-auto mb-3 border border-gray-200 rounded">
          {members.map((member) => {
            const user = member.user || member;
            if (!user?.email) return null;

            return (
              <button
                key={user._id || user.email}
                onClick={() => onSelect(user.email)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                  {user.username?.substring(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.username}</div>
                  <div className="text-gray-500 truncate">{user.email}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold mb-1 text-gray-700">
          Or enter email:
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSelect(email);
              setEmail("");
            }
            if (e.key === "Escape") onClose();
          }}
          className="w-full px-2 py-1.5 text-xs border text-black border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@example.com"
          autoFocus
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelect(email);
              setEmail("");
            }}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!email.trim()}
          >
            Assign
          </button>
        </div>
      </div>,
      document.body
    );
  };

  if (subtaskByTask.isLoading) {
    return (
      <div className="ml-12 mt-1 mb-2 p-4 text-center text-gray-500">
        Loading subtasks...
      </div>
    );
  }
  const columnWidths = {
    task: "w-80",
    pic: "w-32",
    status: "w-40",
    priority: "w-32",
    meetingDate: "w-40",
    startDate: "w-40",
    dueDate: "w-40",
    finishDate: "w-40",
    note: "w-50",
    action: "w-40",
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
          className={`flex items-center hover:bg-none transition-opacity bg-[#F0E4D3] border-b border-gray-100 ${draggedItem === index ? "opacity-40" : ""
            }`}
        >
          {/* Name Column */}
          <div
            className={`flex-1 flex items-center ${columnWidths.task} gap-1 px-3 py-3.5 border-b border-gray-100 cursor-grab active:cursor-grabbing`}
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

            {/* <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            /> */}

            {editingSubtaskId === s._id ? (
              <input
                type="text"
                className="text-sm border border-gray-300 text-black rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                value={editedName}
                autoFocus
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={() => handleEdit(s._id)}
                onKeyDown={(e) => handleEditKeyDown(e, s._id)}
              />
            ) : (
              <span
                className="text-[0.8em] text-gray-700 hover:bg-gray-100 px-1 rounded cursor-text whitespace-normal break-all line-clamp-5"
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
          <div
            className={`${columnWidths.pic} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center shrink-0`}
          >
            <div className="flex items-center gap-1 relative">
              {s.pic && s.pic.length > 0 && (
                <div className="flex -space-x-2">
                  {s.pic.slice(0, 3).map((picUser, idx) => (
                    <div key={idx} className="relative group">
                      <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                        {picUser.username
                          ? picUser.username.substring(0, 2).toUpperCase()
                          : "?"}
                      </div>
                      <button
                        onClick={() => handleRemovePic(s._id, picUser._id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                  {s.pic.length > 3 && (
                    <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                      +{s.pic.length - 3}
                    </div>
                  )}
                </div>
              )}

              <button
                ref={(el) => (buttonRefs.current[`pic-${s._id}`] = el)}
                onClick={() => setPicPopup({ show: true, subtaskId: s._id })}
                className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                title="Assign PIC"
              >
                <UserPlus size={14} />
              </button>

              {picPopup.show && picPopup.subtaskId === s._id && (
                <PicPopup
                  members={membersWorkspaceQuery.data?.members || []}
                  onSelect={(email) => handleAssignPic(s._id, email)}
                  onClose={() => setPicPopup({ show: false, subtaskId: null })}
                  buttonRef={{
                    current: buttonRefs.current[`pic-${s._id}`],
                  }}
                />
              )}
            </div>
          </div>

          {/* Status Column */}
          <div
            className={`${columnWidths.status} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`status-${s._id}`] = el)}
              className="px-3 py-1.5 text-[0.8em] font-semibold rounded-full bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200"
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
          <div
            className={`${columnWidths.priority} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`priority-${s._id}`] = el)}
              className={`px-3 py-1 text-[0.8em] font-medium rounded-full cursor-pointer hover:bg-gray-200 ${s.priority === "Urgent"
                ? "text-red-700 bg-red-200"
                : s.priority === "High"
                  ? "text-orange-800 bg-orange-200"
                  : s.priority === "Medium"
                    ? "text-blue-800 bg-blue-200"
                    : "text-gray-800 bg-gray-200"
                }`}
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
          <div
            className={`${columnWidths.meetingDate} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`meeting_date-${s._id}`] = el)}
              className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
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
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
                : "Set date & time"}
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
                  showTimeSelect={true}
                />
              )}
          </div>

          {/* Start Date Column */}
          <div
            className={`${columnWidths.startDate} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`start_date-${s._id}`] = el)}
              className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
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
          <div
            className={`${columnWidths.dueDate} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`due_date-${s._id}`] = el)}
              className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
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
          <div
            className={`${columnWidths.finishDate} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`finish_date-${s._id}`] = el)}
              className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
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
          <div
            className={`${columnWidths.note} px-6 py-3 flex items-center justify-center shrink-0`}
          >
            <span
              ref={(el) => (buttonRefs.current[`note-${s._id}`] = el)}
              className={`px-3 py-1.5 text-[0.8em] font-semibold rounded-full cursor-pointer ${s.note === "Planning"
                ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                : s.note === "Uncomplete"
                  ? "text-red-100 bg-red-900 hover:bg-red-400"
                  : s.note === "Completed - On Time"
                    ? "text-green-700 bg-green-100 hover:bg-green-200"
                    : s.note === "Completed - Overdue"
                      ? "text-amber-700 bg-orange-100 hover:bg-amber-200"
                      : "text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
                }`}
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
          <div
            className={`${columnWidths.action} px-6 py-3 flex items-center gap-2 justify-center shrink-0`}
          >
            <button
              className="bg-gray-100 rounded-xl p-1 text-black font-medium text-[0.7em] w-18 hover:bg-gray-200"
              onClick={() => setOpenDialog(true)}
            >
              Detail
            </button>
            <div className="bg-gray-100 rounded-lg p-1 pl-2 pr-2 font-medium hover:bg-gray-200">
              <Trash2
                className="text-red-500 hover:text-red-800 w-4 h-4 cursor-pointer"
                onClick={() => handleDeleteTask(s._id)}
              />
            </div>
            <DialogDetail
              show={openDialog}
              onClose={() => setOpenDialog(false)}
            />
          </div>
          <ConfirmDialog
            show={confirmDelete.show}
            onClose={() => setConfirmDelete({ show: false, subTaskId: null })}
            onConfirm={confirmDeleteTask}
            title="Delete Subtask"
            message="Are you sure want to delete this subtask? this action can't be undo"
          />
        </div>
      ))}

      {showForm ? (
        <div className="flex gap-2 px-4 py-2">
          <input
            type="text"
            placeholder="Subtask name"
            className="flex-1 px-3 py-1.5 text-[0.9em] text-black text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="ml-4 mt-1 flex text-[0.8em] items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
