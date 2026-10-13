import React from "react";
import { RefreshCw, Search, X } from "lucide-react";
import { BIDDING_STATUS_OPTIONS } from "../biddingConstants";

export const BiddingToolbar = ({
  inputQuery,
  setInputQuery,
  searchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {BIDDING_STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === opt.value
                ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search + Info */}
      <div className="flex items-center gap-3">
        {/* Result count badge */}
        {(searchQuery || statusFilter !== "ALL") && (
          <span className="text-xs text-slate-400 shrink-0">
            <span className="font-semibold text-white">{filteredCount}</span>
            {" / "}
            {totalCount} hasil
          </span>
        )}

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          {inputQuery !== searchQuery ? (
            <RefreshCw
              size={14}
              className="absolute left-3 top-2.5 text-cyan-400 animate-spin pointer-events-none"
            />
          ) : (
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          )}
          <input
            type="text"
            placeholder="Cari nama pengadaan..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {inputQuery && (
            <button
              type="button"
              onClick={() => setInputQuery("")}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 transition"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BiddingToolbar;
