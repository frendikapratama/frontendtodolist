import React, { useState, useEffect } from "react";
import { useKuarter } from "../../hook/useKuarter";
import { useNavigate } from "react-router-dom";
import { KuarterForm } from "./KuarterForm";

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Kuarter</h1>
        <button onClick={openCreateModal} className="btn btn-primary">
          Tambah Kuarter
        </button>
      </div>

      <dialog id="createModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">Tambah Kuarter</h3>
          </div>
          <KuarterForm onClose={closeModal} />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      <dialog id="ConfirmationModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">
              Yakin akan hapus Kuarter ini?, data tidak bisa di kembalikan dan
              data di dalam kuarter ini akan ikut terhapus
            </h3>
          </div>
          <div className="flex justify-end gap-4">
            <button className="btn btn-primary" onClick={closeModalDelete}>
              Batal
            </button>
            <button
              className="btn btn-error"
              onClick={() => {
                if (toDelete) deleteMutation.mutate(toDelete);
              }}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Menghapus..." : "Ya, hapus"}
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
              <div key={kuarter._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  {editing === kuarter._id ? (
                    <input
                      type="text"
                      className="text-xl border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                      value={editedName}
                      autoFocus
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={() => handleEdit(kuarter._id)}
                      onKeyDown={(e) => handleEditKeyDown(e, kuarter._id)}
                    />
                  ) : (
                    <h2
                      className="card-title hover:bg-gray-100 px-1 rounded cursor-pointer"
                      onClick={() => {
                        setEditing(kuarter._id);
                        setEditedName(kuarter.nama);
                      }}
                    >
                      {kuarter.nama}
                    </h2>
                  )}
                  <div className="flex flex-row gap-2 justify-end">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Kuarter;
