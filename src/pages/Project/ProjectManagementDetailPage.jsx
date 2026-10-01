import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "../../hook/useProject";
import { AlertCircle } from "lucide-react";
import BOQTab from "./BOQ/BOQTab";
import BudgetTab from "./Budget/BudgetTab";
import CostTab from "./Cost/CostTab";
import ProjectDetailHeader from "./components/ProjectDetailHeader";
import ProjectDetailOverview from "./components/ProjectDetailOverview";
import ProjectDetailEditModal from "./components/ProjectDetailEditModal";
import { useProjectDetailPage } from "./hooks/useProjectDetailPage";

const ProjectManagementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projectDetail } = useProject();
  const {
    data: project,
    isLoading,
    isError,
    error,
    refetch,
  } = projectDetail(id);

  const {
    activeTab,
    tabContext,
    isEditOpen,
    isFormDirty,
    setIsFormDirty,
    handleNavigateToTab,
    openEditModal,
    requestCloseEditModal,
    closeEditModal,
  } = useProjectDetailPage();

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-[#F8FAFC] min-h-screen text-[#0F172A]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="h-8 w-48 bg-[#E2E8F0] rounded-lg animate-pulse" />
        <div className="h-28 w-full bg-white rounded-2xl border border-[#E2E8F0] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (isError || !project) {
    return (
      <div
        className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="p-8 max-w-md w-full bg-white border border-rose-100 rounded-2xl text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#0F172A]">
            Gagal Memuat Proyek
          </h2>
          <p className="text-xs text-[#475569]">
            {error?.response?.data?.message ||
              error?.message ||
              "Proyek tidak ditemukan atau terjadi kendala saat memuat data."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/project-management")}
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-semibold rounded-xl text-[#475569] transition-colors cursor-pointer border border-[#E2E8F0]"
            >
              Kembali ke Daftar
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891B2] text-xs font-semibold rounded-xl text-white transition-colors cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Content ─────────────────────────────────────────────────────────────
  return (
    <div
      className="p-4 sm:p-6 mx-auto space-y-6 bg-white/20 min-h-screen text-white rounded-sm"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header: Breadcrumb + Project Identity + Tabs + Edit Button */}
      <ProjectDetailHeader
        project={project}
        activeTab={activeTab}
        onTabChange={handleNavigateToTab}
        onBack={() => navigate("/project-management")}
        onEditClick={openEditModal}
      />

      {/* Tab Content */}
      <main>
        {activeTab === "overview" ? (
          <ProjectDetailOverview
            project={project}
            onNavigateToBoq={() => handleNavigateToTab("boq")}
          />
        ) : activeTab === "boq" ? (
          <div className="animate-in fade-in duration-200">
            <BOQTab
              projectId={project._id}
              project={project}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        ) : activeTab === "budget" ? (
          <div className="animate-in fade-in duration-200">
            <BudgetTab
              projectId={project._id}
              project={project}
              tabContext={tabContext}
              onClearTabContext={() => handleNavigateToTab(activeTab, null)}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            <CostTab
              projectId={project._id}
              project={project}
              tabContext={tabContext}
              onClearTabContext={() => handleNavigateToTab(activeTab, null)}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        )}
      </main>

      {/* Edit Project Modal */}
      <ProjectDetailEditModal
        isOpen={isEditOpen}
        project={project}
        onClose={requestCloseEditModal}
        onDirtyChange={setIsFormDirty}
      />
    </div>
  );
};

export default ProjectManagementDetailPage;
