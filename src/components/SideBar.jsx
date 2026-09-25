import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { menuItems, menuBooking } from "../config/menu";
import { useWorkspace } from "../hook/useWorkspace";
import GradientText from "../components/ui/GradientText";
import Profile from "../assets/LogoPlanify.png";
import ToggleButtonExit from "../components/ui/ToggleButtonExit";
import { useAuth } from "../hook/useContext";
import LogoutButton from "../components/ui/LogoutButton";

import { useSelectedWorkspace } from "../context/WorkspaceContext";
import { useKuarter } from "../hook/useKuarter";
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
  X,
} from "lucide-react";
import ProfileDialog from "./ui/ProfileDialog";

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

// Kumpulkan semua path dari menuBooking (termasuk children)
const bookingPaths = menuBooking
  .flatMap((item) =>
    item.children ? item.children.map((child) => child.path) : [item.path],
  )
  .filter(Boolean);

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [showQuartersSection, setShowQuartersSection] = useState(false);
  const [selectedQuarterId, setSelectedQuarterId] = useState(null);
  const [openDialog, setOpenDialog] = useState({ open: false, profile: null });

  const { user } = useAuth();
  const currentPhotoUrl = user?.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/users/${user.photo}`
    : "https://placehold.co/400";
  const location = useLocation();
  const navigate = useNavigate();

  // true jika halaman aktif termasuk menuBooking
  const isBookingPage = bookingPaths.some(
    (path) =>
      location.pathname === path || location.pathname.startsWith(`${path}/`),
  );

  const { workspacesQuery } = useWorkspace();
  const { data: workspaces } = workspacesQuery;
  const { selectedWorkspaceId, setSelectedWorkspaceId } =
    useSelectedWorkspace();
  const { kuarterQuery } = useKuarter();
  const { data: kuarters = [] } = kuarterQuery;

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

    const kuarterMatch = location.pathname.match(/\/kuarter\/([^\/]+)/);
    if (kuarterMatch) {
      setSelectedQuarterId(kuarterMatch[1]);
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
    if (item.path === location.pathname) return true;
    return (
      !isChild &&
      item.children?.some((child) => child.path === location.pathname)
    );
  };

  const renderMenuItem = (item, isChild = false) => {
    const IconComponent = iconMap[item.icon];
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const active = isActive(item, isChild);

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              active
                ? "bg-cyan-50 text-[#0891B2]"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
            }`}
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {IconComponent && (
                <IconComponent
                  className={`w-5 h-5 shrink-0 ${
                    active
                      ? "text-[#0891B2]"
                      : "text-[#94A3B8] group-hover:text-[#0891B2]"
                  }`}
                />
              )}
              <span
                className={`font-medium transition-opacity duration-300 ${
                  !isSidebarOpen
                    ? "opacity-0 w-0 overflow-hidden"
                    : "opacity-100"
                }`}
              >
                {item.label}
              </span>
            </div>
            {isSidebarOpen &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              ))}
          </button>

          {isExpanded && isSidebarOpen && (
            <div className="ml-4 space-y-1 border-l-2 border-[#E2E8F0] pl-2">
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
        className={({ isActive }) =>
          `
          flex rounded-lg mt-1 
          ${isSidebarOpen ? "justify-start items-center px-2 py-2" : "ml-2 justify-center items-center w-7 h-7"}
          ${isChild ? "pl-8" : ""}
          transition-colors duration-150
          ${
            isActive
              ? "bg-[#ECFEFF] text-[#0891B2] font-semibold"
              : isChild
                ? "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
          }
        `
        }
        onClick={() => {
          if (window.innerWidth < 1024) {
            setIsMobileOpen?.(false);
          }
        }}
      >
        {IconComponent && (
          <IconComponent
            className={`transition-all duration-300 ease-in-out shrink-0 ${
              isSidebarOpen ? "ml-1 w-5 h-5" : "scale-70 w-5 h-5"
            }`}
          />
        )}
        {isSidebarOpen && (
          <span className="ml-3 font-medium whitespace-normal wrap-break-word">
            {item.label}
          </span>
        )}
      </NavLink>
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

  return (
    <>
      {/* Overlay Gelap Khusus Layar Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      {/* Wrapper Utama Sidebar */}
      <div
        className={`fixed lg:sticky top-0 z-50 lg:z-40 h-screen transition-all duration-300 ${
          // Pengaturan Mobile Slide
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          // Pengaturan Lebar Desktop (Sesuai kode asli Anda)
          isSidebarOpen ? "w-45" : "w-15"
        }`}
      >
        <aside
          className={`w-full p-2 h-full flex flex-col shadow-sm relative transition-colors duration-300 border-r ${
            isBookingPage ? "bg-[#EFECE3] border-[#D4CFC3]" : "bg-white border-[#E2E8F0]"
          }`}
        >
          {/* Tombol Close (X) Khusus Mobile */}
          <button
            className="lg:hidden absolute top-3 right-3 text-gray-700 hover:text-black p-1"
            onClick={() => setIsMobileOpen?.(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className={`p-3 pb-4 border-b ${isBookingPage ? "border-[#D4CFC3]" : "border-[#E2E8F0]"}`}>
            <div className="flex items-center justify-center transition-all duration-300">
              <img
                src={Profile}
                alt="Logo"
                className={`transition-all duration-300 ${
                  isSidebarOpen ? "w-9 h-9" : "scale-300"
                }`}
              />
              {isSidebarOpen && (
                <GradientText
                  colors={[
                    "#40ffaa",
                    "#4079ff",
                    "#40ffaa",
                    "#4079ff",
                    "#40ffaa",
                  ]}
                  animationSpeed={3}
                  showBorder={false}
                  className="custom-class text-2xl transition-opacity duration-300 ml-2"
                >
                  Planify
                </GradientText>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto flex flex-col space-y-1">
            <div className="flex text-xs justify-start flex-col">
              {menuItems
                .filter((item) => !item.requireAdmin || user?.isSystemAdmin)
                .map((item) => renderMenuItem(item))}

              {/* Quarters Section */}
              {kuarters?.length > 0 && (
                <div className="px-2 pt-2 border-t border-[#E2E8F0] mt-2">
                  {isSidebarOpen ? (
                    <>
                      {/* Toggle Head Section */}
                      <button
                        type="button"
                        onClick={() => setShowQuartersSection((prev) => !prev)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors rounded-md"
                      >
                        <span>Quarters</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            showQuartersSection ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* Quarters List */}
                      {showQuartersSection && (
                        <div className="mt-1 space-y-1">
                          {kuarters.map((k) => {
                            const isQuarterActive = selectedQuarterId === k._id;

                            return (
                              <div
                                key={k._id}
                                className="rounded-lg overflow-hidden transition-all"
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
                                      setIsMobileOpen?.(false);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                                    location.pathname.startsWith(
                                      `/kuarter/${k._id}`,
                                    )
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "text-gray-700 hover:bg-blue-50/80 hover:text-gray-900"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
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

                                {/* Accordion Content */}
                                {isQuarterActive && (
                                  <div className="ml-3 pl-2.5 my-1 border-l-2 border-gray-300/60 space-y-2">
                                    {relatedWorkspaces.length > 0 ? (
                                      <div className="space-y-1.5 pt-1">
                                        {/* Workspace Selector */}
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block px-1">
                                            Workspace
                                          </label>
                                          <select
                                            value={selectedWorkspaceId || ""}
                                            onChange={(e) =>
                                              setSelectedWorkspaceId(
                                                e.target.value,
                                              )
                                            }
                                            className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 font-medium"
                                          >
                                            <option value="" disabled>
                                              Pilih Workspace...
                                            </option>
                                            {relatedWorkspaces.map((ws) => (
                                              <option
                                                key={ws._id}
                                                value={ws._id}
                                              >
                                                {ws.nama}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Projects List */}
                                        {selectedWorkspaceId && (
                                          <div className="space-y-0.5 pt-1">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block px-1 mb-1">
                                              Projects
                                            </span>
                                            {relatedWorkspaces
                                              .filter(
                                                (ws) =>
                                                  ws._id ===
                                                  selectedWorkspaceId,
                                              )
                                              .map((ws) =>
                                                ws.projects?.length > 0 ? (
                                                  ws.projects.map((project) => (
                                                    <NavLink
                                                      key={project._id}
                                                      to={`/project/${project._id}`}
                                                      onClick={() => {
                                                        if (
                                                          window.innerWidth <
                                                          1024
                                                        ) {
                                                          setIsMobileOpen?.(
                                                            false,
                                                          );
                                                        }
                                                      }}
                                                      className={({
                                                        isActive,
                                                      }) =>
                                                        `flex items-center px-2 py-1.5 rounded-md text-xs transition-colors ${
                                                          isActive
                                                            ? "bg-[#0E7490] text-white font-medium"
                                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/60"
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
                    <div className="space-y-1.5">
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
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-105 ${
                              selectedQuarterId === k._id
                                ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                : "bg-emerald-600 text-white"
                            }`}
                          >
                            {k.nama.charAt(0).toUpperCase()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex text-xs justify-start flex-col border-t border-[#E2E8F0] mt-2 pt-2">
                {filteredMenuBooking
                  .filter((item) => !item.requireAdmin || user?.isSystemAdmin)
                  .map((item) => renderMenuItem(item))}
              </div>
            </div>
          </nav>

          {/* Logout Button */}
          {isSidebarOpen && (
            <div className="flex justify-end items-end">
              <LogoutButton />
            </div>
          )}
          <div className={`w-full h-px my-3 ${isBookingPage ? "bg-[#D4CFC3]" : "bg-[#E2E8F0]"}`}></div>

          {/* User Profile */}
          <div
            className={`flex items-center pb-1 gap-3 transition-all duration-300 ${
              isSidebarOpen ? "justify-end" : "justify-center"
            }`}
          >
            {isSidebarOpen && user && (
              <p className="text-black font-semibold text-[1em] justify-center w-25 truncate">
                {user.username}
              </p>
            )}
            <img
              className="w-10 h-10 border rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              src={currentPhotoUrl}
              alt="Profile"
              onClick={() => setOpenDialog({ open: true, profile: user })}
            />
          </div>
        </aside>
      </div>

      <div className="z-50">
        {openDialog.open && (
          <ProfileDialog
            show={openDialog.open}
            onClose={() => setOpenDialog({ open: false, profile: null })}
            userId={openDialog.profile?._id}
            profileData={openDialog.profile}
          />
        )}
      </div>

      {/* Toggle Button Desktop */}
      {!openDialog.open && (
        <div className="hidden lg:block fixed bottom-18 left-2 z-40">
          <ToggleButtonExit
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
        </div>
      )}
    </>
  );
}
