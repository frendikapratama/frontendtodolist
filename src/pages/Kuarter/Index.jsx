import React, { useState, useEffect } from "react";
import { useKuarter } from "../../hook/useKuarter";
import { useNavigate } from "react-router-dom";
import { KuarterForm } from "./KuarterForm";
import { Dot, Trash2, Eye } from "lucide-react"
import NotificationBell from "../../components/ui/NotificationBell";

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
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">List Quarters</h1>
        <div className="flex flex-row gap-2 items-center">
          <NotificationBell />
          <button
            onClick={openCreateModal}
            className="px-6 py-2.5 bg-primary hover:from-blue-400 text-white font-medium rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-300 hover:shadow-xl"
          >
            Add Quarter
          </button>
        </div>
      </div>

      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl text-black bg-white rounded-2xl shadow-2xl">
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
        <div className="modal-box w-11/12 max-w-xl bg-white text-black rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-lg">
              Are you sure want to delete this quarter? This action can't be undone.
            </h3>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-200"
              onClick={closeModalDelete}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              onClick={() => {
                if (toDelete) deleteMutation.mutate(toDelete);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModalDelete}>close</button>
        </form>
      </dialog>

      <div>
        {kuarterQuery.isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <span className="loading loading-spinner loading-lg text-white"></span>
          </div>
        ) : kuarterQuery.data?.length === 0 ? (
          <div className="flex flex-col justify-center items-center mt-20">
            <div className="bg-[#1A3D64]/30 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-gray-300 text-lg">Belum ada kuarter</h2>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kuarterQuery.data?.map((kuarter) => (
              <div
                key={kuarter._id}
                className="bg-[#1A3D64]/30 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl hover:bg-[#1A3D64]/40 transition-all duration-300 overflow-hidden"
              >
                <div className="p-5">
                  {editing === kuarter._id ? (
                    <input
                      type="text"
                      className="text-lg font-semibold text-white bg-[#1D546C]/40 border border-white/30 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      value={editedName}
                      autoFocus
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleEdit(kuarter._id)}
                      onKeyDown={(e) => handleEditKeyDown(e, kuarter._id)}
                    />
                  ) : (
                    <h2
                      className="text-xl font-bold text-white hover:bg-[#1D546C]/30 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 mb-4"
                      onClick={() => {
                        setEditing(kuarter._id);
                        setEditedName(kuarter.nama);
                      }}
                    >
                      {kuarter.nama}
                    </h2>
                  )}

                  <div className="flex flex-col gap-3 mt-4">
                    <div className={`flex items-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 w-fit ${kuarter.departemen === "PBPG"
                      ? "text-blue-400"
                      : kuarter.departemen === "HPC"
                        ? "text-green-400"
                        : kuarter.departemen === "PT"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}>
                      <Dot className="w-9 h-9 animate-pulse" />
                      <p className="text-sm font-bold pr-3">
                        {kuarter.departemen}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium rounded-xl transition-all duration-200 border border-red-500/30 flex items-center justify-center gap-2"
                        onClick={() => {
                          setToDelete(kuarter._id);
                          ConfirmationModal();
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        className="flex-1 px-4 py-2.5 bg-primary hover:from-blue-400 hover:shadow-xl text-white font-medium rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={() => handleDetailKuarter(kuarter._id)}
                      >
                        <Eye className="w-4 h-4" />
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
    </div>
  );
};

export default Kuarter;