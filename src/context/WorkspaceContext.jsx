import { createContext, useContext, useState, useEffect } from "react";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(() => {
    return localStorage.getItem("selectedWorkspaceId") || null;
  });
  useEffect(() => {
    if (selectedWorkspaceId) {
      localStorage.setItem("selectedWorkspaceId", selectedWorkspaceId);
    } else {
      localStorage.removeItem("selectedWorkspaceId");
    }
  }, [selectedWorkspaceId]);
  return (
    <WorkspaceContext.Provider
      value={{ selectedWorkspaceId, setSelectedWorkspaceId }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useSelectedWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useSelectedWorkspace must be used within WorkspaceProvider"
    );
  }
  return context;
};
