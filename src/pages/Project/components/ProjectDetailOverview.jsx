import React from "react";
import { Calendar, MapPin, UserCheck, Building2 } from "lucide-react";
import { formatProjectDetailDate } from "../projectDetailUtils";

const ProjectDetailOverview = ({ project }) => {
  const clientParties =
    project?.parties?.filter((p) => p.role === "client") || [];
  const vendorParties =
    project?.parties?.filter((p) => p.role === "vendor") || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Timeline Card */}
        <div className="border bg-slate-950/60 border-white/5 rounded-2xl p-5 space-y-2 shadow-xs">
          <span className="text-sm font-semibold text-slate-400 capitalize tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" />
            Timeline Proyek
          </span>
          <div
            className="text-base font-bold text-white pt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {formatProjectDetailDate(project?.startedAt)} –{" "}
            {formatProjectDetailDate(project?.dueDate)}
          </div>
        </div>

        {/* Scope / Site Card */}
        <div className=" border bg-slate-950/60 border-white/5 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-sm font-semibold text-slate-400 capitalize tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Scope / Lokasi Site
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project?.sites?.length > 0 ? (
              project.sites.map((site, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-md  text-sm font-semibold text-green-600 uppercase"
                >
                  {site}
                </span>
              ))
            ) : (
              <span className="text-xs text-white">Belum ditentukan</span>
            )}
          </div>
        </div>

        {/* PM Card */}
        <div className="border bg-slate-950/60 border-white/5 rounded-2xl p-5 space-y-2 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-violet-500" />
            Penanggung Jawab (PM)
          </span>
          <div
            className="text-base font-bold text-white truncate pt-1"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {project?.projectManager?.username || "-"}
          </div>
        </div>
      </div>

      {/* PARTIES & STAKEHOLDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Parties */}
        <div className="border bg-slate-950/60 border-white/5 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              Klien Terdaftar
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
              {clientParties.length} Klien
            </span>
          </div>
          {clientParties.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3">
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
        <div className="border bg-slate-950/60 border-white/5 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              Vendor / Kontraktor
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-semibold">
              {vendorParties.length} Vendor
            </span>
          </div>
          {vendorParties.length === 0 ? (
            <p className="text-xs text-[#94A3B8] italic py-3">
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
    </div>
  );
};

export default ProjectDetailOverview;
