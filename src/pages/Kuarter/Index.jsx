import React from "react";
import { useKuarter } from "../../hook/useKuarter";
import { useNavigate } from "react-router-dom";
import { KuarterForm } from "./KuarterForm";

const Kuarter = () => {
  const { kuarterQuery } = useKuarter();
  const navigate = useNavigate();

  const openCreateModal = () => {
    document.getElementById("createModal").showModal();
  };

  const closeModal = () => {
    document.getElementById("createModal").close();
  };

  const handleDetailKuarter = (kuarterId) => {
    navigate(`/kuarter/${kuarterId}`);
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
                  <h2 className="card-title">{kuarter.nama}</h2>
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleDetailKuarter(kuarter._id)}
                    >
                      Detail
                    </button>
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
