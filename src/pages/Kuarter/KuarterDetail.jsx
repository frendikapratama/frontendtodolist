import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKuarter } from "../../hook/useKuarter";
import WorkspaceIndex from "../Workspaces/Index";

const KuarterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { KuarterDetail } = useKuarter();
  const kuarterDetailQuery = KuarterDetail(id);

  if (kuarterDetailQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!kuarterDetailQuery.data) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-gray-500 text-lg">Data tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
          Kembali
        </button>
      </div>
    );
  }

  const kuarterData = kuarterDetailQuery.data;

  return (
    <div className="p-6">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold mt-4">
          Detail Kuarter: {kuarterData.nama}
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Informasi Kuarter</h2>
            <div className="divider"></div>
            <p>
              <strong>Nama:</strong> {kuarterData.nama}
            </p>
            <p>
              <strong>ID:</strong> {kuarterData._id}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-bold mb-4">Daftar Workspace</h2>
          {/* WorkspaceIndex akan otomatis menggunakan id dari useParams */}
          <WorkspaceIndex />
        </div>
      </div>
    </div>
  );
};

export default KuarterDetail;
