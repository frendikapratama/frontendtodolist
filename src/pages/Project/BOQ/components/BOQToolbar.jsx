import React from "react";
import { Search, X, Plus } from "lucide-react";
import { BOQ_STATUS_OPTIONS } from "../boqConstants";

const BOQToolbar = ({
  searchInput,
  onSearchChange,
  onClearSearch,
  selectedSection,
  onSectionChange,
  availableSections = [],
  selectedStatus,
  onStatusChange,

  onAddClick,
}) => {
  return (
    <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Debounced Search */}
        <div className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari kode, deskripsi, catatan..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900/80 text-slate-200 placeholder:text-slate-500 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
          {searchInput && (
            <button
              onClick={onClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 transition-colors"
              title="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedSection}
            onChange={(e) => onSectionChange(e.target.value)}
            className="text-xs bg-slate-900/80 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">
              Semua Section ({availableSections.length})
            </option>
            {availableSections.map((sec) => (
              <option
                key={sec}
                value={sec}
                className="bg-slate-900 text-slate-200"
              >
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-slate-900/80 text-slate-200 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            {BOQ_STATUS_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-slate-900 text-slate-200"
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={onAddClick}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item BOQ</span>
        </button>
      </div>
    </div>
  );
};

export default BOQToolbar;
