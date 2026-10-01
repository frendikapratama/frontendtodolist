import React from "react";
import { Layers, CheckCircle2, AlertCircle, OctagonX } from "lucide-react";

const BOQOverviewCards = ({ availableSections = [], statusCounts = {} }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Section */}
      <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 shadow-sm flex items-center justify-between backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Section
          </p>
          <h3 className="text-xl font-bold text-slate-100 mt-1">
            {availableSections.length} Kategori
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pengelompokan pekerjaan
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Approved */}
      <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 shadow-sm flex items-center justify-between backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Approved
          </p>
          <h3 className="text-xl font-bold text-emerald-400 mt-1">
            {statusCounts?.Approved || 0} Item
          </h3>
          <p className="text-xs text-slate-400 mt-1">Telah disetujui</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Draft & Submitted */}
      <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 shadow-sm flex items-center justify-between backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Draft & Submitted
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-slate-200">
              {statusCounts?.Draft || 0} Draft
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-lg font-bold text-amber-400">
              {statusCounts?.Submitted || 0} Sub
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Menunggu review</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: Rejected */}
      <div className="bg-slate-950/60 rounded-2xl p-5 border border-white/10 shadow-sm flex items-center justify-between backdrop-blur-md">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rejected
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-slate-200">
              {statusCounts?.Rejected || 0} Item
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Ditolak</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
          <OctagonX className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default BOQOverviewCards;
