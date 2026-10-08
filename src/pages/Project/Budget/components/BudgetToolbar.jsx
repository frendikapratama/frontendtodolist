import React from "react";
import { Plus, Search, X, RefreshCw } from "lucide-react";

export const BudgetToolbar = ({
  searchInput,
  setSearchInput,
  selectedStatus,
  setSelectedStatus,
  selectedSection,
  setSelectedSection,
  availableSections,
  refetch,
  isFetching,
  handleOpenCreateModal,
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
            placeholder="Cari Budget Code, BOQ Item..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-950 text-slate-200 placeholder:text-slate-500 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
          className="text-xs bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Semua Status</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {/* Section Filter */}
        {availableSections.length > 0 && (
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-950 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Semua Section</option>
            {availableSections.map((s) => (
              <option key={s} value={s}>
                {s}
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
            className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-400" : ""}`}
          />
        </button> */}
      </div>

      {/* Create Button */}
      <button
        onClick={handleOpenCreateModal}
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Tambah Budget</span>
      </button>
    </div>
  </>
);
