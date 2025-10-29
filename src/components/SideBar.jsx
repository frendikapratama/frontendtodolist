import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { menuItems } from "../config/menu";
import { useWorkspace } from "../hook/useWorkspace";
import { useNavigate } from "react-router-dom";

import { useSelectedWorkspace } from "../context/WorkspaceContext";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
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
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
              active
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              {IconComponent && (
                <IconComponent
                  className={`w-5 h-5 ${
                    active
                      ? "text-blue-600"
                      : "text-gray-500 group-hover:text-blue-600"
                  }`}
                />
              )}
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isExpanded && (
            <div className="ml-4 space-y-1 border-l-2 border-gray-100 pl-2">
              {item.children.map((child) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    // Menu biasa
    return (
      <NavLink
        key={item.id}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group ${
            isChild ? "pl-8" : ""
          } ${
            isActive
              ? "bg-blue-600 text-white shadow-sm"
              : isChild
              ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-blue-50"
          }`
        }
        onClick={() => setIsSidebarOpen(false)}
      >
        {IconComponent && !isChild && (
          <IconComponent className="w-5 h-5 transition-colors" />
        )}
        <span className="font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 text-gray-700 p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm fixed lg:relative z-40 transition-transform lg:translate-x-0 duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="Logo" width={180} />
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
          {/* Workspaces Section */}
          {workspaces?.length > 0 && (
            <div className="mb-4 px-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Workspaces
              </h3>

              {/* Dropdown Select Workspace */}
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
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedMenus.has("workspace-dropdown")
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {expandedMenus.has("workspace-dropdown") && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {workspaces.map((ws) => (
                      <button
                        key={ws._id}
                        onClick={() => {
                          setSelectedWorkspaceId(ws._id); // Update context
                          setExpandedMenus(new Set([ws._id]));
                        }}
                        className="w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center mr-2 text-xs font-semibold">
                          {ws.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700">{ws.nama}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Projects List */}
              {selectedWorkspaceId && (
                <div className="mt-3 space-y-1">
                  {workspaces
                    .filter((ws) => ws._id === selectedWorkspaceId)
                    .map(
                      (ws) =>
                        ws.projects?.length > 0 && (
                          <div key={ws._id} className="space-y-1">
                            {ws.projects.map((project) => (
                              <button
                                key={project._id}
                                onClick={() =>
                                  navigate(`/project/${project._id}`)
                                }
                                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                              >
                                {project.nama}
                              </button>
                            ))}
                          </div>
                        )
                    )}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
