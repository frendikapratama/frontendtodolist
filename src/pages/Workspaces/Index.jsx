import React from "react";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate, useParams } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { useKuarter } from "../../hook/useKuarter";
import { WorkspaceForm } from "./Form";
import { useState } from "react";
import toast from "react-hot-toast";

const WorkspaceIndex = () => {
  const { id: kuarterId } = useParams();
  const { workspacesQuery, updateWorkspaceMutation, deleteMutation } =
    useWorkspace();
  const { KuarterDetail } = useKuarter();
  const navigate = useNavigate();
  const { setSelectedWorkspaceId } = useSelectedWorkspace();
  const [editing, setEditing] = useState(null);
  const [editedName, setEditedName] = useState("");

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
          // Reset ke nama awal jika error
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
        `Apakah Anda yakin ingin menghapus workspace "${workspaceName}"?`
      )
    ) {
      deleteMutation.mutate(workspaceId, {
        onSuccess: () => {
          toast.success("Workspace berhasil dihapus");
        },
      });
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
      <button
        onClick={openCreateModal}
        className="btn btn-primary mb-4"
        disabled={!kuarterId}
      >
        Tambah workspace
      </button>

      {!kuarterId && (
        <div className="alert alert-info mb-4">
          <span>Pilih kuarter terlebih dahulu untuk membuat workspace</span>
        </div>
      )}

      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h3 className="font-bold text-xl text-gray-800">
              Tambah Workspace
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
          <h2 className="text-gray-500 text-lg">Belum ada workspace</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayData?.map((workspace) => (
            <div key={workspace._id} className="card bg-base-100 shadow-xl">
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
                      disabled={updateWorkspaceMutation.isPending}
                    />
                    {updateWorkspaceMutation.isPending && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                  </div>
                ) : (
                  <h2
                    className="card-title hover:bg-gray-100 px-1 rounded cursor-pointer"
                    onClick={() => {
                      setEditing(workspace._id);
                      setEditedName(workspace.nama);
                    }}
                  >
                    {workspace.nama}
                  </h2>
                )}
                <div className="card-actions justify-between items-center mt-2">
                  <button
                    className="btn btn-ghost btn-sm text-error"
                    onClick={() => handleDelete(workspace._id, workspace.nama)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Hapus"
                    )}
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
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
