import React, { useState } from "react";
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  Receipt,
  Layers,
  FileText,
  Clock,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import BOQTab from "./BOQ/BOQTab";

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

const ProjectDetailModal = ({ project, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!project) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const clientParties =
    project.parties?.filter((p) => p.role === "client") || [];
  const vendorParties =
    project.parties?.filter((p) => p.role === "vendor") || [];

  const statusConfig = STATUS_MAP[project.status?.toLowerCase()] || {
    style: "bg-slate-800 text-slate-300 border-slate-700",
    label: project.status || "Draft",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-white/10 relative z-10 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                  {project.nama}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.style}`}
                >
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>ID: {project._id}</span>
                {project.projectManager && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">
                      PM: {project.projectManager.username}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* TABS NAVIGATION */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "boq"
                    ? "bg-[#0E7490] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>BOQ (Bill of Quantity)</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {activeTab === "overview" ? (
            <div className="space-y-6">
              {/* METRICS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Timeline Proyek
                  </span>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {formatDate(project.startedAt)} –{" "}
                    {formatDate(project.dueDate)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Durasi pelaksanaan pekerjaan
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Scope / Lokasi Site
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {project.sites?.length > 0 ? (
                      project.sites.map((site, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 uppercase"
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
                  <p className="text-xs text-slate-500 mt-1">
                    Lokasi operasional site
                  </p>
                </div>

                <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                    Penanggung Jawab (PM)
                  </span>
                  <div className="mt-2 text-sm font-semibold text-white truncate">
                    {project.projectManager?.username || "-"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {project.projectManager?.email || "Tidak ada email"}
                  </p>
                </div>
              </div>

              {/* PARTIES & STAKEHOLDERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Parties */}
                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      Klien Terdaftar
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {clientParties.length} Klien
                    </span>
                  </div>
                  {clientParties.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      Belum ada klien yang terasosiasi.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {clientParties.map((cp) => (
                        <div
                          key={cp._id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                        >
                          <span className="font-medium text-white">
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
                <div className="bg-slate-950/40 border border-white/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Vendor / Kontraktor
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {vendorParties.length} Vendor
                    </span>
                  </div>
                  {vendorParties.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2">
                      Belum ada vendor yang terasosiasi.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {vendorParties.map((vp) => (
                        <div
                          key={vp._id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                        >
                          <span className="font-medium text-white">
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
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0E7490]/20 to-blue-600/20 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-cyan-400" />
                    Bill of Quantity (BOQ)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Kelola rincian item pekerjaan, section, satuan, harga
                    satuan, kuantitas, kalkulasi otomatis, dan persetujuan BOQ
                    pada tab BOQ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("boq")}
                  className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <span>Buka Tabel BOQ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* BOQ TAB COMPONENT */}
              <BOQTab projectId={project._id} project={project} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
