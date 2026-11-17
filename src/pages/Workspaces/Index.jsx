import React from "react";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate, useParams } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { useKuarter } from "../../hook/useKuarter";
import { WorkspaceForm } from "./Form";
import { useState } from "react";
import toast from "react-hot-toast";
import WorkspaceCard from "./WorkspaceCard";

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
      toast.error("Choose the quarter");
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

  const handleEditStart = (workspaceId, workspaceName) => {
    setEditing(workspaceId);
    setEditedName(workspaceName);
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
      },
    );
    setEditing(null);
  };

  const handleEditKeyDown = (e, workspaceId) => {
    if (e.key === "Enter") handleEdit(workspaceId);
    if (e.key === "Escape") setEditing(null);
  };

  const handleDelete = (workspaceId, workspaceName) => {
    if (
      window.confirm(`Are you sure want to delete this "${workspaceName}"?`)
    ) {
      deleteMutation.mutate(workspaceId);
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
      {/* Kontainer utama (overflow-visible agar fungsi sticky bekerja dengan baik) */}
      <div className="w-full bg-white/40 rounded-lg relative">
        {/* Header Sticky Full ke Samping & Atas */}
        <div className="sticky top-0 z-30 w-full px-6 py-3 backdrop-blur-xl  border-b border-white/20 flex flex-row justify-between items-center shadow-xs rounded-t-lg">
          <h2 className="text-[1.2em] font-bold text-gray-900 m-0">
            List Division
          </h2>
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm sm:btn-md"
            disabled={!kuarterId}
          >
            Add Division
          </button>
        </div>

        {/* Konten di dalam */}
        <div className="p-4 sm:p-4">
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
                <WorkspaceCard
                  key={workspace._id}
                  workspace={workspace}
                  isSelected={selectedCardId === workspace._id}
                  onCardClick={handleCardClick}
                  onEdit={handleEditStart}
                  onDelete={handleDelete}
                  onDetail={handleSelectWorkspace}
                  editing={editing}
                  editedName={editedName}
                  setEditedName={setEditedName}
                  handleEditKeyDown={handleEditKeyDown}
                  updateWorkspaceMutation={updateWorkspaceMutation}
                  deleteMutation={deleteMutation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkspaceIndex;
