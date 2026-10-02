import React from "react";
import {
  CheckCircle2,
  Wallet,
  Coins,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { formatCurrency } from "../budgetConstants";

export const BudgetOverviewCards = ({ summary }) => (
  <>
    {/* 5-METRIC SUMMARY CARDS ACCORDING TO PRD */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Total BOQ Value */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Total BOQ Value
          </span>
          <Wallet className="w-4 h-4 text-cyan-400" />
        </div>
        <h4 className="text-lg font-bold text-white font-mono">
          {formatCurrency(summary.totalBOQValue)}
        </h4>
        <p className="text-[11px] text-slate-500">Nilai dasar seluruh BOQ</p>
      </div>

      {/* Planned Budget */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Planned Budget
          </span>
          <Coins className="w-4 h-4 text-purple-400" />
        </div>
        <h4 className="text-lg font-bold text-purple-300 font-mono">
          {formatCurrency(summary.totalPlannedBudget)}
        </h4>
        <p className="text-[11px] text-slate-500">Anggaran diajukan</p>
      </div>

      {/* Approval Budget */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Approval Budget
          </span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <h4 className="text-lg font-bold text-emerald-400 font-mono">
          {formatCurrency(summary.totalApprovalBudget)}
        </h4>
        <p className="text-[11px] text-slate-500">Anggaran disetujui</p>
      </div>

      {/* Actual Cost */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Actual Cost
          </span>
          <TrendingDown className="w-4 h-4 text-amber-400" />
        </div>
        <h4 className="text-lg font-bold text-amber-400 font-mono">
          {formatCurrency(summary.totalActualCost)}
        </h4>
        <p className="text-[11px] text-slate-500">Realisasi (Approved Cost)</p>
      </div>

      {/* Remaining Budget */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Remaining Budget
          </span>
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
        </div>
        <h4
          className={`text-lg font-bold font-mono ${
            summary.totalRemainingBudget < 0 ? "text-rose-400" : "text-blue-300"
          }`}
        >
          {formatCurrency(summary.totalRemainingBudget)}
        </h4>
        <p className="text-[11px] text-slate-500">Approval - Actual</p>
      </div>
    </div>
  </>
);
