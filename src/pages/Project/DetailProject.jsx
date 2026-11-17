import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";
import { useProject } from "../../hook/useProject";
import { useGroup } from "../../hook/useGroups";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import GroupCard from "./GroupCard";
import Kanban from "./Kanban";
import CalendarView from "../Task/CalendarView";
import GanttChart from "../../components/ui/GanttChart";
import NotificationBell from "../../components/ui/NotificationBell";

const VIEW_MODES = [
  { key: "table", label: "Table", icon: Table },
  { key: "kanban", label: "Kanban", icon: Layout },
  { key: "gantt", label: "Gantt", icon: BarChart3 },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
];

const getWorkspaceId = (data) =>
  data?.workspace?._id || data?.workspaceId?._id || data?.workspaceId || null;

const sortByPosition = (groups) =>
  [...groups].sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { projectDetail, updateProjectMutation } = useProject();
  const { addGroupMutation, updateGroupPositionsMutation } = useGroup();
  const { selectedWorkspaceId, setSelectedWorkspaceId } =
    useSelectedWorkspace();

  const { data, isLoading, isError } = projectDetail(id);

  const [viewMode, setViewMode] = useState("table");
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [localGroups, setLocalGroups] = useState([]);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const viewMenuRef = useRef(null);

  // Ref selalu sinkron dengan state, dipakai saat drag end agar tidak stale
  const localGroupsRef = useRef(localGroups);
  localGroupsRef.current = localGroups;

  const actualWorkspaceId = getWorkspaceId(data) || selectedWorkspaceId;

  // Sinkronkan workspace & groups dari server
  useEffect(() => {
    if (!data) return;

    const workspaceId = getWorkspaceId(data);
    if (workspaceId) setSelectedWorkspaceId(workspaceId);

    if (data.groups) setLocalGroups(sortByPosition(data.groups));
  }, [data, setSelectedWorkspaceId]);

  // Sinkronkan nama project untuk mode edit
  useEffect(() => {
    if (data?.nama) setEditedName(data.nama);
  }, [data?.nama]);

  // Tutup dropdown view saat klik di luar atau tekan Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target)) {
        setIsViewMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsViewMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentView =
    VIEW_MODES.find((v) => v.key === viewMode) ?? VIEW_MODES[0];
  const CurrentIcon = currentView.icon;

  /* ---------- Handlers: group ---------- */

  const handleAddGroup = () => {
    addGroupMutation.mutate({ projectId: id });
  };

  const handleGroupDragStart = (e, index) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGroupDragOver = (e, index) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === index) return;

    setLocalGroups((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedGroupIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedGroupIndex(index);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupIndex(null);
    updateGroupPositionsMutation.mutate({
      projectId: id,
      groupIds: localGroupsRef.current.map((g) => g._id),
    });
  };

  /* ---------- Handlers: edit nama project ---------- */

  const handleStartEdit = () => {
    setEditedName(data.nama);
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setEditedName(data.nama);
    setIsEditingName(false);
  };

  const handleSaveEdit = () => {
    const newName = editedName.trim();

    if (!newName) return handleCancelEdit();
    if (newName === data.nama) return setIsEditingName(false);

    updateProjectMutation.mutate(
      {
        projectId: id,
        data: { nama: newName, workspaceId: actualWorkspaceId },
      },
      {
        onSuccess: () => setIsEditingName(false),
        onError: handleCancelEdit,
      },
    );
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") handleSaveEdit();
    else if (e.key === "Escape") handleCancelEdit();
  };

  /* ---------- Loading & error ---------- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
      <header className="bg-[#EFECE3] border-b border-gray-200 shadow-sm rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3">
          {/* Kiri: star + nama project */}
          <div className="flex items-center gap-3 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  disabled={updateProjectMutation.isPending}
                  className="text-[1.2em] font-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
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
              <div className="flex items-center gap-2 group min-w-0">
                <h1 className="text-[1.2em] font-bold text-gray-800 truncate">
                  {data.nama}
                </h1>
                <button
                  onClick={handleStartEdit}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition shrink-0"
                  title="Edit project name"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          {/* Tengah: dropdown view mode */}{" "}
          <div className="flex items-center gap-3">
            <div className="relative" ref={viewMenuRef}>
              <button
                type="button"
                onClick={() => setIsViewMenuOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isViewMenuOpen}
                className="h-10 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs"
              >
                <CurrentIcon className="w-4 h-4 text-[#0E7490]" />
                <span>{currentView.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isViewMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isViewMenuOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-xl  p-1 z-30"
                >
                  {VIEW_MODES.map(({ key, label, icon: Icon }) => (
                    <li key={key}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={viewMode === key}
                        onClick={() => {
                          setViewMode(key);
                          setIsViewMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${
                          viewMode === key
                            ? "bg-[#0E7490]/10 text-[#0E7490] font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{label}</span>
                        {viewMode === key && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Kanan: aksi */}

            <button
              onClick={handleAddGroup}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0E7490] rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Group
            </button>
            <div className="bg-black/20 rounded-full">
              <NotificationBell />
            </div>
          </div>
        </div>
      </header>

      {/* Konten */}
      <main className="px-8 py-6">
        {viewMode === "table" && (
          <div className="space-y-3">
            {localGroups.map((group, index) => (
              <div
                key={group._id}
                draggable
                onDragStart={(e) => handleGroupDragStart(e, index)}
                onDragOver={(e) => handleGroupDragOver(e, index)}
                onDragEnd={handleGroupDragEnd}
                className="cursor-move"
              >
                <GroupCard
                  group={group}
                  index={index}
                  workspaceId={actualWorkspaceId}
                  projectId={id}
                />
              </div>
            ))}

            {localGroups.length === 0 && (
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
                    onClick={handleAddGroup}
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
        {viewMode === "gantt" && (
          <GanttChart projectId={id} workspaceId={actualWorkspaceId} />
        )}
        {viewMode === "calendar" && (
          <CalendarView projectId={id} workspaceId={actualWorkspaceId} />
        )}
      </main>
    </div>
  );
};

export default ProjectDetailPage;
