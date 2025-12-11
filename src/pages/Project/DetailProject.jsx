import { useParams } from "react-router-dom";
import { useProject } from "../../hook/useProject";
import { useGroup } from "../../hook/useGroups";
import {
  Plus,
  Star,
  Table,
  Layout,
  Calendar as CalendarIcon,
  BarChart3,
  Edit2,
  Check,
  X,
} from "lucide-react";
import GroupCard from "./GroupCard";
import Kanban from "./Kanban";
import CalendarView from "../Task/CalendarView";
import GanttChart from "../../components/ui/GanttChart";
import { useEffect, useState } from "react";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import NotificationBell from "../../components/ui/NotificationBell";

const ProjectDetailPage = () => {
  const { projectDetail, updateProjectMutation } = useProject();
  const { id } = useParams();
  const { addGroupMutation } = useGroup();
  const projectQuery = projectDetail(id);
  const { data, isLoading, isError } = projectQuery;
  const { selectedWorkspaceId, setSelectedWorkspaceId } =
    useSelectedWorkspace();
  const [viewMode, setViewMode] = useState("table");

  // State untuk edit nama project
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (!data) return;
    const workspaceId =
      data.workspace?._id || data.workspaceId || data.workspaceId?._id || null;

    if (workspaceId) setSelectedWorkspaceId(workspaceId);
  }, [data, setSelectedWorkspaceId]);

  // Update editedName ketika data berubah
  useEffect(() => {
    if (data?.nama) {
      setEditedName(data.nama);
    }
  }, [data?.nama]);

  const actualWorkspaceId =
    data?.workspace?._id || data?.workspaceId || selectedWorkspaceId;

  const handleAddProject = () => {
    addGroupMutation.mutate({
      projectId: id,
    });
  };

  const handleStartEdit = () => {
    setIsEditingName(true);
    setEditedName(data.nama);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(data.nama);
  };

  const handleSaveEdit = () => {
    const newName = editedName.trim();

    if (!newName) {
      handleCancelEdit();
      return;
    }

    if (newName === data.nama) {
      setIsEditingName(false);
      return;
    }

    updateProjectMutation.mutate(
      {
        projectId: id,
        data: {
          nama: newName,
          workspaceId: actualWorkspaceId,
        },
      },
      {
        onSuccess: () => {
          setIsEditingName(false);
        },
        onError: () => {
          setEditedName(data.nama);
          setIsEditingName(false);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-600 font-medium">Failed to load project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-[#EFECE3] border-b border-r-2 border-gray-200 shadow-sm rounded-3xl">
        <div className="max-w-full px-8 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-1 hover:bg-gray-100 rounded transition">
                <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="text-[1.2em] font-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                        disabled={updateProjectMutation.isPending}
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={updateProjectMutation.isPending}
                        className="p-1.5 bg-[#0E7490] hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 shadow-sm"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updateProjectMutation.isPending}
                        className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 shadow-sm"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h1 className="text-[1.2em] font-bold text-gray-800">
                        {data.nama}
                      </h1>
                      <button
                        onClick={handleStartEdit}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition"
                        title="Edit project name"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* View Mode Toggle - 4 Options */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "table"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Table className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "kanban"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <Layout className="w-4 h-4" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("gantt")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "gantt"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Gantt
              </button>

              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  viewMode === "calendar"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Calendar
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddProject}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0E7490] rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
              <div className="bg-black/20 rounded-4xl">
                <NotificationBell className="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full px-8 py-6">
        {viewMode === "table" && (
          <div className="space-y-3">
            {data.groups &&
              data.groups.map((group, index) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  index={index}
                  workspaceId={actualWorkspaceId}
                />
              ))}

            {(!data.groups || data.groups.length === 0) && (
              <div className="text-center py-20 bg-[#EFECE3] rounded-lg border-2 border-dashed border-gray-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No groups yet
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Create your first group to start organizing tasks
                    </p>
                  </div>
                  <button
                    onClick={handleAddProject}
                    className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Group
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === "kanban" && (
          <Kanban projectId={id} workspaceId={actualWorkspaceId} />
        )}

        {viewMode === "calendar" && (
          <CalendarView projectId={id} workspaceId={actualWorkspaceId} />
        )}
        {viewMode === "gantt" && (
          <GanttChart projectId={id} workspaceId={actualWorkspaceId} />
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
