import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTask } from "../../hook/useTask";
import { useMember } from "../../hook/useMember";
import SubtaskList from "../Subtask/SubTaskList";
import PopupSelect from "./PopupSelect";
import DatePickerPopup from "./DatePickerPopup";
import { useStatusSync } from "../../hook/useStatusSync";
import { useSubTask } from "../../hook/useSubTask";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  UserPlus,
  X,
  Trash2,
  Search,
} from "lucide-react";
import DialogDetail from "../Task/DialogDetail";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

const TaskList = ({ groupId, workspaceId, hasActiveFilters, filters = {} }) => {
  const { user: currentUser } = useContext(AuthContext);
  // Tambahkan state untuk popup PIC
  const [picPopup, setPicPopup] = useState({ show: false, taskId: null });
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${API_BASE_URL}/uploads/users/${photoPath}`;
  };
  const {
    taskByGroup,
    addTaskMutation,
    updateTaskMutation,
    updateTaskPositionsMutation,
    assignPicMutation,
    removePicMutation,
    deleteTaskMutation,
  } = useTask(groupId, filters);
  const { membersWorkspaceQuery } = useMember("workspace", workspaceId);
  const { updateSubTaskMutation } = useSubTask(null, groupId);
  const { data, isLoading, isError } = taskByGroup;
  const { syncTasktoSubtasks, syncSubtasktoTask } = useStatusSync();
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
  const [confirmDeletePIC, setConfirmDeletePIC] = useState({
    show: false,
    taskId: null,
    userId: null,
  });
  const [hoveredRow, setHoveredRow] = useState(null);
  const buttonRefs = useRef({});
  const STATUS_OPTIONS = [
    "To Do",
    "In Progress",
    "Done-In The review",
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
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const tableEndRef = useRef(null);
  const headerRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }, []);
  const getSortedTasks = useCallback(() => {
    if (!sortConfig.key || !localTasks) return localTasks;

    const sorted = [...localTasks].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === "nama") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      } else if (
        ["start_date", "due_date", "finish_date", "meeting_date"].includes(
          sortConfig.key
        )
      ) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortConfig.key === "priority") {
        const priorityOrder = { Low: 1, Medium: 2, High: 3, Urgent: 4 };
        aValue = priorityOrder[aValue] || 0;
        bValue = priorityOrder[bValue] || 0;
      } else if (sortConfig.key === "status") {
        const statusOrder = {
          "To Do": 1,
          "In Progress": 2,
          Hold: 3,
          Blocked: 4,
          Done: 5,
        };
        aValue = statusOrder[aValue] || 0;
        bValue = statusOrder[bValue] || 0;
      } else if (sortConfig.key === "pic") {
        aValue = a.pic?.length || 0;
        bValue = b.pic?.length || 0;
      }
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [localTasks, sortConfig]);
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg
          className="w-3 h-3 ml-1 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 ml-1 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };
  const displayTasks = getSortedTasks();

  // Ganti fungsi handleAssignPic
  const handleAssignPic = useCallback(
    (taskId, email) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) return;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        toast.error("Invalid email format");
        return;
      }

      assignPicMutation.mutate(
        { taskId, picEmail: trimmedEmail },
        {
          onSuccess: () => {
            setPicPopup({ show: false, taskId: null });
          },
        }
      );
    },
    [assignPicMutation]
  );

  const handleDeletePICTask = useCallback((taskId, userId) => {
    setConfirmDeletePIC({ show: true, taskId: taskId, userId: userId });
  }, []);

  const confirmDeleteTaskPIC = useCallback(() => {
    if (confirmDeletePIC.taskId && confirmDeletePIC.userId) {
      removePicMutation.mutate({
        taskId: confirmDeletePIC.taskId,
        userId: confirmDeletePIC.userId,
      });
      setConfirmDelete({ show: false, taskId: null, userId: null });
    } else {
      console.log("no taskid or userId found in confirmaationdelete");
    }
  }, [confirmDeletePIC.taskId, setConfirmDeletePIC.userId, removePicMutation]);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );
    if (tableEndRef.current) {
      observer.observe(tableEndRef.current);
    }
    return () => {
      if (tableEndRef.current) {
        observer.unobserve(tableEndRef.current);
      }
    };
  }, []);

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

  const handlePopupChange = useCallback(
    (taskId, field, value) => {
      const task = localTasks.find((t) => t._id === taskId);
      if (!task) {
        updateTaskMutation.mutate({ taskId, data: { [field]: value } });
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
      // if(field === "status" && task.subtask && task.subtask.length > 0){
      //   syncTasktoSubtasks(value, task.subtask, updateSubTaskMutation)
      // }
      updateTaskMutation.mutate({ taskId, data: updateData });
      setActivePopup(null);
    },
    // [localTasks, updateTaskMutation, updateSubTaskMutation, syncTasktoSubtasks]
    [localTasks, updateTaskMutation]
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
    setConfirmDelete({ show: true, taskId: taskId });
  }, []);
  const confirmDeleteTask = useCallback(() => {
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
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-20 w-64"
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
            const photoUrl = user.photo ? getPhotoUrl(user.photo) : null;

            return (
              <button
                key={user._id || user.email}
                onClick={() => onSelect(user.email)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-gray-100 last:border-b-0 flex items-center gap-2"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs"
                  style={{ display: photoUrl ? "none" : "flex" }}
                >
                  {user.username?.substring(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-black">
                    {user.username}
                  </div>
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

  const isAuthorized = () => {
    if (!currentUser || !membersWorkspaceQuery.data) return false;

    // Cari membership current user dalam workspace members
    const userMembership = membersWorkspaceQuery.data.members?.find(
      (member) =>
        member.user?._id === currentUser._id ||
        member.user?._id === currentUser.id
    );

    if (!userMembership) return false;

    const allowedRoles = ["admin", "project_manager"];
    return allowedRoles.includes(userMembership.role);
  };

  return (
      <div className="overflow-auto">
        <ConfirmDialog
          show={confirmDeletePIC.show}
          onClose={() =>
            setConfirmDeletePIC({ show: false, taskId: null, userId: null })
          }
          onConfirm={confirmDeleteTaskPIC}
          title="Delete PIC"
          message="Are you sure want to delete this PIC? this action can't be undo"
        />
        <div className="w-[50vw] min-w-max max-h-[90vh]">
          <div
            ref={headerRef}
            className={`flex sticky top-0 bg-[#D2C1B6] text-[0.6em] border-b border-gray-200 z-30 transition-all duration-200 `}
          >
            {/* Task Column - Sortable */}
            <div
            className={`${columnWidths.task}  sticky left-0 top-0 z-50 px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] bg-[#D2C1B6]  transition-colors`}
              onClick={() => handleSort("nama")}
            >
              <span className="flex items-center">
                Task
                <SortIcon columnKey="nama" />
              </span>
            </div>

            {/* PIC Column - Sortable by count */}
            <div
              className={`${columnWidths.pic} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("pic")}
            >
              <span className="flex items-center">
                PIC
                <SortIcon columnKey="pic" />
              </span>
            </div>

            {/* Status Column - Sortable */}
            <div
              className={`${columnWidths.status} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("status")}
            >
              <span className="flex items-center">
                Status
                <SortIcon columnKey="status" />
              </span>
            </div>

            {/* Priority Column - Sortable */}
            <div
              className={`${columnWidths.priority} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("priority")}
            >
              <span className="flex items-center">
                Priority
                <SortIcon columnKey="priority" />
              </span>
            </div>

            {/* Meeting Date Column - Sortable */}
            <div
              className={`${columnWidths.meetingDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("meeting_date")}
            >
              <span className="flex items-center">
                Meeting Date
                <SortIcon columnKey="meeting_date" />
              </span>
            </div>

            {/* Start Date Column - Sortable */}
            <div
              className={`${columnWidths.startDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("start_date")}
            >
              <span className="flex items-center">
                Start Date
                <SortIcon columnKey="start_date" />
              </span>
            </div>

            {/* Due Date Column - Sortable */}
            <div
              className={`${columnWidths.dueDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("due_date")}
            >
              <span className="flex items-center">
                Due Date
                <SortIcon columnKey="due_date" />
              </span>
            </div>

            {/* Finish Date Column - Sortable */}
            <div
              className={`${columnWidths.finishDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("finish_date")}
            >
              <span className="flex items-center">
                Finish Date
                <SortIcon columnKey="finish_date" />
              </span>
            </div>

            {/* Note Column - Sortable */}
            <div
              className={`${columnWidths.note} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
              onClick={() => handleSort("note")}
            >
              <span className="flex items-center">
                Note
                <SortIcon columnKey="note" />
              </span>
            </div>
            <div
              className={`${columnWidths.action} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
            >
              Action
            </div>
          </div>
          {/*  "No results" section to use searchQuery instead of debouncedSearch */}
          {displayTasks?.length === 0 && hasActiveFilters && (
            <div className="px-6 py-8 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No tasks found with current filters</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your filter criteria
              </p>
            </div>
          )}
          {displayTasks?.map((task, index) => {
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
                  a
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
                    className={`flex-1 flex items-center ${
                      columnWidths.task
                    } gap-1 px-3 py-3.5 border-b border-gray-100 cursor-grab active:cursor-grabbing sticky left-0 bg-[#EFECE3] z-20 ${
                      isDragging ? "bg-gray-600" : ""
                    } ${isPreview ? "bg-blue-50" : ""}`}
                  >
                    <button
                      onClick={() =>
                        setOpenSubtasks((prev) => ({
                          ...prev,
                          [task._id]: !prev[task._id],
                        }))
                      }
                      className={`p-0.5 rounded transition-all shrink-0 ${
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
                        className="text-[0.8em] text-gray-700 hover:bg-gray-100 px-1 rounded cursor-text break-all line-clamp-10 flex-1 min-w-0"
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
                  <div
                    className={`${columnWidths.pic} flex items-center justify-center gap-1 relative`}
                  >
                    {task.pic && task.pic.length > 0 && (
                      <div className="flex -space-x-2">
                        {task.pic.slice(0, 3).map((picUser, idx) => {
                          const photoUrl = picUser.photo
                            ? getPhotoUrl(picUser.photo)
                            : null;

                          return (
                            <div
                              key={idx}
                              className="relative group hover:z-20 z-10 transition-all cursor-pointer"
                            >
                              {/* Gunakan foto jika ada */}
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={picUser.username}
                                  className="w-7 h-7 rounded-full object-cover border-2 border-white"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                                  {picUser.username
                                    ?.substring(0, 2)
                                    .toUpperCase() || "?"}
                                </div>
                              )}

                              {/* Tooltip untuk user info */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-20">
                                <div className="font-medium">
                                  {picUser.username}
                                </div>
                                <div className="text-gray-300">
                                  {picUser.email}
                                </div>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                              </div>

                              <button
                                onClick={() =>
                                  handleDeletePICTask(task._id, picUser._id)
                                }
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} className="text-white" />
                              </button>
                            </div>
                          );
                        })}

                        {task.pic.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                            +{task.pic.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tombol tambah PIC */}
                    <button
                      ref={(el) => (buttonRefs.current[`pic-${task._id}`] = el)}
                      onClick={() =>
                        setPicPopup({ show: true, taskId: task._id })
                      }
                      className="w-7 h-7 rounded-full border-2 text-gray-500 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      title="Assign PIC"
                    >
                      <UserPlus size={14} />
                    </button>

                    {picPopup.show && picPopup.taskId === task._id && (
                      <PicPopup
                        members={membersWorkspaceQuery.data?.members || []}
                        onSelect={(email) => handleAssignPic(task._id, email)}
                        onClose={() => setPicPopup({ show: false, taskId: null })}
                        buttonRef={{
                          current: buttonRefs.current[`pic-${task._id}`],
                        }}
                      />
                    )}
                  </div>
                  {/* Status */}
                  <div
                    className={`${columnWidths.status} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    {/* Cek jika status adalah "Done-In The review" */}
                  {task.status === "Done-In The review" ? (
                    <div className="flex items-center space-x-2">
                      {/* Tampilkan status text dengan ukuran lebih kecil */}
                      <span className="px-2 py-1 text-[0.7em] font-semibold rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
                        {task.status}
                      </span>

                      {/* Tombol hanya muncul jika user authorized */}
                      {isAuthorized() && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() =>
                              handlePopupChange(task._id, "status", "Done")
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors border border-green-300 text-xs"
                            title="Approve and set status to Done"
                          >
                            ✓
                          </button>

                          <button
                            onClick={() =>
                              handlePopupChange(
                                task._id,
                                "status",
                                "In Progress"
                              )
                            }
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors border border-red-300 text-xs"
                            title="Reject and set status to In Progress"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Tampilkan status biasa untuk status lainnya */
                    <>
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
                    </>
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
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "Set date & time"}
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
                          showTimeSelect={true}
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
                  <div className="w-40 px-6 py-3.5 border-b border-gray-100 items-center flex justify-center">
                    <div className="w-40 px-6 py-3.5 gap-2 border-b border-gray-100 items-center flex justify-center">
                      <button
                        className="bg-gray-100 rounded-xl p-1 text-black font-medium text-xs w-18 hover:bg-gray-200"
                        onClick={() => setOpenDialog({ open: true, task: task })}
                      >
                        Detail
                      </button>
                      <div className="bg-gray-100 rounded-lg p-1 pl-2 pr-2 font-medium hover:bg-gray-200">
                        <Trash2
                          className="text-red-500 hover:text-red-800 w-4 h-4 cursor-pointer"
                          onClick={() => handleDeleteTask(task._id)}
                        />
                      </div>
                    </div>
                    {openDialog.open && (
                      <DialogDetail
                        draggable
                        show={openDialog.open}
                        onClose={() => setOpenDialog({ open: false, task: null })}
                        taskId={openDialog.task?._id}
                        taskData={openDialog.task}
                      />
                    )}
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
                      workspaceId={workspaceId}
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
          <div ref={tableEndRef} className="h-1" />
        </div>
      </div>
  );
};
export default TaskList;
