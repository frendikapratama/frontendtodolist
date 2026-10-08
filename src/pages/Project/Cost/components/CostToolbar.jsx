import React from "react";
import { Plus, Search, X, RefreshCw } from "lucide-react";

export const CostToolbar = ({
  searchInput,
  setSearchInput,
  selectedStatus,
  setSelectedStatus,
  selectedBudgetId,
  setSelectedBudgetId,
  allBudgets,
  refetch,
  isFetching,
  handleOpenCreateModal,
  setPage,
}) => (
  <>
    {/* TOOLBAR CONTROLS */}
    <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari Cost Code, deskripsi..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 text-slate-200 placeholder:text-slate-500 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="text-xs bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Budget Code Filter */}
        {allBudgets.length > 0 && (
          <select
            value={selectedBudgetId}
            onChange={(e) => {
              setSelectedBudgetId(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">Semua Budget</option>
            {allBudgets.map((b) => (
              <option key={b._id} value={b._id}>
                {b.budgetCode} - {b.boqItem?.description}
              </option>
            ))}
          </select>
        )}

        {/* Refresh */}
        {/* <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition disabled:opacity-50 cursor-pointer"
          title="Muat Ulang"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-cyan-400" : ""}`}
          />
        </button> */}
      </div>

      {/* Record Cost Button */}
      <button
        onClick={handleOpenCreateModal}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Catat Biaya (Cost)</span>
      </button>
    </div>
  </>
);
