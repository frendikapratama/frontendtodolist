import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { menuItems } from "../config/menu";
import { useWorkspace } from "../hook/useWorkspace";
import { useNavigate } from "react-router-dom";
import GradientText from "../components/ui/GradientText";
import Profile from "../assets/LogoPlanify.png";
import ToggleButtonExit from "../components/ui/ToggleButtonExit"
import { useAuth } from "../hook/useContext"
import LogoutButton from "../components/ui/LogoutButton"

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
  BookOpen
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  users: Users,
  reports: FileText,
  settings: Settings,
  briefcase: Briefcase,
  folder: FolderOpen,
  bookopen: BookOpen
};

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [showQuartersSection, setShowQuartersSection] = useState(false);
  const [selectedQuarterId, setSelectedQuarterId] = useState(null);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();
  const { workspacesQuery } = useWorkspace();
  const { data: workspaces } = workspacesQuery;
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useSelectedWorkspace();
  const { kuarterQuery } = useKuarter();
  const { data: kuarters = [] } = kuarterQuery;

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
        const project = workspace.projects?.find(p => p._id === projectId);
        if (project) {
          setSelectedWorkspaceId(workspace._id);

          const relatedQuarter = kuarters?.find(k => k.workspace?.includes(workspace._id));
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
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${active
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
              }`}
          >
            <div className="flex items-center space-x-3">
              {IconComponent && (
                <IconComponent
                  className={`w-5 h-5 ${active
                    ? "text-blue-600"
                    : "text-gray-500 group-hover:text-blue-600"
                    }`}
                />
              )}
              <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
            </div>
            {isSidebarOpen && (isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            ))}
          </button>

          {isExpanded && isSidebarOpen && (
            <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
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
            flex rounded-lg mt-2 transition-all duration-300 group
            ${isSidebarOpen ? "justify-start items-center px-2 py-2" : "ml-2 justify-center items-center w-7 h-7"}
            ${isChild ? "pl-8" : ""}
            ${isActive
            ? "bg-[#0E7490] text-white shadow-sm"
            : isChild
              ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
          }
          `
        }
        onClick={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
      >
        {IconComponent && (
          <IconComponent
            className={`transition-all duration-300 ease-in-out
              ${isSidebarOpen ? "ml-1 w-5 h-5" : "scale-70"}
            `}
          />
        )}
        {isSidebarOpen && (
          <span
            className="ml-3 font-medium whitespace-nowrap transition-all duration-300 ease-in-out"
          >
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  const getRelatedWorkspaces = () => {
    if (!selectedQuarterId || !kuarters?.length) return [];
    const selectedQuarter = kuarters.find(k => k._id === selectedQuarterId);
    if (!selectedQuarter?.workspace || selectedQuarter.workspace.length === 0) return [];
    const workspaceIds = selectedQuarter.workspace;
    return workspaces?.filter(ws => workspaceIds.includes(ws._id)) || [];
  };
  const relatedWorkspaces = getRelatedWorkspaces();

  return (
    <>
      {/* Overlay untuk mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <ToggleButtonExit isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:sticky lg:top-0 z-40 h-screen transition-all duration-300 ${isSidebarOpen ? "w-45" : "w-15"
        }`}>
        <aside className="w-full p-2 h-full bg-[#EFECE3] border-r border-gray-900 flex flex-col shadow-sm">
          {/* Header */}
          <div className="p-3 pb-4 border-b border-gray-200">
            <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? "justify-center" : "justify-center"
              }`}>
              <img
                src="/src/assets/LogoPlanify.png"
                alt="Logo"
                className={`transition-all duration-300 ${isSidebarOpen ? "w-9 h-9" : "scale-300"
                  }`}
              />
              {isSidebarOpen && (
                <GradientText
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="custom-class text-2xl transition-opacity duration-300"
                >
                  Planify
                </GradientText>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto flex flex-col space-y-1">
            <div className="flex text-xs justify-start flex-col">
              {menuItems.map((item) => renderMenuItem(item))}

              {/* Quarters Section */}
              {kuarters?.length > 0 && (
                <div className="mb-4 px-3">
                  {isSidebarOpen ? (
                    <>
                      <button
                        onClick={() => setShowQuartersSection(!showQuartersSection)}
                        className="w-full flex items-center justify-between text-[0.8em] pt-2 font-semibold text-gray-500 uppercase mb-2 hover:text-gray-700 transition-colors"
                      >
                        <span>Quarters</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${showQuartersSection ? "rotate-90" : ""
                            }`}
                        />
                      </button>

                      {showQuartersSection && (
                        <div className="space-y-1">
                          {kuarters.map((k) => {
                            const isQuarterActive = selectedQuarterId === k._id;

                            return (
                              <div key={k._id}>
                                <button
                                  onClick={() => {
                                    navigate(`/kuarter/${k._id}`);
                                    setSelectedQuarterId(k._id);
                                    if (k.workspace && k.workspace.length > 0) {
                                      setSelectedWorkspaceId(k.workspace[0]);
                                    }
                                    if (window.innerWidth < 1024) {
                                      setIsSidebarOpen(false);
                                    }
                                  }}
                                  className={`w-full flex items-center px-3 h-10 py-2.5 rounded-lg transition-all group ${location.pathname === `/kuarter/${k._id}` && isSidebarOpen
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
                                    }`}
                                >
                                  <div className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center mr-2 text-[0.8em] font-semibold">
                                    {k.nama.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-[0.9em]">{k.nama}</span>
                                </button>

                                {/* Workspace dan Projects*/}
                                {isQuarterActive && (
                                  <div className="ml-6 mt-2 space-y-1">
                                    {relatedWorkspaces.length > 0 ? (
                                      <div>
                                        <div className="relative">
                                          <button
                                            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                                            className="w-full flex items-center text-[0.8em] justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                                          >
                                            <div className="flex items-center">
                                              <Briefcase className="w-4 h-4 mr-2 text-gray-600" />
                                              <span className="text-[1em] text-gray-700">
                                                {selectedWorkspaceId && relatedWorkspaces.find(w => w._id === selectedWorkspaceId)
                                                  ? relatedWorkspaces.find(w => w._id === selectedWorkspaceId).nama
                                                  : "Select Workspace"}
                                              </span>
                                            </div>
                                            <ChevronDown
                                              className={`w-4 h-4 text-gray-400 transition-transform ${workspaceDropdownOpen ? "rotate-180" : ""
                                                }`}
                                            />
                                          </button>

                                          {workspaceDropdownOpen && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                              {relatedWorkspaces.map((ws) => (
                                                <button
                                                  key={ws._id}
                                                  onClick={() => {
                                                    setSelectedWorkspaceId(ws._id);
                                                    setWorkspaceDropdownOpen(false);
                                                  }}
                                                  className={`w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${selectedWorkspaceId === ws._id ? "bg-blue-50" : ""
                                                    }`}
                                                >
                                                  <div className="w-5 h-5 rounded bg-[#0E7490] text-white flex items-center justify-center mr-2 text-[0.7em] font-semibold">
                                                    {ws.nama.charAt(0).toUpperCase()}
                                                  </div>
                                                  <span className="text-gray-700 text-[0.9em]">{ws.nama}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Projects dari workspace */}
                                        {selectedWorkspaceId && (
                                          <div className="mt-2 space-y-1">
                                            {relatedWorkspaces
                                              .filter(ws => ws._id === selectedWorkspaceId)
                                              .map(ws => (
                                                ws.projects?.length > 0 && (
                                                  <div key={ws._id}>
                                                    {ws.projects.map((project) => (
                                                      <NavLink
                                                        key={project._id}
                                                        to={`/project/${project._id}`}
                                                        onClick={() => {
                                                          if (window.innerWidth < 1024) {
                                                            setIsSidebarOpen(false);
                                                          }
                                                        }}
                                                        className={({ isActive }) =>
                                                          `block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${isActive
                                                            ? "bg-[#0E7490] text-white text-[0.9em]"
                                                            : "text-gray-600 hover:text-[#234C6A] hover:bg-blue-50 text-[0.9em]"
                                                          }`
                                                        }
                                                      >
                                                        {project.nama}
                                                      </NavLink>
                                                    ))}
                                                  </div>
                                                )
                                              ))}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-gray-500 px-3 py-2">
                                        No workspace found
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
                    <div className="space-y-1">
                      {kuarters.map((k) => (
                        <button
                          key={k._id}
                          onClick={() => {
                            navigate(`/kuarter/${k._id}`);
                            setSelectedQuarterId(k._id);
                            if (k.workspace && k.workspace.length > 0) {
                              setSelectedWorkspaceId(k.workspace[0]);
                            }
                          }}
                          className={`w-full flex items-center justify-center py-2 rounded-lg transition-all ${location.pathname === `/kuarter/${k._id}` || selectedQuarterId === k._id
                            ? "bg-none text-white"
                            : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
                            }`}
                          title={k.nama}
                        >
                          <div className={`w-7 h-7 rounded flex items-center justify-center text-[0.8em] font-semibold ${location.pathname === `/kuarter/${k._id}` || selectedQuarterId === k._id
                              ? "bg-blue-600 rounded-xl text-white"
                              : "bg-green-500 text-white"
                            }`}>
                            {k.nama.charAt(0).toUpperCase()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Logout Button */}
          {isSidebarOpen && (
            <div className="flex justify-center items-center">
              <LogoutButton />
            </div>
          )}
          <div className="w-full h-px bg-gray-300 my-3"></div>
          {/* User Profile */}
          <div className={`flex items-center pb-1 gap-3 transition-all duration-300 ${isSidebarOpen ? "justify-end" : "justify-center"
            }`}>
            {isSidebarOpen && user && (
              <p className="text-black font-semibold text-[1em]">{user.username}</p>
            )}
            <img
              className="w-10 h-10 border rounded-full"
              src={Profile}
              alt="Profile"
            />
          </div>
        </aside>
      </div>

      {/* Toggle Button */}
      <div className="fixed bottom-3 left-1 z-50">
        <ToggleButtonExit
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </div>
    </>
  );
}