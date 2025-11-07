import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { menuItems } from "../config/menu";
import { useWorkspace } from "../hook/useWorkspace";
import { useNavigate } from "react-router-dom";
import GradientText from "../components/ui/GradientText"
import Profile from "../assets/LogoPlanify.png";
import ToggleButtonExit from "../components/ui/ToggleButtonExit"
import { useAuth } from "../hook/useContext"
import LogoutButton from "../components/ui/LogoutButton"

import { useSelectedWorkspace } from "../context/WorkspaceContext";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  FolderOpen,
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  products: Package,
  users: Users,
  reports: FileText,
  settings: Settings,
  briefcase: Briefcase,
  folder: FolderOpen,
};

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const [isAvatar, setIsAvatar] = useState();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();
  const { workspacesQuery } = useWorkspace();
  const { data: workspaces } = workspacesQuery;
  const { selectedWorkspaceId, setSelectedWorkspaceId } =
    useSelectedWorkspace();

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((child) => child.path === location.pathname)) {
        setExpandedMenus((prev) => new Set([...prev, item.id]));
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      setExpandedMenus(new Set([selectedWorkspaceId]));
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
          `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${isChild ? "pl-8" : ""
          } ${isActive
            ? "bg-[#0E7490] text-white shadow-sm"
            : isChild
              ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
          }`
        }
        onClick={() => {
          if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);s
          }
        }}
      >
        {IconComponent && !isChild && (
          <IconComponent className={`transition-all duration-500 ease-in-out transform ml-1
            ${isSidebarOpen ? "w-6 h-6 scale-100" : "w-5 h-5 scale-400"}
          `} />
        )}
        <span className={`font-medium transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
          {item.label}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:sticky lg:top-0 z-40 h-screen transition-all duration-300 ${isSidebarOpen ? "w-60" : "w-20"
        }`}>
        <aside className="w-full h-full bg-[#EFECE3] border-r border-gray-900 flex flex-col shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className={`flex items-center transition-all duration-300 ${isSidebarOpen ? "justify-center" : "justify-center"
              }`}>
              <img
                src="/src/assets/LogoPlanify.png"
                alt="Logo"
                className={`transition-all duration-300 ${isSidebarOpen ? "w-16 h-16" : "w-16 h-8 scale-150"
                  }`}
              />
              {isSidebarOpen && (
                <GradientText
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                  animationSpeed={3}
                  showBorder={false}
                  className="custom-class text-3xl transition-opacity duration-300"
                >
                  Planify
                </GradientText>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto flex flex-col space-y-1">
            <div className="flex justify-start flex-col">
              {menuItems.map((item) => renderMenuItem(item))}

              {/* Workspaces Section */}
              {workspaces?.length > 0 && isSidebarOpen && (
                <div className="mb-4 px-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 mt-2">
                    Workspaces
                  </h3>

                  <div className="relative">
                    <button
                      onClick={() =>
                        setExpandedMenus((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has("workspace-dropdown")) {
                            newSet.delete("workspace-dropdown");
                          } else {
                            newSet.clear();
                            newSet.add("workspace-dropdown");
                          }
                          return newSet;
                        })
                      }
                      className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                    >
                      <span className="text-sm text-gray-700">
                        {selectedWorkspaceId &&
                          workspaces.find((w) => w._id === selectedWorkspaceId)
                          ? workspaces.find((w) => w._id === selectedWorkspaceId)
                            ?.nama
                          : "Select workspace"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedMenus.has("workspace-dropdown")
                          ? "rotate-180"
                          : ""
                          }`}
                      />
                    </button>

                    {expandedMenus.has("workspace-dropdown") && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {workspaces.map((ws) => (
                          <button
                            key={ws._id}
                            onClick={() => {
                              setSelectedWorkspaceId(ws._id);
                              setExpandedMenus(new Set([ws._id]));
                            }}
                            className="w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="w-6 h-6 rounded bg-[#0E7490] text-white flex items-center justify-center mr-2 text-xs font-semibold">
                              {ws.nama.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-gray-700">{ws.nama}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedWorkspaceId && (
                    <div className="mt-3 space-y-1">
                      {workspaces
                        .filter((ws) => ws._id === selectedWorkspaceId)
                        .map(
                          (ws) =>
                            ws.projects?.length > 0 && (
                              <div key={ws._id} className="space-y-1">
                                {ws.projects.map((project) => (
                                  <NavLink
                                    key={project._id}
                                    to={`/project/${project._id}`}
                                    onClick={() => {
                                      if (window.innerWidth < 1024) {
                                        setIsSidebarOpen(false);
                                      }
                                      setSelectedWorkspaceId(ws._id);
                                    }}
                                    className={({ isActive }) =>
                                      `block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? "bg-[#0E7490] text-white"
                                        : "text-gray-600 hover:text-[#234C6A] hover:bg-blue-50"
                                      }`
                                    }
                                  >
                                    {project.nama}
                                  </NavLink>
                                ))}
                              </div>
                            )
                        )}
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
          <div className={`flex items-center px-4 pb-4 gap-3 transition-all duration-300 ${isSidebarOpen ? "justify-end" : "justify-center"
            }`}>
            {isSidebarOpen && user && (
              <p className="text-black font-semibold text-lg">{user.username}</p>
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
      <div className="fixed bottom-4 left-3 z-50">
        <ToggleButtonExit
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </div>
    </>
  );
}