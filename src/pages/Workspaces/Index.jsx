import React from "react";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate, useParams } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { useKuarter } from "../../hook/useKuarter";
import { WorkspaceForm } from "./Form";
import { useState } from "react";
import toast from "react-hot-toast";
import ProgressBar from "../../components/ui/ProgressBar";

const WorkspaceIndex = ({ onWorkspaceSelect }) => {
  const { id: kuarterId } = useParams();
  const { workspacesQuery, updateWorkspaceMutation, deleteMutation } =
    useWorkspace();
  const { KuarterDetail } = useKuarter();
  const navigate = useNavigate();
  const { setSelectedWorkspaceId } = useSelectedWorkspace();
  const [editing, setEditing] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [selectedCardId, setSelectedCardId] = useState(null);

  const kuarterDetailQuery = KuarterDetail(kuarterId);

  const openCreateModal = () => {
    if (!kuarterId) {
      toast.error("Pilih kuarter terlebih dahulu");
      return;
    }
    document.getElementById("createModal").showModal();
  };

  const closeModal = () => {
    document.getElementById("createModal").close();
  };

  const handleSelectWorkspace = (workspaceId) => {
    setSelectedWorkspaceId(workspaceId);
    navigate(`/workspaces/${workspaceId}`);
  };

  const handleCardClick = (workspace) => {
    setSelectedCardId(workspace._id);
    if (onWorkspaceSelect) {
      onWorkspaceSelect(workspace);
    }
  };

  const handleEdit = (workspaceId) => {
    if (!editedName.trim() || updateWorkspaceMutation.isPending) return;

    updateWorkspaceMutation.mutate(
      {
        id: workspaceId,
        data: { nama: editedName.trim() },
        kuarterId,
      },
      {
        onError: () => {
          const workspace = displayData?.find((w) => w._id === workspaceId);
          if (workspace) {
            setEditedName(workspace.nama);
          }
        },
      }
    );
    setEditing(null);
  };

  const handleEditKeyDown = (e, workspaceId) => {
    if (e.key === "Enter") handleEdit(workspaceId);
    if (e.key === "Escape") setEditing(null);
  };

  const handleDelete = (workspaceId, workspaceName) => {
    if (
      window.confirm(
        `Are you sure want to delete this "${workspaceName}"?`
      )
    ) {
      deleteMutation.mutate(workspaceId);
      // Reset selected workspace if deleted
      if (selectedCardId === workspaceId) {
        setSelectedCardId(null);
        if (onWorkspaceSelect) {
          onWorkspaceSelect(null);
        }
      }
    }
  };

  const displayData = kuarterId
    ? kuarterDetailQuery.data?.workspace
    : workspacesQuery.data;

  const isLoading = kuarterId
    ? kuarterDetailQuery.isLoading
    : workspacesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/40 p-4 rounded-lg">
        <div className="flex flex-row backdrop-blur-lg rounded-2xl justify-between items-center sticky top-0 p-1 z-50">
          <h2 className="text-[1.2em] font-bold mb-4">List Division</h2>
          <button
            onClick={openCreateModal}
            className="btn btn-primary mb-2"
            disabled={!kuarterId}
          >
            Add Division
          </button>
        </div>

        {!kuarterId && (
          <div className="alert alert-info mb-4">
            <span>Choose any quarter to make a workspace</span>
          </div>
        )}

        <dialog id="createModal" className="modal">
          <div className="modal-box w-11/12 max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white border-none">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="font-bold text-xl text-gray-800">
                Add Division
              </h3>
            </div>
            <WorkspaceForm onClose={closeModal} kuarterId={kuarterId} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={closeModal}>close</button>
          </form>
        </dialog>

        {displayData?.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-20">
            <h2 className="text-gray-500 text-lg">There is no Division</h2>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayData?.map((workspace) => (
              <div
                key={workspace._id}
                className={`card text-black bg-white/40 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${selectedCardId === workspace._id ? "ring-2 ring-blue-500" : ""
                  }`}
                onClick={() => handleCardClick(workspace)}
              >
                <div className="card-body">
                  {editing === workspace._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="text-xl border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                        value={editedName}
                        autoFocus
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, workspace._id)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={updateWorkspaceMutation.isPending}
                      />
                      {updateWorkspaceMutation.isPending && (
                        <span className="loading loading-spinner loading-sm"></span>
                      )}
                    </div>
                  ) : (
                    <h2
                      className="card-title hover:bg-gray-100 px-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditing(workspace._id);
                        setEditedName(workspace.nama);
                      }}
                    >
                      {workspace.nama}
                    </h2>
                  )}
                  <div className="flex justify-between">
                    <div className="flex mt-2 items-center w-full">
                      <div className="w-40">
                        <p className="text-[0.8em] font-semibold mb-1 text-gray-800">
                          Total Progress
                        </p>
                        <ProgressBar progress={90} />
                      </div>
                    </div>
                    <div className="card-actions justify-end flex flex-row items-center mt-2">
                      <button
                        className="btn btn-sm w-14 btn-warning text-orange-900"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(workspace._id, workspace.nama);
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <span className="loading loading-spinner loading-xs "></span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                      <button
                        className="btn btn-primary btn-sm w-14"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectWorkspace(workspace._id);
                        }}
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WorkspaceIndex;