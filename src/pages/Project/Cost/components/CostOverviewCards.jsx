import React from "react";
import { AlertCircle, Coins, ShieldCheck, Clock } from "lucide-react";
import { formatCurrency } from "../costConstants";

export const CostOverviewCards = ({ summary }) => (
  <div>
    {/* COST METRIC HIGHLIGHTS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Total Recorded Cost
          </span>
          <Coins className="w-4 h-4 text-cyan-400" />
        </div>
        <h4 className="text-xl font-bold text-white font-mono">
          {formatCurrency(summary.totalRealized)}
        </h4>
        <p className="text-[11px] text-slate-500">Semua entri biaya diajukan</p>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Approved Cost (Actual)
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="text-xl font-bold text-emerald-400 font-mono">
          {formatCurrency(summary.totalApproved)}
        </h4>
        <p className="text-[11px] text-slate-500">Memotong Remaining Budget</p>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Pending Cost
          </span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <h4 className="text-xl font-bold text-amber-400 font-mono">
          {formatCurrency(summary.totalDraftOrSubmitted)}
        </h4>
        <p className="text-[11px] text-slate-500">Draft & Submitted review</p>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Rejected Cost
          </span>
          <AlertCircle className="w-4 h-4 text-rose-400" />
        </div>
        <h4 className="text-xl font-bold text-rose-400 font-mono">
          {formatCurrency(summary.totalRejected)}
        </h4>
        <p className="text-[11px] text-slate-500">Ditolak approval</p>
      </div>
    </div>
  </div>
);
