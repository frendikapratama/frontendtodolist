import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

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
