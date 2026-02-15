import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Pause,
  OctagonMinus,
  AlertCircle,
  FlagTriangleRight,
  PauseCircle,
  CloudCog,
} from "lucide-react";
import { useAuth } from "../../hook/useContext";
import { useMyWork } from "../../hook/useTask";
import { usemyWorkAgendaMeeting } from "../../hook/useTask";
import { motion, AnimatePresence } from "framer-motion";
import { useLog, useLogId } from "../../hook/useLog";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "../../components/ui/NotificationBell";
import { useContext } from "react";

const MyWorkspaces = () => {
  const tooltipRef = useRef(null);
  const { user } = useAuth();
  const { data, isLoading, refetch, error } = useMyWork();

  const { onlineUserId, allUser } = useContext(AuthContext);
  const {
    data: dataAgenda,
    isLoading: isLoadingAgenda,
    error: errorMyagenda,
  } = usemyWorkAgendaMeeting();

  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const navigate = useNavigate();
  const { logsById } = useLogId(user?._id);
  const [expandedStatuses, setExpandedStatuses] = useState({
    done: true,
    todo: true,
    inProgress: true,
    holdBlocked: true,
  });
  const formatActivityTime = (dateString) => {
    const activityDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return activityDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  const getActivityIcon = (action) => {
    const iconMap = {
      CREATE_TASK: {
        icon: <Circle className="w-4 h-4" />,
        color: "text-green-400 bg-green-400/10",
      },
      UPDATE_TASK: {
        icon: <Clock className="w-4 h-4" />,
        color: "text-blue-400 bg-blue-400/10",
      },
      UPDATE_SUBTASK: {
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: "text-purple-400 bg-purple-400/10",
      },
      DELETE_TASK: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-red-400 bg-red-400/10",
      },
    };
    return (
      iconMap[action] || {
        icon: <Circle className="w-4 h-4" />,
        color: "text-gray-400 bg-gray-400/10",
      }
    );
  };
  const formatActivityDescription = (log) => {
    const { action, description, before, after } = log;
    if (action === "CREATE_TASK") {
      return {
        main: "Created task",
        detail: log.task.nama,
        change: null,
      };
    }

    if (action === "UPDATE_TASK" || action === "UPDATE_SUBTASK") {
      if (before?.status && after?.status) {
        return {
          main:
            action === "UPDATE_TASK"
              ? "Changed status"
              : "Updated subtask status",
          detail: log.task?.nama || "-",
          change: `${before.status} → ${after.status}`,
        };
      }
      if (before?.priority && after?.priority) {
        return {
          main: "Changed priority",
          detail: log.task.nama,
          change: `${before.priority} → ${after.priority}`,
        };
      }
      if (before?.nama && after?.nama) {
        return {
          main: "Renamed",
          detail: after.nama,
          change: `from "${before.nama}"`,
        };
      }
      if (after?.due_date) {
        return {
          main: "Updated due date",
          detail: log.task?.nama || "-",
          change: new Date(after.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
      }
    }
    return {
      main: description || action.replace(/_/g, " ").toLowerCase(),
      detail: log.task?.nama || "-",
      change: null,
    };
  };
  const filterByDate = (tasks, period) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    if (period === "all") return tasks;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      switch (period) {
        case "today":
          const taskDate = new Date(
            dueDate.getFullYear(),
            dueDate.getMonth(),
            dueDate.getDate(),
          );
          return taskDate.getTime() === today.getTime();
        case "month":
          return (
            dueDate.getMonth() === now.getMonth() &&
            dueDate.getFullYear() === now.getFullYear()
          );
        case "year":
          return dueDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const allTasksAndSubtasks = useMemo(() => {
    if (!data?.tasks) return [];
    const filteredTasks = filterByDate(data.tasks, selectedPeriod);
    return filteredTasks.flatMap((task) => {
      const mainTask = {
        id: task._id,
        name: task.nama,
        dueDate: task.due_date,
        isSubtask: false,
        status: task.status,
        projectId: task.projectId,
      };
      if (!task.subtask || !Array.isArray(task.subtask)) {
        return [mainTask];
      }
      const subtasksWithDate = task.subtask.map((st) => ({
        ...st,
        due_date: st.due_date || task.due_date,
      }));
      const filteredSubTasks = filterByDate(subtasksWithDate, selectedPeriod);
      const subtasks = filteredSubTasks.map((st) => ({
        id: st._id,
        name: st.nama,
        dueDate: st.due_date,
        isSubtask: true,
        status: st.status || "To Do",
        projectId: task.projectId,
      }));
      if (filteredSubTasks.length > 0) {
        return [mainTask, ...subtasks];
      }
      return [mainTask];
    });
  }, [data, selectedPeriod]);
  const tasksByStatus = useMemo(() => {
    const statusGroups = {
      todo: [],
      inProgress: [],
      done: [],
      blocked: [],
      hold: [],
    };
    if (!allTasksAndSubtasks) return statusGroups;
    allTasksAndSubtasks.forEach((item) => {
      let statusKey;
      switch (item.status?.toLowerCase()) {
        case "to do":
          statusKey = "todo";
          break;
        case "in progress":
          statusKey = "inProgress";
          break;
        case "done":
          statusKey = "done";
          break;
        case "hold":
          statusKey = "hold";
          break;
        case "blocked":
          statusKey = "blocked";
          break;
        default:
          statusKey = "inProgress";
      }
      if (!statusGroups[statusKey]) {
        statusGroups[statusKey] = [];
      }
      statusGroups[statusKey].push(item);
    });
    return statusGroups;
  }, [allTasksAndSubtasks]);

  // const sortedAssignedTasks = useMemo(() => {
  //     return [...assignedTasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  // }, []);
  const toggleStatus = (status) => {
    setExpandedStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };
  const getPriorityColor = (priority) => {
    const colors = {
      Urgent: "text-red-500 bg-red-500/10",
      High: "text-orange-500 bg-orange-500/10",
      Medium: "text-yellow-500 bg-yellow-500/10",
      Low: "text-green-500 bg-green-500/10",
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      done: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      todo: <Circle className="w-4 h-4 text-gray-400" />,
      inProgress: <Clock className="w-4 h-4 text-blue-500" />,
      hold: <PauseCircle className="w-4 h-4 text-orange-500" />,
      blocked: <OctagonMinus className="w-4 h-4 text-red-500" />,
    };
    return icons[status];
  };

  const getStatusLabel = (status) => {
    const labels = {
      done: "Done",
      todo: "To Do",
      inProgress: "In Progress",
      hold: "Hold",
      blocked: "Blocked",
    };
    return labels[status];
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days`;
  };
  function greeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  }
  const flatList = useMemo(() => {
    if (!data?.tasks) return [];
    const allTasks = data.tasks.flatMap((task) => {
      const subtasks = task.subtask.map((st) => ({
        ...st,
        isSubtask: true,
        parentId: task._id,
        parentName: task.nama,
        due_date: st.due_date || task.due_date,
        workspace: task.workspace,
        project: task.project,
        group: task.group,
        meeting_date: st.meeting_date || task.meeting_date,
      }));
      return [{ ...task, isSubtask: false }, ...subtasks];
    });
    return allTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [data]);
  function splitFormatDate(date) {
    const result = date.replace("T", " ").replace(".000Z", "");
    return result;
  }
  const [activeUserId, setActiveUserId] = useState(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setActiveUserId(null);
      }
    };
    if (activeUserId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeUserId]);
  if (isLoading) return <p>Loading Data ....</p>;
  if (error) return <p>Error ....</p>;
  return (
    <div className="p-2 bg-linear-to-tl from-[#1A3D64] to-[#1D546C] min-h-screen">
      {user && (
        <div className="flex flex-row justify-between mb-6">
          <h1 className="text-2xl text-white font-semibold drop-shadow-lg">
            {greeting()}, {user.username}
          </h1>
          <div className="flex flex-row justify-center items-center gap-4">
            <div className="relative flex gap-4 overflow-x-auto  max-w-70 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent px-2">
              <div className="flex gap-4 min-w-max py-2">
                {Array.isArray(allUser) && allUser.map((u) => {
                  const isUserOnline = Array.isArray(onlineUserId) && onlineUserId.includes(u._id);
                  return (
                    <div key={u._id} className="relative shrink-0" ref={activeUserId === u._id ? tooltipRef : null}>
                      <div
                        onClick={() =>
                          setActiveUserId(activeUserId === u._id ? null : u._id)
                        }
                        className="relative w-10 h-10 cursor-pointer"
                      >
                        {u.photo ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/users/${u.photo}`}
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                            {u.username?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {isUserOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                        )}
                      </div>
                      {activeUserId === u._id && (
                        <div className="fixed top-20 -translate-x-1/5 bg-gray-800 text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap z-99">
                          {u.username}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      )}

      {/* First Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Card 1: Recent Activities */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activities
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {logsById.data?.logs?.map((log) => {
              const activity = formatActivityDescription(log);
              const { icon, color } = getActivityIcon(log.action);
              return (
                <div
                  key={log._id}
                  className="group flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-all duration-200 hover:shadow-lg border border-transparent hover:border-white/10"
                >
                  {/* Icon */}
                  <div
                    className={`${color} p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-200`}
                  >
                    {icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-medium">{activity.main}</span>{" "}
                          <span className="text-blue-400 truncate inline-block max-w-[200px] align-bottom">
                            {activity.detail}
                          </span>
                        </p>
                        {activity.change && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                              {activity.change}
                            </span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-white">
                            {formatActivityTime(log.createdAt)}
                          </p>
                          <span className="text-gray-600">•</span>
                          <p className="text-xs text-gray-500">
                            {log.user.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!logsById.data?.logs || logsById.data.logs.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
        {/* Card 2: Agenda */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agenda - Meeting
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {isLoadingAgenda ? (
              <p className="text-center text-gray-400">Loading agenda...</p>
            ) : errorMyagenda ? (
              <p className="text-center text-red-400">Error loading agenda</p>
            ) : dataAgenda && dataAgenda.length > 0 ? (
              dataAgenda.map((agenda) => (
                <div
                  key={agenda._id}
                  className="p-3 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/5 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {agenda.type === "subtask"
                          ? `↳ ${agenda.nama}`
                          : agenda.nama}
                      </p>
                      {agenda.type === "subtask" && agenda.parentTask && (
                        <p className="text-xs text-gray-400 mt-1">
                          Parent Task: {agenda.parentTask.nama}
                        </p>
                      )}
                      <p className="text-xs font-bold text-blue-400 mt-1">
                        {agenda.workspace}
                      </p>
                    </div>
                    {agenda.meeting_link && (
                      <button
                        className="bg-blue-700 hover:bg-blue-500 rounded-xl px-3 py-2 text-xs text-white transition-all duration-200 shrink-0 ml-2"
                        onClick={() =>
                          (window.location.href = agenda.meeting_link)
                        }
                      >
                        Join Meet
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mb-1">
                    {agenda.group} -{" "}
                    {agenda.meeting_date
                      ? new Date(agenda.meeting_date).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                      : "No meeting date"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Project: {agenda.project}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming meetings</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card 3: Tasks by Status */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-3">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedPeriod === "all"
                ? "bg-primary text-white shadow-lg shadow-blue-500/50"
                : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedPeriod("today")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedPeriod === "today"
                ? "bg-primary text-white shadow-lg shadow-blue-500/50"
                : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedPeriod("month")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedPeriod === "month"
                ? "bg-primary text-white shadow-lg shadow-blue-500/50"
                : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedPeriod("year")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${selectedPeriod === "year"
                ? "bg-primary text-white shadow-lg shadow-blue-500/50"
                : "text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                }`}
            >
              Year
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {Object.entries(tasksByStatus).map(([status, items]) => (
              <div
                key={status}
                className="border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-lg"
              >
                <button
                  onClick={() => toggleStatus(status)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium text-white">
                      {getStatusLabel(status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({items.length})
                    </span>
                  </div>
                  {expandedStatuses[status] ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedStatuses[status] && (
                  <div className="p-2 space-y-1 bg-black/20 backdrop-blur-sm">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/project/${item.projectId}`)}
                        className="p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 mt-1">
                            {item.isSubtask ? "↳" : "•"}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-white">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                Due: {formatDueDate(item.dueDate)}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-gray-300 border border-white/10">
                                {getStatusLabel(status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Assigned to Me */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
          <h2 className="text-lg font-semibold text-white mb-4">
            Assigned to Me
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {flatList.map((task) => (
              <div
                key={task._id}
                className="p-3 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all duration-200 border border-white/10 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-xs text-black-500 mt-1">
                      {task.isSubtask ? "↳" : "•"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        {task.nama}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`text-xs flex flex-row gap-1 px-2 py-1 font-bold rounded uppercase ${getPriorityColor(
                            task.priority,
                          )}`}
                        >
                          <FlagTriangleRight className="w-4 h-4" />
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDueDate(task.due_date)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm text-gray-300 border border-white/10 ${task.status === "To Do"
                            ? "bg-gray-600 opacity-85 text-white"
                            : task.status === "Done"
                              ? "bg-green-600 opacity-85 text-white"
                              : task.status === "Hold"
                                ? "bg-black opacity-85 text-white"
                                : task.status === "Planing"
                                  ? "bg-blue-600 opacity-85 text-white"
                                  : task.status === "Blocked"
                                    ? "bg-red-600 opacity-85 text-white"
                                    : ""
                            }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWorkspaces;
