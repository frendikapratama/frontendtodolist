import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProject } from "../../hook/useProject";
import FormProject from "./Form";
import BOQTab from "./BOQ/BOQTab";
import BudgetTab from "./Budget/BudgetTab";
import CostTab from "./Cost/CostTab";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  Receipt,
  FileText,
  Clock,
  ChevronRight,
  Edit3,
  Layers,
  AlertCircle,
  X,
  Plus,
  Coins,
  Wallet,
} from "lucide-react";

const STATUS_MAP = {
  draft: {
    style: "bg-slate-800 text-slate-300 border-slate-700",
    label: "Draft",
  },
  planning: {
    style: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    label: "Planning",
  },
  "in progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  "in-progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  hold: {
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Hold",
  },
  completed: {
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Completed",
  },
  cancelled: {
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    label: "Cancelled",
  },
};

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

  const [activeTab, setActiveTab] = useState("overview");
  const [tabContext, setTabContext] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleNavigateToTab = (tab, context = null) => {
    setActiveTab(tab);
    setTabContext(context);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCloseEdit = () => {
    if (isFormDirty) {
      const confirmClose = window.confirm(
        "Perubahan yang belum disimpan akan hilang. Tutup form edit ini?",
      );
      if (!confirmClose) return;
    }
    setIsEditOpen(false);
    setIsFormDirty(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
        <div className="h-8 w-48 bg-slate-800/60 rounded-lg animate-pulse" />
        <div className="h-28 w-full bg-slate-900/60 rounded-2xl border border-white/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 bg-slate-900/40 rounded-xl border border-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="p-8 max-w-md w-full bg-slate-900 border border-rose-500/20 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Gagal Memuat Proyek</h2>
          <p className="text-xs text-slate-400">
            {error?.response?.data?.message ||
              error?.message ||
              "Proyek tidak ditemukan atau terjadi kendala saat memuat data."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/project-management")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition"
            >
              Kembali ke Daftar
            </button>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const clientParties =
    project.parties?.filter((p) => p.role === "client") || [];
  const vendorParties =
    project.parties?.filter((p) => p.role === "vendor") || [];

  const statusConfig = STATUS_MAP[project.status?.toLowerCase()] || {
    style: "bg-slate-800 text-slate-300 border-slate-700",
    label: project.status || "Draft",
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* TOP NAVIGATION / BREADCRUMB */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/project-management")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Proyek</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to="/project-management"
            className="hover:text-blue-400 transition"
          >
            Project Management
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-200 font-medium truncate max-w-[200px]">
            {project.nama}
          </span>
        </div>
      </div>

      {/* HERO / HEADER SECTION */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {project.nama}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.style}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {statusConfig.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-mono text-slate-500">
                ID: {project._id}
              </span>
              {project.projectManager && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    PM: {project.projectManager.username}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS & TAB SWITCHER */}
        <div className="flex flex-wrap items-center gap-3">
          {/* TABS NAVIGATION */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("boq")}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "boq"
                  ? "bg-[#0E7490] text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>BOQ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("budget")}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "budget"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Budget</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cost")}
              className={`px-3.5 py-2 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "cost"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Cost</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="min-h-10 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Proyek</span>
          </button>
        </div>
      </div>

      {/* CONTENT BODY */}
      <main>
        {activeTab === "overview" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* METRICS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Timeline Proyek
                </span>
                <div className="text-base font-bold text-white pt-1">
                  {formatDate(project.startedAt)} –{" "}
                  {formatDate(project.dueDate)}
                </div>
                <p className="text-xs text-slate-500">
                  Durasi pelaksanaan pekerjaan
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Scope / Lokasi Site
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.sites?.length > 0 ? (
                    project.sites.map((site, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 uppercase"
                      >
                        {site}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Belum ditentukan
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Lokasi operasional proyek
                </p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-400" />
                  Penanggung Jawab (PM)
                </span>
                <div className="text-base font-bold text-white truncate pt-1">
                  {project.projectManager?.username || "-"}
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {project.projectManager?.email || "Tidak ada email"}
                </p>
              </div>
            </div>

            {/* PARTIES & STAKEHOLDERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Parties */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Klien Terdaftar
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    {clientParties.length} Klien
                  </span>
                </div>
                {clientParties.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">
                    Belum ada klien yang terasosiasi.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientParties.map((cp) => (
                      <div
                        key={cp._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs"
                      >
                        <span className="font-semibold text-white">
                          {cp.party?.name || "-"}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {cp.party?.type || "Corporate Client"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vendor Parties */}
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    Vendor / Kontraktor
                  </h4>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                    {vendorParties.length} Vendor
                  </span>
                </div>
                {vendorParties.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">
                    Belum ada vendor yang terasosiasi.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {vendorParties.map((vp) => (
                      <div
                        key={vp._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs"
                      >
                        <span className="font-semibold text-white">
                          {vp.party?.name || "-"}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {vp.party?.type || "Vendor Partner"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* QUICK NAVIGATION TO BOQ BANNER */}
            <div className="p-6 rounded-2xl bg-linear-to-r from-[#0E7490]/20 via-blue-600/10 to-transparent border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-400" />
                  Bill of Quantity (BOQ)
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Rincian pekerjaan proyek ini dapat dikelola pada tab BOQ.
                  Termasuk penambahan item baru, pengaturan satuan, harga
                  satuan, status approval (Draft, Submitted, Approved,
                  Rejected), dan subtotal per section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("boq")}
                className="px-5 py-2.5 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-600/20 cursor-pointer"
              >
                <span>Buka Tabel BOQ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : activeTab === "boq" ? (
          <div className="animate-in fade-in duration-200">
            {/* BOQ TAB COMPONENT */}
            <BOQTab
              projectId={project._id}
              project={project}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        ) : activeTab === "budget" ? (
          <div className="animate-in fade-in duration-200">
            {/* BUDGET TAB COMPONENT */}
            <BudgetTab
              projectId={project._id}
              project={project}
              tabContext={tabContext}
              onClearTabContext={() => setTabContext(null)}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        ) : (
          <div className="animate-in fade-in duration-200">
            {/* COST TAB COMPONENT */}
            <CostTab
              projectId={project._id}
              project={project}
              tabContext={tabContext}
              onClearTabContext={() => setTabContext(null)}
              onNavigateToTab={handleNavigateToTab}
            />
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={handleCloseEdit}
            aria-hidden="true"
          />
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <h3 className="font-bold text-lg">Edit Proyek</h3>
              <button
                onClick={handleCloseEdit}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Tutup Form Edit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FormProject
              project={project}
              onClose={() => {
                setIsEditOpen(false);
                setIsFormDirty(false);
              }}
              onDirtyChange={setIsFormDirty}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagementDetailPage;
