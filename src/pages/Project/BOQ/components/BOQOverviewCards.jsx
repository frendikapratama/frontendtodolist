import React from "react";
import { Layers, CheckCircle2, AlertCircle, OctagonX } from "lucide-react";

const BOQOverviewCards = ({ availableSections = [], statusCounts = {} }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Section */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Total Section
          </span>
          <Layers className="w-4 h-4 text-blue-400" />
        </div>
        <h4 className="text-xl font-bold text-blue-400 font-mono">
          {availableSections.length} Section
        </h4>
        <p className="text-xs text-slate-500">Pengelompokan pekerjaan</p>
      </div>

      {/* Card 2: Approved */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Approved
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="text-xl font-bold text-emerald-400 font-mono">
          {statusCounts?.Approved || 0} Item
        </h4>
        <p className="text-xs text-slate-500">Telah disetujui</p>
      </div>

      {/* Card 3: Draft & Submitted */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Draft & Submitted
          </span>
          <AlertCircle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-center gap-2 mt-1 font-mono">
          <span className="text-xl font-bold text-slate-200">
            {statusCounts?.Draft || 0} Draft
          </span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xl font-bold text-amber-400">
            {statusCounts?.Submitted || 0} Sub
          </span>
        </div>
        <p className="text-xs text-slate-500">Menunggu review</p>
      </div>

      {/* Card 4: Rejected */}
      <div className="bg-slate-900/60 rounded-2xl p-5 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">
            Rejected
          </span>
          <CheckCircle2 className="w-4 h-4 text-red-400" />
        </div>
        <h4 className="text-xl font-bold text-red-400 font-mono">
          {statusCounts?.Rejected || 0} Item
        </h4>
        <p className="text-xs text-slate-500">Ditolak</p>
      </div>
    </div>
  );
};

export default BOQOverviewCards;
