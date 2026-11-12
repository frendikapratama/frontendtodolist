import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { menuItems, menuBooking } from "../config/menu";
import { useWorkspace } from "../hook/useWorkspace";
import { useAuth } from "../hook/useContext";
import { useSelectedWorkspace } from "../context/WorkspaceContext";
import { useKuarter } from "../hook/useKuarter";
import GradientText from "../components/ui/GradientText";
import Profile from "../assets/LogoPlanify.png";
import LogoutButton from "../components/ui/LogoutButton";
import ProfileDialog from "./ui/ProfileDialog";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Briefcase,
  FolderOpen,
  BookOpen,
  FolderKanban,
  ListTodo,
  Calendar,
  Database,
  Building,
  House,
  Warehouse,
  ListCheck,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
  Folder,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  users: Users,
  reports: FileText,
  settings: Settings,
  briefcase: Briefcase,
  folder: FolderOpen,
  bookopen: BookOpen,
  folderkanban: FolderKanban,
  ListTodo: ListTodo,
  Calendar: Calendar,
  Database: Database,
  Building: Building,
  House: House,
  Warehouse: Warehouse,
  ListCheck: ListCheck,
};

const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const DEFAULT_WIDTH = 250;
const COLLAPSED_WIDTH = 68;

export default function Sidebar() {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("planify_sidebar_width");
    const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
    return isNaN(parsed) || parsed < MIN_WIDTH || parsed > MAX_WIDTH
      ? DEFAULT_WIDTH
      : parsed;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("planify_sidebar_open");
    return saved !== null ? saved === "true" : true;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [showQuartersSection, setShowQuartersSection] = useState(false);
  const [selectedQuarterId, setSelectedQuarterId] = useState(null);
  const [openDialog, setOpenDialog] = useState({ open: null, profile: null });

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPhotoUrl = user?.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/users/${user.photo}`
    : "https://placehold.co/400";

  const { workspacesQuery } = useWorkspace();
  const { data: workspaces } = workspacesQuery;
  const { selectedWorkspaceId, setSelectedWorkspaceId } =
    useSelectedWorkspace();
  const { kuarterQuery } = useKuarter();
  const { data: kuarters = [] } = kuarterQuery;

  // Resizing mouse drag handlers
  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing) {
        let newWidth = e.clientX;
        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
        setSidebarWidth(newWidth);
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (sidebarWidth) {
        localStorage.setItem("planify_sidebar_width", String(sidebarWidth));
      }
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, resize, stopResizing, sidebarWidth]);

  const handleResetWidth = () => {
    setSidebarWidth(DEFAULT_WIDTH);
    localStorage.setItem("planify_sidebar_width", String(DEFAULT_WIDTH));
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("planify_sidebar_open", String(next));
      return next;
    });
  };

  const hasAccessBokingMenu = (item) => {
    if (!item.accessControl) return true;
    if (!user) return false;

    const { allowedDivisions, allowedUserIds } = item.accessControl;

    if (allowedUserIds?.includes(user._id)) {
      return true;
    }

    if (allowedDivisions && user.divisi) {
      const divisiList = Array.isArray(user.divisi)
        ? user.divisi
        : [user.divisi];
      return divisiList.some((div) =>
        allowedDivisions.some((pattern) => pattern.test(div)),
      );
    }

    return false;
  };

  const filteredMenuBooking = menuBooking
    .map((item) => {
      if (item.children) {
        if (!hasAccessBokingMenu(item)) {
          return { ...item, children: [] };
        }
        const filteredChildren = item.children.filter((child) =>
          hasAccessBokingMenu(child),
        );
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter((item) => {
      if (item.children) {
        return item.children.length > 0;
      }
      return hasAccessBokingMenu(item);
    });

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => child.path === location.pathname)) {
        setExpandedMenus((prev) => new Set([...prev, item.id]));
      }
    });

    const kuarterMatch = location.pathname.match(/\/kuarter\/([^\/]+)/i);
    if (kuarterMatch) {
      setSelectedQuarterId(kuarterMatch[1]);
      setShowQuartersSection(true);
    }

    const projectMatch = location.pathname.match(/\/project\/([^\/]+)/);
    if (projectMatch && workspaces?.length > 0) {
      const projectId = projectMatch[1];

      for (const workspace of workspaces) {
        const project = workspace.projects?.find((p) => p._id === projectId);
        if (project) {
          setSelectedWorkspaceId(workspace._id);

          const relatedQuarter = kuarters?.find((k) =>
            k.workspace?.includes(workspace._id),
          );
          if (relatedQuarter) {
            setSelectedQuarterId(relatedQuarter._id);
            setShowQuartersSection(true);
          }
          break;
        }
      }
    }
  }, [location.pathname, workspaces, kuarters, setSelectedWorkspaceId]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setExpandedMenus((prev) => new Set([...prev, selectedWorkspaceId]));
    }
  }, [selectedWorkspaceId]);

  const toggleSubmenu = (itemId) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });
  };

  const isActive = (item, isChild = false) => {
    if (item.path && location.pathname.toLowerCase() === item.path.toLowerCase()) {
      return true;
    }
    return (
      !isChild &&
      item.children?.some(
        (child) => child.path && location.pathname.toLowerCase() === child.path.toLowerCase(),
      )
    );
  };

  const getRelatedWorkspaces = () => {
    if (!selectedQuarterId || !kuarters?.length) return [];
    const selectedQuarter = kuarters.find((k) => k._id === selectedQuarterId);
    if (!selectedQuarter?.workspace || selectedQuarter.workspace.length === 0)
      return [];
    const workspaceIds = selectedQuarter.workspace;
    return workspaces?.filter((ws) => workspaceIds.includes(ws._id)) || [];
  };
  const relatedWorkspaces = getRelatedWorkspaces();

  const renderMenuItem = (item, isChild = false) => {
    const IconComponent = iconMap[item.icon] || Folder;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const active = isActive(item, isChild);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-0.5">
          <button
            onClick={() => toggleSubmenu(item.id)}
            title={!isSidebarOpen ? item.label : undefined}
            className={`w-full flex items-center justify-between rounded-xl transition-all duration-150 group relative ${
              isSidebarOpen ? "px-3 py-2 text-xs" : "p-2 justify-center"
            } ${
              active
                ? "bg-[#0E7490]/15 text-[#0E7490] font-semibold"
                : "text-gray-700 hover:text-gray-900 hover:bg-black/5 font-medium"
            }`}
          >
            <div className={`flex items-center min-w-0 ${isSidebarOpen ? "gap-2.5 flex-1" : "justify-center"}`}>
              {IconComponent && (
                <IconComponent
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? "text-[#0E7490]" : "text-gray-500 group-hover:text-gray-800"
                  }`}
                />
              )}
              {isSidebarOpen && (
                <span className="truncate text-left text-xs font-medium">
                  {item.label}
                </span>
              )}
            </div>

            {isSidebarOpen &&
              (isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0 ml-1.5" />
              ))}

            {/* Tooltip for collapsed mode */}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </div>
            )}
          </button>

          {isExpanded && isSidebarOpen && (
            <div className="ml-3 pl-2.5 space-y-0.5 border-l-2 border-gray-300/60 my-0.5">
              {item.children.map((child) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path}
        title={!isSidebarOpen ? item.label : undefined}
        className={({ isActive: isLinkActive }) =>
          `flex rounded-xl transition-all duration-150 group relative ${
            isSidebarOpen
              ? `items-center gap-2.5 px-3 py-2 text-xs ${isChild ? "pl-7" : ""}`
              : "p-2 justify-center"
          } ${
            isLinkActive
              ? "bg-[#0E7490] text-white shadow-xs font-semibold"
              : isChild
                ? "text-gray-600 hover:text-gray-900 hover:bg-black/5 font-medium"
                : "text-gray-700 hover:text-gray-900 hover:bg-black/5 font-medium"
          }`
        }
        onClick={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
      >
        {({ isActive: isLinkActive }) => (
          <>
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isLinkActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-800"
                }`}
              />
            )}
            {isSidebarOpen && (
              <span className="truncate text-xs font-medium">
                {item.label}
              </span>
            )}

            {/* Tooltip for collapsed mode */}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </div>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const currentWidth = isSidebarOpen ? sidebarWidth : COLLAPSED_WIDTH;

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Floating Toggle Button for Mobile when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
          title="Buka Sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* Sidebar Container */}
      <div
        style={{ width: `${currentWidth}px` }}
        className={`fixed lg:sticky lg:top-0 z-40 h-screen shrink-0 ${
          isResizing ? "select-none" : "transition-[width] duration-200 ease-in-out"
        } ${
          !isSidebarOpen && "max-lg:-translate-x-full"
        }`}
      >
        <aside className="w-full h-full bg-[#EFECE3] border-r border-gray-300/80 flex flex-col shadow-xs relative overflow-hidden select-none">
          {/* Header */}
          <div className="px-3.5 py-3.5 border-b border-gray-300/70 flex items-center justify-between shrink-0">
            <div
              className={`flex items-center gap-2.5 min-w-0 ${
                isSidebarOpen ? "justify-start flex-1" : "justify-center w-full"
              }`}
            >
              <img
                src={Profile}
                alt="Logo Planify"
                className="w-8 h-8 rounded-lg shrink-0 object-contain"
              />
              {isSidebarOpen && (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GradientText
                    colors={["#0E7490", "#2563EB", "#0E7490", "#059669"]}
                    animationSpeed={4}
                    showBorder={false}
                    className="font-bold text-lg tracking-tight truncate"
                  >
                    Planify
                  </GradientText>
                </div>
              )}
            </div>

            {/* Desktop Collapse / Expand Toggle Button */}
            {isSidebarOpen && (
              <button
                type="button"
                onClick={handleToggleSidebar}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-black/5 rounded-lg transition-colors shrink-0"
                title="Sembunyikan Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Collapsed Mode Expand Button */}
          {!isSidebarOpen && (
            <div className="px-2 pt-2 pb-1 flex justify-center shrink-0">
              <button
                type="button"
                onClick={handleToggleSidebar}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-black/5 rounded-xl transition-colors"
                title="Perluas Sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Scrollable Body */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Section: Main Menu */}
            <div className="space-y-0.5">
              {isSidebarOpen && (
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 pb-1">
                  Main Menu
                </div>
              )}
              {menuItems
                .filter((item) => !item.requireAdmin || user?.isSystemAdmin)
                .map((item) => renderMenuItem(item))}
            </div>

            {/* Section: Quarters & Workspaces */}
            {kuarters?.length > 0 && (
              <div className="pt-2 border-t border-gray-300/60 space-y-1">
                {isSidebarOpen ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowQuartersSection((prev) => !prev)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors rounded-lg group"
                    >
                      <span>Quarters</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform duration-200 text-gray-400 group-hover:text-gray-700 ${
                          showQuartersSection ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {showQuartersSection && (
                      <div className="space-y-1 pt-0.5">
                        {kuarters.map((k) => {
                          const isQuarterActive = selectedQuarterId === k._id;

                          return (
                            <div
                              key={k._id}
                              className="rounded-xl overflow-hidden transition-all bg-black/2"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (isQuarterActive) {
                                    setSelectedQuarterId(null);
                                  } else {
                                    setSelectedQuarterId(k._id);
                                    navigate(`/kuarter/${k._id}`);
                                    setSelectedWorkspaceId(null);
                                  }
                                  if (window.innerWidth < 1024) {
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  location.pathname.startsWith(`/kuarter/${k._id}`)
                                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                                    : "text-gray-700 hover:bg-black/5 hover:text-gray-900"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                      location.pathname.startsWith(
                                        `/kuarter/${k._id}`,
                                      )
                                        ? "bg-white/20 text-white"
                                        : "bg-emerald-600 text-white"
                                    }`}
                                  >
                                    {k.nama.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="truncate text-xs">
                                    {k.nama}
                                  </span>
                                </div>

                                <ChevronRight
                                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 opacity-60 ${
                                    isQuarterActive ? "rotate-90" : ""
                                  }`}
                                />
                              </button>

                              {isQuarterActive && (
                                <div className="ml-3 pl-2.5 my-1.5 border-l-2 border-gray-300/60 space-y-2">
                                  {relatedWorkspaces.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block px-1">
                                          Workspace
                                        </label>
                                        <select
                                          value={selectedWorkspaceId || ""}
                                          onChange={(e) =>
                                            setSelectedWorkspaceId(e.target.value)
                                          }
                                          className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 font-medium"
                                        >
                                          <option value="" disabled>
                                            Pilih Workspace...
                                          </option>
                                          {relatedWorkspaces.map((ws) => (
                                            <option key={ws._id} value={ws._id}>
                                              {ws.nama}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {selectedWorkspaceId && (
                                        <div className="space-y-0.5 pt-1">
                                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block px-1 mb-1">
                                            Projects
                                          </span>
                                          {relatedWorkspaces
                                            .filter(
                                              (ws) =>
                                                ws._id === selectedWorkspaceId,
                                            )
                                            .map((ws) =>
                                              ws.projects?.length > 0 ? (
                                                ws.projects.map((project) => (
                                                  <NavLink
                                                    key={project._id}
                                                    to={`/project/${project._id}`}
                                                    onClick={() => {
                                                      if (
                                                        window.innerWidth < 1024
                                                      ) {
                                                        setIsSidebarOpen(false);
                                                      }
                                                    }}
                                                    className={({ isActive }) =>
                                                      `flex items-center px-2 py-1.5 rounded-lg text-xs transition-colors ${
                                                        isActive
                                                          ? "bg-[#0E7490] text-white font-medium shadow-xs"
                                                          : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                                                      }`
                                                    }
                                                  >
                                                    <span className="truncate">
                                                      {project.nama}
                                                    </span>
                                                  </NavLink>
                                                ))
                                              ) : (
                                                <div className="text-[11px] italic text-gray-400 px-1 py-1">
                                                  Tidak ada project
                                                </div>
                                              ),
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] italic text-gray-400 py-1">
                                      Workspace tidak ditemukan
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-1 py-1">
                    {kuarters.map((k) => (
                      <button
                        key={k._id}
                        type="button"
                        onClick={() => {
                          navigate(`/kuarter/${k._id}`);
                          setSelectedQuarterId(k._id);
                          setSelectedWorkspaceId(null);
                        }}
                        className="w-full flex items-center justify-center py-1 group relative"
                        title={k.nama}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 shadow-2xs ${
                            selectedQuarterId === k._id
                              ? "bg-blue-600 text-white ring-2 ring-blue-300"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          {k.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                          {k.nama}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section: Meetings & Booking */}
            {filteredMenuBooking.length > 0 && (
              <div className="pt-2 border-t border-gray-300/60 space-y-0.5">
                {isSidebarOpen && (
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 pb-1">
                    Meeting & Booking
                  </div>
                )}
                {filteredMenuBooking
                  .filter((item) => !item.requireAdmin || user?.isSystemAdmin)
                  .map((item) => renderMenuItem(item))}
              </div>
            )}
          </nav>

          {/* Footer: User Profile & Logout */}
          <div className="p-2.5 border-t border-gray-300/70 shrink-0 bg-black/2 space-y-2">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setOpenDialog({ open: true, profile: user })}
                  className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-xl hover:bg-black/5 transition-colors text-left group"
                  title="Lihat Profil"
                >
                  <div className="relative shrink-0">
                    <img
                      className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                      src={currentPhotoUrl}
                      alt="Profile"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#EFECE3] rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate group-hover:text-cyan-800 transition-colors">
                      {user?.username || "Pengguna"}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate capitalize">
                      {user?.posisi || user?.divisi || "Member"}
                    </p>
                  </div>
                </button>

                <div className="shrink-0">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpenDialog({ open: true, profile: user })}
                  className="relative group p-1 rounded-xl hover:bg-black/5 transition-colors"
                  title={user?.username || "Profil"}
                >
                  <img
                    className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                    src={currentPhotoUrl}
                    alt="Profile"
                  />
                  <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#EFECE3] rounded-full" />
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900/95 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    {user?.username || "Profil"}
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Resizer Handle (Interactive Right Border) */}
          {isSidebarOpen && (
            <div
              onMouseDown={startResizing}
              onDoubleClick={handleResetWidth}
              className={`hidden lg:block absolute top-0 right-0 w-2 h-full cursor-col-resize z-50 group hover:w-2.5 transition-all select-none ${
                isResizing ? "bg-cyan-600/40" : "hover:bg-cyan-500/25"
              }`}
              title="Tarik untuk mengubah ukuran / Dobel klik untuk reset ukuran"
            >
              {/* Center Grab Handle Pill */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 right-0.5 w-1 h-7 rounded-full transition-colors ${
                  isResizing ? "bg-[#0E7490]" : "bg-gray-400/40 group-hover:bg-[#0E7490]"
                }`}
              />
            </div>
          )}
        </aside>
      </div>

      {/* Profile Dialog */}
      <div className="z-100">
        {openDialog.open && (
          <ProfileDialog
            show={openDialog.open}
            onClose={() => setOpenDialog({ open: false, profile: null })}
            userId={openDialog.profile?._id || user?._id}
            profileData={openDialog.profile || user}
          />
        )}
      </div>
    </>
  );
}
