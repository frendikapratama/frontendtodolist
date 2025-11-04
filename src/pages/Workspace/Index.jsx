import React from "react";
import { useWorkspace } from "../../hook/useWorkspace";
import { WorkspaceForm } from "./Form";
import { useNavigate } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
const WorkspaceIndex = () => {
  const { workspacesQuery } = useWorkspace();
  const navigate = useNavigate();
  const { setSelectedWorkspaceId } = useSelectedWorkspace();

  const openCreateModal = () => {
    document.getElementById("createModal").showModal();
  };

  const closeModal = () => {
    document.getElementById("createModal").close();
  };

  const handleSelectWorkspace = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    navigate(`/workspaces/${workspaceId}`);
  };

  return (
    <>
      <button onClick={openCreateModal} className="btn btn-primary">
        Tambah workspace
      </button>
      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h3 className="font-bold text-xl text-gray-800">Tambah</h3>
          </div>
          <WorkspaceForm onClose={closeModal} />
        </div>
      </dialog>
      {workspacesQuery.data?.length === 0 ? (
        <div className="flex flex-col justify-center items-center mt-20">
          <h2 className="text-gray-500 text-lg">Belum ada workspace</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspacesQuery.data?.map((workspace) => (
            <div key={workspace._id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{workspace.nama}</h2>
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectWorkspace(workspace._id)}
                  >
                    Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default WorkspaceIndex;
