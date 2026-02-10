import { useState, useRef, useEffect } from "react";
import {
  useProjectWithMajorTask,
  useMajorTaskByProject,
} from "../../hook/useTask";
import { useMember } from "../../hook/useMember";
import { Search, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubtaskList from "../Subtask/SubTaskList";
import DialogDetail from "../Task/DialogDetail";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import toast from "react-hot-toast";

const MajorTaskPage = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const tableEndRef = useRef(null);
  const headerRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [hoveredRow, setHoveredRow] = useState(null);
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [openDialog, setOpenDialog] = useState({ open: false, task: null });
  const navigate = useNavigate();

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      },
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

  // Update workspace ID when project is selected
  useEffect(() => {
    if (selectedProjectId && projects) {
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      if (selectedProject?.workspace?._id) {
        setSelectedWorkspaceId(selectedProject.workspace._id);
      }
    }
  }, [selectedProjectId, projects]);

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
    if (!sortConfig.key || !tasks) return tasks;

    const sorted = [...tasks].sort((a, b) => {
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
    task: "w-95",
    pic: "w-32",
    status: "w-40",
    type: "w-32",
    priority: "w-32",
    scale: "w-20",
    meetingDate: "w-40",
    startDate: "w-40",
    dueDate: "w-40",
    finishDate: "w-40",
    note: "w-50",
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Project With Major Task
      </h1>

      {/* Project Selection Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {projects?.map((project) => (
          <button
            key={project._id}
            onClick={() => setSelectedProjectId(project._id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedProjectId === project._id
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {project.nama}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {selectedProjectId && loadingTask && (
        <div className="px-6 py-4 text-sm text-gray-500">Loading tasks...</div>
      )}

      {/* Task Table */}
      {selectedProjectId && tasks && tasks.length > 0 && (
        <div className="overflow-auto max-h-[90vh]">
          <div className="w-[50vw] min-w-max">
            {/* Table Header */}
            <div
              ref={headerRef}
              className="flex sticky top-0 bg-[#D2C1B6] text-[0.6em] border-b border-gray-200 z-10 transition-all duration-200"
            >
              {/* Task Column */}
              <div
                className={`${columnWidths.task} sticky left-0 z-50 px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center cursor-pointer hover:bg-[#C5B5A8] bg-[#D2C1B6] transition-colors`}
                onClick={() => handleSort("nama")}
              >
                <span className="flex items-center">
                  Task
                  <SortIcon columnKey="nama" />
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

              {/* Action Column */}
              <div
                className={`${columnWidths.action} px-6 py-3 font-semibold text-gray-600 uppercase items-center flex justify-center`}
              >
                Action
              </div>
            </div>

            {/* Task Rows */}
            {displayTasks?.map((task) => (
              <div key={task._id}>
                <div
                  className={`flex items-center cursor-pointer transition-colors ${
                    hoveredRow === task._id ? "bg-[#eae7de]" : "bg-[#EFECE3]"
                  }`}
                  onMouseEnter={() => setHoveredRow(task._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {/* Task Name */}
                  <div
                    className={`flex-1 flex items-center ${columnWidths.task} gap-1 px-3 py-3.5 border-b border-gray-100 sticky left-0 z-20 transition-colors ${
                      hoveredRow === task._id ? "bg-[#eae7de]" : "bg-[#EFECE3]"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setOpenSubtasks((prev) => ({
                          ...prev,
                          [task._id]: !prev[task._id],
                        }))
                      }
                      className={`p-0.5 rounded transition-all shrink-0 ${
                        task.subtask?.length || hoveredRow === task._id
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
                    <span
                      className="text-[0.8em] text-gray-700 px-1 break-all line-clamp-10 flex-1 min-w-0 cursor-grab"
                      onClick={() => navigate(`/project/${task.project._id}`)}
                    >
                      {task.nama}
                    </span>
                  </div>

                  {/* PIC */}
                  <div
                    className={`${columnWidths.pic} px-6 py-3.5 border-b border-gray-100 flex items-center justify-center gap-1`}
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
                              className="relative group hover:z-40 z-10 transition-all"
                            >
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

                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap ">
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

                  {/* Type */}
                  <div
                    className={`${columnWidths.type} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span
                      className={`px-3 py-1 text-[0.8em] font-medium rounded-full ${
                        task.type === "Major"
                          ? "text-orange-700 bg-orange-200"
                          : "text-cyan-800 bg-cyan-200"
                      }`}
                    >
                      {task.type}
                    </span>
                  </div>

                  {/* Status */}
                  <div
                    className={`${columnWidths.status} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="px-3 py-1.5 text-[0.8em] font-semibold rounded-full bg-indigo-100 text-indigo-700">
                      {task.status}
                    </span>
                  </div>

                  {/* Priority */}
                  <div
                    className={`${columnWidths.priority} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span
                      className={`px-3 py-1 text-[0.8em] font-medium rounded-full ${
                        task.priority === "Urgent"
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

                  {/* Scale */}
                  <div
                    className={`${columnWidths.scale} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="text-[0.8em] text-gray-600">
                      {task.scale || "-"}
                    </span>
                  </div>

                  {/* Meeting Date */}
                  <div
                    className={`${columnWidths.meetingDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="text-[0.8em] text-gray-600">
                      {task.meeting_date
                        ? new Date(task.meeting_date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Start Date */}
                  <div
                    className={`${columnWidths.startDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="text-[0.8em] text-gray-600">
                      {task.start_date
                        ? new Date(task.start_date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div
                    className={`${columnWidths.dueDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="text-[0.8em] text-gray-600">
                      {task.due_date
                        ? new Date(task.due_date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Finish Date */}
                  <div
                    className={`${columnWidths.finishDate} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span className="text-[0.8em] text-gray-600">
                      {task.finish_date
                        ? new Date(task.finish_date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>

                  {/* Note */}
                  <div
                    className={`${columnWidths.note} px-6 py-3.5 border-b border-gray-100 items-center flex justify-center`}
                  >
                    <span
                      className={`px-3 py-1.5 text-[0.8em] w-full text-center whitespace-nowrap flex justify-center items-center font-semibold rounded-full ${
                        task.note === "Planning"
                          ? "text-indigo-700 bg-indigo-100"
                          : task.note === "Uncomplete"
                            ? "text-red-100 bg-red-900"
                            : task.note === "Completed - On Time"
                              ? "text-green-700 bg-green-100"
                              : task.note === "Completed - Overdue"
                                ? "text-amber-700 bg-orange-100"
                                : "text-cyan-700 bg-cyan-100"
                      }`}
                    >
                      {task.note || "-"}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="w-40 px-6 py-3.5 border-b border-gray-100 items-center flex justify-center">
                    <button
                      className="bg-gray-100 rounded-xl p-1 px-3 text-black font-medium text-xs hover:bg-gray-200"
                      onClick={() => {
                        if (canAccess()) {
                          setOpenDialog({ open: true, task: task });
                        } else {
                          toast.error("Only members can view task details");
                        }
                      }}
                    >
                      Detail
                    </button>
                  </div>
                </div>

                {/* Subtask List */}
                {openSubtasks[task._id] && (
                  <div className="border-b border-gray-100">
                    <SubtaskList
                      taskId={task._id}
                      subtasks={task.subtask || []}
                      groupId={task.group?._id}
                      workspaceId={selectedWorkspaceId}
                      showAddButton={false}
                      readOnly={true}
                    />
                  </div>
                )}
              </div>
            ))}

            <div ref={tableEndRef} className="h-1" />
          </div>
        </div>
      )}

      {/* No Tasks State */}
      {selectedProjectId && !loadingTask && (!tasks || tasks.length === 0) && (
        <div className="px-6 py-8 text-center text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No major tasks found for this project</p>
        </div>
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
