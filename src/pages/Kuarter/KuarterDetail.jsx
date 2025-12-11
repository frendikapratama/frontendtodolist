import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useKuarter } from "../../hook/useKuarter";
import WorkspaceIndex from "../Workspaces/Index";
import WorkspaceDetailPanel from "../Workspaces/WorkspaceDetailPanel";
import NotificationBell from "../../components/ui/NotificationBell";

const KuarterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { KuarterDetail } = useKuarter();
  const kuarterDetailQuery = KuarterDetail(id);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

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
        <h2 className="text-gray-500 text-lg">Data not found</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
          Back
        </button>
      </div>
    );
  }

  const kuarterData = kuarterDetailQuery.data;

  return (
    <div className="p-2s overflow-hidden">
      <div className="flex flex-row justify-between pr-2">
        <button
          onClick={() => navigate(-1)}
          className="text-[0.8em] text-white hover:text-blue-300 active:text-blue-400 font-semibold transition-colors duration-200"
        >
          ← Back
        </button>
        <h1 className="text-[1.3em] font-bold text-white">
          Detail Quarter: {kuarterData.nama}
        </h1>
        <NotificationBell />
      </div>

      <div className="mt-6 flex flex-row gap-4">
        {/* Left Panel - Quarter Information & Workspace Detail */}
        <div className="md:w-[60%] w-full card bg-white/40 shadow-xl h-[88vh] overflow-y-auto">
          <div className="card-body">
            <h2 className="card-title text-[1.2em] text-white">Quarter Information</h2>
            <div className="divider"></div>
            <div className="text-gray-900">
              <p className="text-white">
                <strong className="text-gray-900">Name:</strong> {kuarterData.nama}
              </p>
              <p className="text-white">
                <strong className="text-gray-900">ID:</strong> {kuarterData._id}
              </p>
            </div>

            {/* Division Details Section */}
            <div className="divider mt-6"></div>
            <h2 className="card-title text-[1.2em] text-white">Division Details</h2>
            <div className="mt-4">
              <WorkspaceDetailPanel workspace={selectedWorkspace} />
            </div>
          </div>
        </div>

        {/* Right Panel - List Division */}
        <div className="md:w-[40%] w-full mt-4 md:mt-0 h-[88vh] overflow-y-auto">
          <WorkspaceIndex onWorkspaceSelect={setSelectedWorkspace} />
        </div>
      </div>
    </div>
  );
};

export default KuarterDetail;
