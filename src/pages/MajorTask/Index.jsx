import { useState, useRef, useEffect } from "react";
import {
  useProjectWithMajorTask,
  useMajorTaskByProject,
} from "../../hook/useTask";
import { useMember } from "../../hook/useMember";
import { Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubtaskList from "../Subtask/SubTaskList";
import DialogDetail from "../Task/DialogDetail";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import toast from "react-hot-toast";
import NotificationBell from "../../components/ui/NotificationBell";
import { X } from "lucide-react";
import TaskBadges from "../Task/TaskBadges";
// ==================== PROJECT SELECTION DIALOG ====================
const ProjectSelectionDialog = ({ projects, onSelect, isLoading, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects =
    projects?.filter((project) => {
      const projectName = project.nama?.toLowerCase() || "";
      const workspaceName = project.workspaceNama?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      return projectName.includes(query) || workspaceName.includes(query);
    }) || [];
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-7xl w-full mx-4 border border-white/10">
        <div className="flex flex-row justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Select Project
            </h2>
            <p className="text-white/60 text-sm">
              Choose a project to view and manage major tasks
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search project or workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            </div>

            {/* Close Button */}
            <button
              className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 w-8 h-8 flex items-center justify-center"
              onClick={onClose}
            >
              <span className="text-white text-sm">✕</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="text-white/60 text-center py-8 col-span-1 md:col-span-2">
              Loading projects...
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <button
                key={project._id}
                onClick={() => onSelect(project._id)}
                className="w-full text-left bg-linear-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/40 hover:to-purple-500/40 rounded-lg p-4 border border-white/10 hover:border-white/30 transition-all group"
              >
                <div className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-white font-semibold">{project.nama}</p>
                    <p className="text-white/60 text-sm">
                      {project.workspaceNama || "N/A"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-white/60 text-center py-8 col-span-1 md:col-span-2">
              {searchQuery
                ? `No projects found for "${searchQuery}"`
                : "No projects available"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MajorTaskPage = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [openDialog, setOpenDialog] = useState({ open: false, task: null });
  const navigate = useNavigate();
  const [showProjectDialog, setShowProjectDialog] = useState(true);
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedDivisionName, setSelectedDivisionName] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [noteFilter, setNoteFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced filters
  const [debouncedFilters, setDebouncedFilters] = useState({});

  const { data: projects, isLoading: loadingProject } =
    useProjectWithMajorTask();

  const { data: tasks, isLoading: loadingTask } =
    useMajorTaskByProject(selectedProjectId);

  const { membersWorkspaceQuery } = useMember("workspace", selectedWorkspaceId);

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return `${API_BASE_URL}/uploads/users/${photoPath}`;
  };

  useEffect(() => {
    if (selectedProjectId && projects) {
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      if (selectedProject?.workspace?._id) {
        setSelectedWorkspaceId(selectedProject.workspace._id);
      }
    }
  }, [selectedProjectId, projects]);

  // Debounced filters effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        search: searchQuery,
        status: statusFilter,
        priority: priorityFilter,
        type: typeFilter,
        note: noteFilter,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, noteFilter]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setNoteFilter("all");
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    typeFilter !== "all" ||
    noteFilter !== "all";

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const getSortedTasks = () => {
    if (!tasks) return tasks;

    let filtered = [...tasks];

    // Apply filters
    if (debouncedFilters.search) {
      filtered = filtered.filter((task) =>
        task.nama.toLowerCase().includes(debouncedFilters.search.toLowerCase()),
      );
    }

    if (debouncedFilters.status && debouncedFilters.status !== "all") {
      filtered = filtered.filter(
        (task) => task.status === debouncedFilters.status,
      );
    }

    if (debouncedFilters.priority && debouncedFilters.priority !== "all") {
      filtered = filtered.filter(
        (task) => task.priority === debouncedFilters.priority,
      );
    }

    if (debouncedFilters.type && debouncedFilters.type !== "all") {
      filtered = filtered.filter((task) => task.type === debouncedFilters.type);
    }

    if (debouncedFilters.note && debouncedFilters.note !== "all") {
      filtered = filtered.filter((task) => task.note === debouncedFilters.note);
    }

    // Apply sorting
    if (!sortConfig.key) return filtered;

    const sorted = [...filtered].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle different data types
      if (sortConfig.key === "nama") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      } else if (
        ["start_date", "due_date", "finish_date", "meeting_date"].includes(
          sortConfig.key,
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
  };

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

  const columnWidths = {
    group: "w-95",
    task: "w-95",
    pic: "w-32",
    status: "w-42",
    type: "w-32",
    priority: "w-32",
    scale: "w-20",
    meetingDate: "w-40",
    startDate: "w-40",
    dueDate: "w-40",
    finishDate: "w-40",
    note: "w-50",
    reason: "w-100",
    action: "w-40",
  };

  const isSystemAdmin = currentUser?.isSystemAdmin === true;

  const isWorkspaceMember = () => {
    const members = membersWorkspaceQuery.data?.members;
    if (!members || !currentUser) return false;

    return members.some(
      (member) =>
        member.user?._id === currentUser._id ||
        member.user?._id === currentUser.id,
    );
  };

  const hasAllowedRole = () => {
    const allowedRoles = ["admin", "project_manager", "member", "management"];
    const member = membersWorkspaceQuery.data?.members?.find(
      (m) =>
        m.user?._id === currentUser?._id || m.user?._id === currentUser?.id,
    );

    return allowedRoles.includes(member?.role);
  };

  const canAccess = () => {
    if (isSystemAdmin) return true;
    if (!isWorkspaceMember()) return false;
    return hasAllowedRole();
  };

  if (loadingProject) {
    return (
      <div className="px-6 py-4 text-sm text-gray-500">Loading projects...</div>
    );
  }

  const displayTasks = getSortedTasks();

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    const project = projects.find((p) => p._id === projectId);
    setSelectedProjectName(project?.nama || "");
    setSelectedDivisionName(project?.workspaceNama || "");
    setShowProjectDialog(false);
  };

  const handleCloseProjectDialog = () => {
    setShowProjectDialog(false);
  };

  const STATUS_OPTIONS = [
    "To Do",
    "In Progress",
    "Done",
    "Done-In review",
    "Blocked",
    "Hold",
  ];
  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];
  const TYPE_OPTIONS = ["Major", "Minor"];
  const NOTE_OPTIONS = [
    "Completed - On Time",
    "Completed - Overdue",
    "Completed - Early",
    "Uncomplete",
    "Planning",
  ];

  if (showProjectDialog) {
    return (
      <ProjectSelectionDialog
        projects={projects}
        onSelect={handleSelectProject}
        isLoading={loadingProject}
        onClose={handleCloseProjectDialog}
      />
    );
  }

  return (
    <div className="p-6">
      {!selectedProjectId && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-linear-to-br from-[#1A3D64] to-[#1D546C]  rounded-2xl p-12 border-white/10">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-white" />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">
                No Project Selected
              </h2>
              <p className="text-gray-300 text-sm max-w-md">
                Please select a project to view and manage major tasks
              </p>
            </div>

            {/* Button */}
            <button
              onClick={() => setShowProjectDialog(true)}
              className="cursor-pointer bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Choose Project
            </button>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <>
          <div className="relative z-50 mb-6 bg-linear-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">
                  Current Project -{" "}
                  <span className="font-bold text-white border p-1 border-white/30">
                    {selectedDivisionName}
                  </span>
                </p>
                <h1 className="text-3xl font-bold text-white">
                  {selectedProjectName}
                </h1>
                <p className="text-white/60 text-sm pt-1">
                  Select the task column to open the task page.
                </p>
              </div>
              <div className="flex flex-row gap-3 items-center">
                <button
                  onClick={() => setShowProjectDialog(true)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-lg transition-all text-sm font-medium border border-white/20 hover:border-white/30"
                >
                  <X size={16} />
                  Change Project
                </button>
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loadingTask && (
            <div className="px-6 py-4 text-sm text-gray-500">
              Loading tasks...
            </div>
          )}
          {/* Search & Filter Section */}
          <div className="bg-[#D2C1B6] rounded-md">
            {tasks && tasks.length > 0 && (
              <div className="mb-4 bg-gray-200 p-4 border border-gray-300 rounded-t-md">
                {/* Search Bar */}
                <div className="flex gap-2 mb-3">
                  <div className=" flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search tasks by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Toggle Filters Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${hasActiveFilters
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                      }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {
                          [
                            searchQuery,
                            statusFilter !== "all",
                            priorityFilter !== "all",
                            typeFilter !== "all",
                            noteFilter !== "all",
                          ].filter(Boolean).length
                        }
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Options */}
                {showFilters && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-black text-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full px-3 py-2 text-black text-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Priority</option>
                        {PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Note Filter */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Note
                      </label>
                      <select
                        value={noteFilter}
                        onChange={(e) => setNoteFilter(e.target.value)}
                        className="w-full px-3 py-2 text-black text-sm border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Notes</option>
                        {NOTE_OPTIONS.map((note) => (
                          <option key={note} value={note}>
                            {note}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                      <div className="col-span-4 flex justify-end">
                        <button
                          onClick={clearAllFilters}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Results Counter */}
                {hasActiveFilters && (
                  <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                    <span className="font-medium">
                      {displayTasks?.length || 0}
                    </span>
                    <span>task(s) found</span>
                    {loadingTask && (
                      <span className="text-blue-600">Loading...</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Task Table */}
            {tasks && tasks.length > 0 && (
              <div className="overflow-auto max-h-[90vh] rounded-xl">
                <div className="w-[50vw] min-w-max">
                  {/* Table Header */}
                  <div className="flex sticky top-0 z-30 bg-[#D2C1B6] text-[0.6em] border-b border-gray-200">
                    {/* Task Column */}
                    <div
                      className={`${columnWidths.task} sticky left-0 z-10 px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] bg-[#D2C1B6] transition-colors`}
                      onClick={() => handleSort("nama")}
                    >
                      <span className="flex items-center">
                        Task
                        <SortIcon columnKey="nama" />
                      </span>
                    </div>

                    {/* group name */}
                    <div
                      className={`${columnWidths.group} sticky left-0 z-10 px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] bg-[#D2C1B6] transition-colors`}
                      onClick={() => handleSort("group")}
                    >
                      <span className="flex items-center">
                        Group Name
                        <SortIcon columnKey="group" />
                      </span>
                    </div>

                    {/* PIC Column */}
                    <div
                      className={`${columnWidths.pic} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("pic")}
                    >
                      <span className="flex items-center">
                        PIC
                        <SortIcon columnKey="pic" />
                      </span>
                    </div>

                    {/* Type Column */}
                    <div
                      className={`${columnWidths.type} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("type")}
                    >
                      <span className="flex items-center">
                        Type
                        <SortIcon columnKey="type" />
                      </span>
                    </div>

                    {/* Status Column */}
                    <div
                      className={`${columnWidths.status} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("status")}
                    >
                      <span className="flex items-center">
                        Status
                        <SortIcon columnKey="status" />
                      </span>
                    </div>

                    {/* Priority Column */}
                    <div
                      className={`${columnWidths.priority} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("priority")}
                    >
                      <span className="flex items-center">
                        Priority
                        <SortIcon columnKey="priority" />
                      </span>
                    </div>

                    {/* Scale Column */}
                    <div
                      className={`${columnWidths.scale} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("scale")}
                    >
                      <span className="flex items-center">
                        Scale
                        <SortIcon columnKey="scale" />
                      </span>
                    </div>

                    {/* Meeting Date Column */}
                    <div
                      className={`${columnWidths.meetingDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("meeting_date")}
                    >
                      <span className="flex items-center">
                        Meeting Date
                        <SortIcon columnKey="meeting_date" />
                      </span>
                    </div>

                    {/* Start Date Column */}
                    <div
                      className={`${columnWidths.startDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("start_date")}
                    >
                      <span className="flex items-center">
                        Start Date
                        <SortIcon columnKey="start_date" />
                      </span>
                    </div>

                    {/* Due Date Column */}
                    <div
                      className={`${columnWidths.dueDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("due_date")}
                    >
                      <span className="flex items-center">
                        Due Date
                        <SortIcon columnKey="due_date" />
                      </span>
                    </div>

                    {/* Finish Date Column */}
                    <div
                      className={`${columnWidths.finishDate} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("finish_date")}
                    >
                      <span className="flex items-center">
                        Finish Date
                        <SortIcon columnKey="finish_date" />
                      </span>
                    </div>

                    {/* Note Column */}
                    <div
                      className={`${columnWidths.note} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] transition-colors`}
                      onClick={() => handleSort("note")}
                    >
                      <span className="flex items-center">
                        Note
                        <SortIcon columnKey="note" />
                      </span>
                    </div>

                    {/* Reason Column - Unsortable */}
                    <div
                      className={`${columnWidths.reason} px-6 py-3 font-semibold text-gray-600 uppercase flex items-center justify-center`}
                    >
                      Reason
                    </div>

                    {/* Action Column */}
                    <div
                      className={`${columnWidths.action} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
                    >
                      Action
                    </div>
                  </div>

                  {displayTasks?.map((task) => {
                    const isOpen = openSubtasks[task._id];

                    return (
                      <div key={task._id} className="flex flex-col">
                        {/* ================= TASK ROW ================= */}
                        <div
                          className={`flex items-center transition-colors
                            ${hoveredRow === task._id ? "bg-[#eae7de]" : "bg-[#EFECE3]"}
                            ${!isOpen ? "border-b border-gray-100" : ""}
                          `}
                          onMouseEnter={() => setHoveredRow(task._id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {/* ===== TASK NAME (STICKY) ===== */}
                          <div
                            className={`flex items-center ${columnWidths.task}
                              gap-1 px-3 py-3.5 sticky left-0 z-5
                              ${hoveredRow === task._id ? "bg-[#eae7de]" : "bg-[#EFECE3]"}
                              ${!isOpen ? "border-b border-gray-100" : ""}
                            `}
                          >
                            <button
                              onClick={() =>
                                setOpenSubtasks((prev) => ({
                                  ...prev,
                                  [task._id]: !prev[task._id],
                                }))
                              }
                              className={`p-0.5 rounded shrink-0 hover:bg-gray-200 ${task.subtask && task.subtask.length > 0
                                  ? ""
                                  : "invisible"
                                }`}
                            >
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-gray-700" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                              )}
                            </button>

                            <span
                              className="text-[0.8em] text-gray-700 px-1 break-all flex-1 min-w-0 cursor-pointer"
                              onClick={() =>
                                navigate(`/project/${task.project._id}`)
                              }
                            >
                              {task.nama}
                            </span>
                            <TaskBadges taskId={task._id} task={task} />
                          </div>
                          <div
                            className={`flex items-center ${columnWidths.task}
                              gap-1 px-3 py-3.5 sticky left-0 z-5
                              ${hoveredRow === task._id ? "bg-[#eae7de]" : "bg-[#EFECE3]"}
                              ${!isOpen ? "border-b border-gray-100" : ""}
                            `}
                          >
                            <button
                              onClick={() =>
                                setOpenSubtasks((prev) => ({
                                  ...prev,
                                  [task._id]: !prev[task._id],
                                }))
                              }
                              className={`p-0.5 rounded shrink-0 hover:bg-gray-200 ${task.subtask && task.subtask.length > 0
                                  ? ""
                                  : "invisible"
                                }`}
                            >
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4 text-gray-700" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                              )}
                            </button>

                            <span
                              className="text-[0.8em] text-gray-700 px-1 break-all flex-1 min-w-0 "
                            >
                              {task.groups[0]?.nama}
                            </span>
                            <TaskBadges taskId={task._id} task={task} />
                          </div>

                          {/* ===== PIC ===== */}
                          <div
                            // className={`${columnWidths.pic} px-6 py-3.5 flex items-center justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
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
                                      className="relative group transition-all cursor-pointer"
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
                          </div>

                          {/* ===== TYPE ===== */}
                          <div
                            className={`${columnWidths.type} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            <span
                              className={`px-3 py-1 text-[0.8em] rounded-full font-medium ${task.type === "Major"
                                  ? "text-orange-700 bg-orange-200"
                                  : "text-cyan-800 bg-cyan-200"
                                }`}
                            >
                              {task.type}
                            </span>
                          </div>

                          {/* ===== STATUS ===== */}
                          <div
                            className={`${columnWidths.status} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            <span
                              className={`px-3 py-1.5 text-[0.8em] rounded-full font-semibold 
                              ${task.status === "Done-In review"
                                  ? " bg-yellow-100 text-yellow-700"
                                  : "bg-indigo-100 text-indigo-700"
                                }`}
                            >
                              {task.status}
                            </span>
                          </div>

                          {/* ===== PRIORITY ===== */}
                          <div
                            className={`${columnWidths.priority} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            <span
                              className={`px-3 py-1 text-[0.8em] rounded-full font-medium ${task.priority === "Urgent"
                                  ? "text-red-700 bg-red-200"
                                  : task.priority === "High"
                                    ? "text-orange-800 bg-orange-200"
                                    : task.priority === "Medium"
                                      ? "text-blue-800 bg-blue-200"
                                      : "text-gray-800 bg-gray-200"
                                }`}
                            >
                              {task.priority || "Low"}
                            </span>
                          </div>

                          {/* ===== SCALE ===== */}
                          <div
                            className={`${columnWidths.scale} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            <span className="text-[0.8em] text-gray-600">
                              {task.scale || "-"}
                            </span>
                          </div>

                          {/* ===== DATES ===== */}
                          {[
                            "meeting_date",
                            "start_date",
                            "due_date",
                            "finish_date",
                          ].map((field) => (
                            <div
                              key={field}
                              className={`${columnWidths[field.replace("_date", "Date")]} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                            >
                              <span className="text-[0.8em] text-gray-600">
                                {task[field]
                                  ? new Date(task[field]).toLocaleDateString(
                                    "id-ID",
                                  )
                                  : "-"}
                              </span>
                            </div>
                          ))}

                          {/* ===== NOTE ===== */}
                          <div
                            className={`${columnWidths.note} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            <span
                              className={`px-3 py-1.5 text-[0.8em] w-full text-center fit-text whitespace-nowrap flex justify-center items-center font-semibold rounded-full cursor-pointer ${task.note === "Planning"
                                  ? "text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                  : task.note === "Uncomplete"
                                    ? "text-red-100 bg-red-900 hover:bg-red-400"
                                    : task.note === "Completed - On Time"
                                      ? "text-green-700 bg-green-100 hover:bg-green-200"
                                      : task.note === "Completed - Overdue"
                                        ? "text-amber-700 bg-orange-100 hover:bg-amber-200"
                                        : "text-cyan-700 bg-cyan-100 hover:bg-cyan-200"
                                }`}
                            >
                              {task.note || "-"}
                            </span>
                          </div>
                          {/* reson */}
                          <div
                            className={`${columnWidths.reason} px-6 py-3.5 flex justify-center ${!isOpen ? "border-b border-gray-100" : ""}`}
                          >
                            {task.note === "Completed - Overdue" ? (
                              <div
                                className="text-[0.8em] text-center text-gray-700 hover:bg-gray-100 line-clamp-5 wrap-break-word px-2 py-1 rounded cursor-pointer w-full"
                                title={task.reason}
                              >
                                {task.reason || "Click to add reason"}
                              </div>
                            ) : (
                              <span className="text-[0.7em] text-gray-400">
                                No need reason
                              </span>
                            )}
                          </div>

                          {/* ===== ACTION ===== */}
                          <div className="w-40 px-6 py-3.5 flex justify-center">
                            <button
                              className="bg-gray-100 text-black rounded-xl px-3 py-1 text-xs hover:bg-gray-200"
                              onClick={() => {
                                if (canAccess()) {
                                  setOpenDialog({ open: true, task });
                                } else {
                                  toast.error(
                                    "Only members can view task details",
                                  );
                                }
                              }}
                            >
                              Detail
                            </button>
                          </div>
                        </div>

                        {/* ================= SUBTASK ================= */}
                        {isOpen && (
                          <div className="bg-[#EFECE3] border-b border-gray-100">
                            <SubtaskList
                              taskId={task._id}
                              subtasks={task.subtask || []}
                              groupId={task.group?._id}
                              workspaceId={selectedWorkspaceId}
                              showAddButton={false}
                              readOnly={true}
                              parentSortConfig={sortConfig}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Tasks State */}
            {!loadingTask && (!tasks || tasks.length === 0) && (
              <div className="px-6 py-8 text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No major tasks found for this project</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dialog Detail */}
      {openDialog.open && (
        <DialogDetail
          show={openDialog.open}
          onClose={() => setOpenDialog({ open: false, task: null })}
          taskId={openDialog.task?._id}
          taskData={openDialog.task}
        />
      )}
    </div>
  );
};

export default MajorTaskPage;
