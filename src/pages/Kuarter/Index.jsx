import React, { useState, useEffect } from "react";
import { useKuarter } from "../../hook/useKuarter";
import { useNavigate } from "react-router-dom";
import { KuarterForm } from "./KuarterForm";
import { Dot } from "lucide-react"

const Kuarter = () => {
  const { kuarterQuery, updatedKuarterMutation, deleteMutation } = useKuarter();
  const [editing, setEditing] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (deleteMutation.isSuccess) {
      closeModalDelete();
    }
  }, [deleteMutation.isSuccess]);

  const openCreateModal = () => {
    document.getElementById("createModal").showModal();
  };
  const ConfirmationModal = () => {
    document.getElementById("ConfirmationModal").showModal();
  };

  const closeModalDelete = () => {
    document.getElementById("ConfirmationModal").close();
  };
  const closeModal = () => {
    document.getElementById("createModal").close();
  };

  const handleDetailKuarter = (kuarterId) => {
    navigate(`/kuarter/${kuarterId}`);
  };

  const handleEdit = (id) => {
    if (!editedName.trim()) return;
    updatedKuarterMutation.mutate({
      id,
      data: { nama: editedName.trim() },
    });
    setEditing(null);
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === "Enter") handleEdit(id);
    if (e.key === "Escape") setEditing(null);
  };

  return (
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">List Quarters</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          Add Quarter
        </button>
      </div>

      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl text-black bg-white">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">Add Quarter</h3>
          </div>
          <KuarterForm onClose={closeModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      <dialog id="ConfirmationModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-white text-black">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-lg">
              Are you sure want to delete this quarter? this action can't be undo.
            </h3>
          </div>
          <div className="flex justify-end gap-4">
            <button className="btn btn-primary" onClick={closeModalDelete}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={() => {
                if (toDelete) deleteMutation.mutate(toDelete);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Menghapus..." : "Yes, Delete"}
            </button>
          </div>{" "}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModalDelete}>close</button>
        </form>
      </dialog>

      <div>
        {kuarterQuery.isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : kuarterQuery.data?.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-20">
            <h2 className="text-gray-500 text-lg">Belum ada kuarter</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kuarterQuery.data?.map((kuarter) => (
              <div key={kuarter._id} className="card bg-white/40 shadow-xl">
                <div className="card-body">
                  {editing === kuarter._id ? (
                    <input
                      type="text"
                      className="text-[1.2em] font-semibold text-black border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                      value={editedName}
                      autoFocus
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleEdit(kuarter._id)}
                      onKeyDown={(e) => handleEditKeyDown(e, kuarter._id)}
                    />
                  ) : (
                    <h2
                      className="card-title text-gray-900 font-bold hover:bg-gray-100 px-1 rounded cursor-pointer"
                      onClick={() => {
                        setEditing(kuarter._id);
                        setEditedName(kuarter.nama);
                      }}
                    >
                      {kuarter.nama}
                    </h2>
                  )}
                  <div className="flex flex-row justify-between">
                    <div className={`flex items-center border rounded-xl border-none bg-white/10 ${kuarter.departemen === "PBPG"
                      ? "text-blue-700"
                        : kuarter.departemen === "HPC"
                        ? "text-green-700"
                        : "text-red-700"
                      }`}>
                      <Dot className="w-9 h-9  animate-pulse" />
                      <p className={`text-[1em] font-bold pr-2`}>
                        {kuarter.departemen}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="card-actions ">
                        <button
                          className="btn btn-warning"
                          onClick={() => {
                            setToDelete(kuarter._id);
                            ConfirmationModal();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="card-actions ">
                        <button
                          className="btn btn-primary"
                          onClick={() => handleDetailKuarter(kuarter._id)}
                        >
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kuarter;
