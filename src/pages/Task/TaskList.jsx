import { useState, useRef, useCallback, useEffect } from "react";
import { useTask } from "../../hook/useTask";
import SubtaskList from "../Subtask/SubTaskList";
import PopupSelect from "./PopupSelect";
import DatePickerPopup from "./DatePickerPopup";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  UserPlus,
  X,
  Trash2,
} from "lucide-react";
import DialogDetail from "../Task/DialogDetail";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

const TaskList = ({ groupId }) => {
  const {
    taskByGroup,
    addTaskMutation,
    updateTaskMutation,
    updateTaskPositionsMutation,
    assignPicMutation,
    removePicMutation,
    deleteTaskMutation,
  } = useTask(groupId);
  const { data, isLoading, isError } = taskByGroup;

  const [openDialog, setOpenDialog] = useState({ open: false, task: null });
  const [showAddTask, setShowAddTask] = useState(false);
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [taskName, setTaskName] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [activePopup, setActivePopup] = useState(null);
  const [localTasks, setLocalTasks] = useState([]);
  const [dragState, setDragState] = useState({
    index: null,
    task: null,
    fromGroup: null,
  });
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    taskId: null,
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const buttonRefs = useRef({});
  const STATUS_OPTIONS = ["To Do", "In Progress", "Done", "Blocked", "Hold"];
  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];
  const NOTE_OPTIONS = [
    "Completed - On Time",
    "Completed - Overdue",
    "Completed - Early",
    "Uncomplete",
    "Planning",
  ];
  const [showPicInput, setShowPicInput] = useState(null);
  const [picEmail, setPicEmail] = useState("");

  const handleAssignPic = useCallback(
    (taskId) => {
      const trimmedEmail = picEmail.trim();
      if (!trimmedEmail) return;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        toast.error("Format email tidak valid");
        return;
      }

      assignPicMutation.mutate(
        { taskId, picEmail: trimmedEmail },
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
    (taskId, userId) => {
      if (window.confirm("Hapus PIC dari task ini?")) {
        removePicMutation.mutate({ taskId, userId });
      }
    },
    [removePicMutation]
  );

  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setLocalTasks((prev) => prev.filter((t) => !t._isPreview));
    };

    const handleGlobalDrop = () => {
      setLocalTasks((prev) => prev.filter((t) => !t._isPreview));
    };

    document.addEventListener("dragend", handleGlobalDragEnd);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragend", handleGlobalDragEnd);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  useEffect(() => {
    if (data) setLocalTasks(data);
  }, [data]);

  const handleClickDialog = () => {
    setOpenDialog(true);
  };

  const handleAddTask = useCallback(() => {
    const trimmedName = taskName.trim();
    if (!trimmedName) return;

    addTaskMutation.mutate(
      {
        nama: trimmedName,
        status: "To Do",
        priority: "Medium",
        start_date: "",
      },
      {
        onSuccess: () => {
          setTaskName("");
          setShowAddTask(false);
        },
      }
    );
  }, [taskName, addTaskMutation]);

  const handleFieldEdit = useCallback(
    (taskId, field, value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue && field === "nama") {
        setEditingField(null);
        return;
      }
      updateTaskMutation.mutate({ taskId, data: { [field]: trimmedValue } });
      setEditingField(null);
    },
    [updateTaskMutation]
  );

  const handlePopupChange = useCallback(
    (taskId, field, value) => {
      updateTaskMutation.mutate({ taskId, data: { [field]: value } });
      setActivePopup(null);
    },
    [updateTaskMutation]
  );

  const handleDragStart = (e, index) => {
    const task = localTasks[index];
    setDragState({ index, task, fromGroup: groupId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.setData("sourceGroupId", groupId);
    e.dataTransfer.setData("draggedTask", JSON.stringify(task));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    const draggedTaskData = JSON.parse(
      e.dataTransfer.getData("draggedTask") || "{}"
    );

    if (!draggedTaskData._id) return;

    const isSameGroup = sourceGroupId === groupId;
    const currentDragIndex = isSameGroup ? dragState.index : null;

    if (currentDragIndex === index) return;

    setLocalTasks((prev) => {
      const filtered = prev.filter((t) => !t._isPreview);
      const newTasks = isSameGroup ? [...filtered] : [...filtered];

      if (isSameGroup && currentDragIndex !== null) {
        const [removed] = newTasks.splice(currentDragIndex, 1);
        newTasks.splice(index, 0, removed);
      } else {
        const alreadyHasPreview = newTasks.some(
          (t) => t._id === draggedTaskData._id && t._isPreview
        );
        if (!alreadyHasPreview) {
          newTasks.splice(index, 0, { ...draggedTaskData, _isPreview: true });
        }
      }
      return newTasks;
    });

    setDragState((prev) => ({ ...prev, index }));
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
    const draggedTaskId = e.dataTransfer.getData("taskId");
    const isSameGroup = sourceGroupId === groupId;
    setLocalTasks((prev) => prev.filter((t) => !t._isPreview));

    if (isSameGroup) {
      updateTaskPositionsMutation.mutate(
        localTasks.filter((t) => !t._isPreview).map((t) => t._id)
      );
    } else {
      const dropEvent = new CustomEvent("taskDrop", {
        detail: {
          taskId: draggedTaskId,
          sourceGroupId,
          targetGroupId: groupId,
          targetIndex: index,
        },
      });
      document.dispatchEvent(dropEvent);
    }

    setDragState({ index: null, task: null, fromGroup: null });
  };

  const handleDragEnd = () => {
    setLocalTasks((prev) => prev.filter((t) => !t._isPreview));
    setDragState({ index: null, task: null, fromGroup: null });
  };
  const handleDeleteTask = useCallback((taskId) => {
    console.log("handle delete called by taskId:", taskId);
    setConfirmDelete({ show: true, taskId: taskId });
  }, []);
  const confirmDeleteTask = useCallback(() => {
    console.log("confirmDeleteTask called");
    console.log("confirmDelete state:", confirmDelete);

    if (confirmDelete.taskId) {
      console.log("Calling deleteTaskMutation with:", confirmDelete.taskId);
      deleteTaskMutation.mutate(confirmDelete.taskId);
      setConfirmDelete({ show: false, taskId: null });
    } else {
      console.log("No taskId found in confirmDelete");
    }
  }, [confirmDelete.taskId, deleteTaskMutation]);

  if (!groupId)
    return (
      <p className="px-6 py-4 text-sm text-gray-500">Select a group first</p>
    );
  if (isLoading)
    return <p className="px-6 py-4 text-sm text-gray-500">Loading tasks...</p>;
  if (isError)
    return (
      <p className="px-6 py-4 text-sm text-red-500">Failed to load tasks</p>
    );
  const columnWidths = {
    task: "w-95",
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
    <div className="overflow-x-auto">
      <div className="w-[50vw] min-w-max">
        <div className="flex bg-[#D2C1B6] text-[0.6em] border-b border-gray-200 ">
          <div
            className={`${columnWidths.task} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Task
          </div>
          <div
            className={`${columnWidths.pic} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            PIC
          </div>
          <div
            className={`${columnWidths.status} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center `}
          >
            Status
          </div>
          <div
            className={`${columnWidths.priority} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Priority
          </div>
          <div
            className={`${columnWidths.meetingDate} px-6 py-3 font-semibold text-gray-600 uppercase  items-center flex justify-center`}
          >
            Meeting Date
          </div>
          <div
            className={`${columnWidths.startDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Start Date
          </div>
          <div
            className={`${columnWidths.dueDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Due Date
          </div>
          <div
            className={`${columnWidths.finishDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Finish Date
          </div>
          <div
            className={`${columnWidths.note} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Note
          </div>
          <div
            className={`${columnWidths.action} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
          >
            Action
          </div>
        </div>

        {localTasks?.map((task, index) => {
          const pics = Array.isArray(task.pic) ? task.pic : [];
          const isDragging =
            dragState.index === index && dragState.fromGroup === groupId;
          const isPreview = task._isPreview;
          const isHovered = hoveredRow === task._id;

          return (
            <div
              key={task._id}
              onMouseEnter={() => setHoveredRow(task._id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center hover:bg-none ${
                  isDragging ? "opacity-30 bg-gray-600" : "bg-[#EFECE3]"
                } ${
                  isPreview
                    ? "opacity-50 bg-blue-50 border-2 border-dashed border-blue-300"
                    : ""
                }`}
              >
                {/* Name */}
                <div
                  className={`flex-1 flex items-center ${columnWidths.task} gap-1 px-3 py-3.5 border-b border-gray-100 cursor-grab active:cursor-grabbing`}
                >
                  <button
                    onClick={() =>
                      setOpenSubtasks((prev) => ({
                        ...prev,
                        [task._id]: !prev[task._id],
                      }))
                    }
                    className={`p-0.5 rounded transition-all ${
                      task.subtask?.length || isHovered
                        ? "opacity-100 hover:bg-gray-200"
                        : "opacity-0"
                    }`}
                  >
                    {openSubtasks[task._id] ? (
                      <ChevronDown className="w-4 h-4 text-gray-700" />
                    ) : (
                      <ChevronRight
                        className={`w-4 h-4 ${
                          task.subtask?.length
                            ? "text-gray-700"
                            : "text-gray-400"
                        }`}
                      />
                    )}
                  </button>
                  {/* <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  /> */}
                  {editingField?.taskId === task._id &&
                  editingField?.field === "nama" ? (
                    <input
                      type="text"
                      className="text-sm border text-black border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 cursor-text"
                      value={editedValue}
                      autoFocus
                      onChange={(e) => setEditedValue(e.target.value)}
                      onBlur={() =>
                        handleFieldEdit(task._id, "nama", editedValue)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleFieldEdit(task._id, "nama", editedValue);
                        if (e.key === "Escape") setEditingField(null);
                      }}
                    />
                  ) : (
                    <span
                      className="text-[0.8em] truncate text-gray-700 hover:bg-gray-100 px-1 rounded cursor-text"
                      onClick={() => {
                        setEditingField({ taskId: task._id, field: "nama" });
                        setEditedValue(task.nama);
                      }}
                    >
                      {task.nama}
                    </span>
                  )}
                </div>
                {/* PIC */}
                <div className="flex items-center gap-1 relative group">
                  {task.pic && task.pic.length > 0 && (
                    <div className="flex -space-x-3">
                      {task.pic.slice(0, 3).map((picUser, idx) => (
                        <div
                          key={idx}
                          className="relative cursor-pointer hover:z-10"
                          title={picUser.email || "PIC"}
                        >
                          <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {picUser.username
                              ? picUser.username.substring(0, 2).toUpperCase()
                              : "?"}
                          </div>
                          <button
                            onClick={() =>
                              handleRemovePic(task._id, picUser._id)
                            }
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}

                      {task.pic.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 cursor-pointer">
                          +{task.pic.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {task.pic && task.pic.length > 0 && (
                    <div className="absolute top-8 left-0 hidden group-hover:flex bg-white shadow-lg rounded-lg p-2 z-50">
                      <div className="flex gap-2">
                        {task.pic.map((picUser, idx) => (
                          <div key={idx} className="relative group/avatar">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold cursor-pointer">
                              {picUser.username
                                ? picUser.username.substring(0, 2).toUpperCase()
                                : "?"}
                            </div>
                            <div className="absolute top-7 left-1/2 -translate-x-1/2 hidden group-hover/avatar:flex bg-gray-800 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap pointer-events-none">
                              <div className="text-center">
                                <p className="font-semibold">
                                  {picUser.username}
                                </p>
                                <p className="text-gray-300">{picUser.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {showPicInput === task._id ? (
                    <input
                      type="email"
                      placeholder="email@example.com"
                      className="w-40 px-2 py-1 text-xs text-black border border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={picEmail}
                      onChange={(e) => setPicEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAssignPic(task._id);
                        if (e.key === "Escape") {
                          setPicEmail("");
                          setShowPicInput(null);
                        }
                      }}
                      onBlur={() => {
                        if (picEmail.trim()) {
                          handleAssignPic(task._id);
                        } else {
                          setPicEmail("");
                          setShowPicInput(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setShowPicInput(task._id)}
                      className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      title="Assign PIC"
                    >
                      <UserPlus className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                    </button>
                  )}
                </div>

                {/* Status */}
                <div
                  className={`${columnWidths.status} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`status-${task._id}`] = el)
                    }
                    className="px-3 py-1.5 text-[0.8em] font-semibold rounded-full bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200"
                    onClick={() =>
                      setActivePopup({ taskId: task._id, field: "status" })
                    }
                  >
                    {task.status}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "status" && (
                      <PopupSelect
                        value={task.status}
                        options={STATUS_OPTIONS}
                        onChange={(value) =>
                          handlePopupChange(task._id, "status", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current: buttonRefs.current[`status-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Priority */}
                <div
                  className={`${columnWidths.priority} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`priority-${task._id}`] = el)
                    }
                    className={`px-3 py-1 text-[0.8em] font-medium rounded-full cursor-pointer hover:bg-gray-200 ${
                      task.priority === "Urgent"
                        ? "text-red-700 bg-red-200"
                        : task.priority === "High"
                        ? "text-orange-800 bg-orange-200"
                        : task.priority === "Medium"
                        ? "text-blue-800 bg-blue-200"
                        : "text-gray-800 bg-gray-200"
                    }`}
                    onClick={() =>
                      setActivePopup({ taskId: task._id, field: "priority" })
                    }
                  >
                    {task.priority}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "priority" && (
                      <PopupSelect
                        value={task.priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(value) =>
                          handlePopupChange(task._id, "priority", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current: buttonRefs.current[`priority-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Meeting Date */}
                <div
                  className={`${columnWidths.meetingDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`meeting_date-${task._id}`] = el)
                    }
                    className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={() =>
                      setActivePopup({
                        taskId: task._id,
                        field: "meeting_date",
                      })
                    }
                  >
                    {task.meeting_date
                      ? new Date(task.meeting_date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Set date"}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "meeting_date" && (
                      <DatePickerPopup
                        value={task.meeting_date}
                        onChange={(value) =>
                          handlePopupChange(task._id, "meeting_date", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current:
                            buttonRefs.current[`meeting_date-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Start Date */}
                <div
                  className={`${columnWidths.startDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`start_date-${task._id}`] = el)
                    }
                    className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={() =>
                      setActivePopup({
                        taskId: task._id,
                        field: "start_date",
                      })
                    }
                  >
                    {task.start_date
                      ? new Date(task.start_date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Set date"}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "start_date" && (
                      <DatePickerPopup
                        value={task.start_date}
                        onChange={(value) =>
                          handlePopupChange(task._id, "start_date", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current: buttonRefs.current[`start_date-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Due Date */}
                <div
                  className={`${columnWidths.dueDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`due_date-${task._id}`] = el)
                    }
                    className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={() =>
                      setActivePopup({ taskId: task._id, field: "due_date" })
                    }
                  >
                    {task.due_date
                      ? new Date(task.due_date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Set date"}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "due_date" && (
                      <DatePickerPopup
                        value={task.due_date}
                        onChange={(value) =>
                          handlePopupChange(task._id, "due_date", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current: buttonRefs.current[`due_date-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Finish Date */}
                <div
                  className={`${columnWidths.finishDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) =>
                      (buttonRefs.current[`finish_date-${task._id}`] = el)
                    }
                    className="text-[0.8em] text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                    onClick={() =>
                      setActivePopup({ taskId: task._id, field: "finish_date" })
                    }
                  >
                    {task.finish_date
                      ? new Date(task.finish_date).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Set date"}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "finish_date" && (
                      <DatePickerPopup
                        value={task.finish_date}
                        onChange={(value) =>
                          handlePopupChange(task._id, "finish_date", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current:
                            buttonRefs.current[`finish_date-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Keterangan */}
                <div
                  className={`${columnWidths.note} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <span
                    ref={(el) => {
                      buttonRefs.current[`note-${task._id}`] = el;
                    }}
                    className={`px-3 py-1.5 text-[0.8em] w-full text-center fit-text whitespace-nowrap flex justify-center items-center font-semibold rounded-full cursor-pointer ${
                      task.note === "Planning"
                        ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        : task.note === "Uncomplete"
                        ? "text-red-100 bg-red-900 hover:bg-red-400"
                        : task.note === "Completed - On Time"
                        ? "text-green-700 bg-green-100 hover:bg-green-200"
                        : task.note === "Completed - Overdue"
                        ? "text-amber-700 bg-orange-100 hover:bg-amber-200"
                        : "text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
                    }`}
                    onClick={() =>
                      setActivePopup({ taskId: task._id, field: "note" })
                    }
                  >
                    {task.note}
                  </span>
                  {activePopup?.taskId === task._id &&
                    activePopup?.field === "note" && (
                      <PopupSelect
                        value={task.note}
                        options={NOTE_OPTIONS}
                        onChange={(value) =>
                          handlePopupChange(task._id, "note", value)
                        }
                        onClose={() => setActivePopup(null)}
                        buttonRef={{
                          current: buttonRefs.current[`note-${task._id}`],
                        }}
                      />
                    )}
                </div>
                {/* Action Button */}
                <div
                  className={`${columnWidths.action} gap-2 px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                >
                  <button
                    className="bg-gray-100 rounded-xl p-1 text-black font-medium text-[0.7em] w-18 hover:bg-gray-200"
                    onClick={() => setOpenDialog(true)}
                  >
                    Detail
                  </button>
                  <Trash2
                    className="text-red-500 hover:text-red-800 w-4 h-4 cursor-pointer"
                    onClick={() => handleDeleteTask(task._id)}
                  />
                  <DialogDetail
                    show={openDialog}
                    onClose={() => setOpenDialog(false)}
                  />
                </div>
              </div>
              <ConfirmDialog
                show={confirmDelete.show}
                onClose={() => setConfirmDelete({ show: false, taskId: null })}
                onConfirm={confirmDeleteTask}
                title="Delete task"
                message="Are you sure want to delete this task? this action can't be undo"
              />

              {openSubtasks[task._id] && (
                <div className="border-b border-gray-100">
                  <SubtaskList
                    taskId={task._id}
                    subtasks={task.subtask || []}
                    groupId={groupId}
                  />
                </div>
              )}
            </div>
          );
        })}

        {localTasks?.length === 0 && (
          <div
            className="px-6 py-3 border-b border-gray-100"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
              const draggedTaskId = e.dataTransfer.getData("taskId");
              const isSameGroup = sourceGroupId === groupId;

              if (!isSameGroup) {
                const dropEvent = new CustomEvent("taskDrop", {
                  detail: {
                    taskId: draggedTaskId,
                    sourceGroupId,
                    targetGroupId: groupId,
                    targetIndex: 0,
                  },
                });
                document.dispatchEvent(dropEvent);
              }
            }}
          >
            {showAddTask ? (
              <div className="flex items-center gap-3">
                <div className="w-5" />
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  disabled
                />
                <input
                  type="text"
                  placeholder="Nama task"
                  className="flex-1 px-3 py-1.5 text-[0.8em] border text-black border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask();
                    if (e.key === "Escape") {
                      setTaskName("");
                      setShowAddTask(false);
                    }
                  }}
                  onBlur={() =>
                    taskName.trim() ? handleAddTask() : setShowAddTask(false)
                  }
                />
              </div>
            ) : (
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 text-[0.8em] text-gray-500 hover:text-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            )}
          </div>
        )}

        {localTasks?.length > 0 &&
          (showAddTask ? (
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
              <div className="w-5" />
              {/* <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
                disabled
              /> */}
              <input
                type="text"
                placeholder="Nama task"
                className="flex-1 px-3 py-1.5 text-[0.8em] border text-black border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                  if (e.key === "Escape") {
                    setTaskName("");
                    setShowAddTask(false);
                  }
                }}
                onBlur={() =>
                  taskName.trim() ? handleAddTask() : setShowAddTask(false)
                }
              />
            </div>
          ) : (
            <div
              className="px-6 py-3 border-b border-gray-100"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                const sourceGroupId = e.dataTransfer.getData("sourceGroupId");
                const draggedTaskId = e.dataTransfer.getData("taskId");
                const isSameGroup = sourceGroupId === groupId;

                if (!isSameGroup) {
                  const dropEvent = new CustomEvent("taskDrop", {
                    detail: {
                      taskId: draggedTaskId,
                      sourceGroupId,
                      targetGroupId: groupId,
                      targetIndex: localTasks?.length || 0,
                    },
                  });
                  document.dispatchEvent(dropEvent);
                }
              }}
            >
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 text-[0.8em] text-gray-500 hover:text-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TaskList;
