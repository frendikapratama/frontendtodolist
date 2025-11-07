import React from "react";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate, useParams } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { useKuarter } from "../../hook/useKuarter";
import { WorkspaceForm } from "./Form";
const WorkspaceIndex = () => {
  const { id } = useParams();
  const { workspacesQuery } = useWorkspace();
  const { KuarterDetail } = useKuarter();
  const navigate = useNavigate();
  const { setSelectedWorkspaceId } = useSelectedWorkspace();

  const kuarterDetailQuery = KuarterDetail(id);

  const openCreateModal = () => {
    if (!id) {
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

  // Jika ada id (dari kuarter detail), ambil workspace dari kuarter
  // Jika tidak, tampilkan semua workspace
  const displayData = id
    ? kuarterDetailQuery.data?.workspace
    : workspacesQuery.data;

  const isLoading = id
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
        disabled={!id} // Disable jika tidak ada kuarterId
      >
        Tambah workspace
      </button>

      {!id && (
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
          <WorkspaceForm onClose={closeModal} kuarterId={id} />
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
