import {
  Check,
  ChevronDown,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  PROJECT_SITE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
} from "../projectListConstants";
import {
  getDivisionDisplayName,
  getUserDisplayName,
} from "../projectListUtils";

const ActiveFilterChip = ({ label, value, onRemove, valueClassName = "" }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">
    {label}: <strong className={`text-white ${valueClassName}`}>{value}</strong>
    <button onClick={onRemove} className="hover:text-rose-400 ml-0.5">
      <X className="w-3 h-3" />
    </button>
  </span>
);

const SearchableFilter = ({
  label,
  emptyLabel,
  value,
  displayValue,
  items,
  isOpen,
  searchValue,
  searchPlaceholder,
  emptyMessage,
  dropdownRef,
  isLoading,
  onToggle,
  onSearchChange,
  onClear,
  onSelect,
}) => (
  <div className="space-y-1" ref={dropdownRef}>
    <label className="text-xs text-slate-400 font-medium">{label}</label>
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={isLoading}
        className="w-full min-h-10 text-left bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:border-blue-500 flex items-center justify-between transition-colors disabled:opacity-60"
      >
        <span className="truncate">
          {isLoading ? "Memuat data..." : displayValue || emptyLabel}
        </span>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <span
              role="button"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              className="p-0.5 text-slate-400 hover:text-white"
              title="Hapus pilihan"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-white/10 bg-slate-950/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                autoFocus
                className="w-full bg-slate-900 text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-white/5 py-1">
            <button
              type="button"
              onClick={() => onSelect("")}
              className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${!value ? "text-blue-400 font-semibold bg-blue-500/10" : "text-slate-300"}`}
            >
              <span>{emptyLabel}</span>
              {!value && <Check className="w-3.5 h-3.5 text-blue-400" />}
            </button>
            {items.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                {emptyMessage}
              </div>
            ) : (
              items.map((item) => {
                const isSelected = value === item._id;
                const itemName =
                  label === "Project Manager"
                    ? getUserDisplayName(item)
                    : getDivisionDisplayName(item);
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => onSelect(item._id)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${isSelected ? "text-blue-400 font-semibold bg-blue-500/10" : "text-slate-200"}`}
                  >
                    <div className="truncate">
                      <div className="truncate">{itemName}</div>
                      {label === "Project Manager" && item.email && (
                        <div className="text-[10px] text-slate-400 truncate">
                          {item.email}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

const ProjectFilters = ({ state }) => {
  const {
    projectQuery,
    searchInput,
    setSearchInput,
    isSearchPending,
    isFilterOpen,
    setIsFilterOpen,
    hasActiveFilters,
    resetFilters,
    status,
    setStatus,
    sites,
    setSites,
    projectManager,
    setProjectManager,
    divisionId,
    setDivisionId,
    setPage,
    selectedProjectManagerName,
    selectedDivisionName,
    filteredUsers,
    filteredDivisions,
    isUsersLoading,
    projectManagerDropdownRef,
    divisionDropdownRef,
    isProjectManagerDropdownOpen,
    setIsProjectManagerDropdownOpen,
    isDivisionDropdownOpen,
    setIsDivisionDropdownOpen,
    projectManagerSearch,
    setProjectManagerSearch,
    divisionSearch,
    setDivisionSearch,
    setSearch,
  } = state;
  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
  };
  const setFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };
  const selectProjectManager = (id) => {
    setFilter(setProjectManager, id);
    setIsProjectManagerDropdownOpen(false);
    setProjectManagerSearch("");
  };
  const selectDivision = (id) => {
    setFilter(setDivisionId, id);
    setIsDivisionDropdownOpen(false);
    setDivisionSearch("");
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama proyek atau PM..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="w-full min-h-11 bg-slate-900 text-white placeholder:text-slate-500 text-sm pl-10 pr-10 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {(isSearchPending || projectQuery.isFetching) &&
            !searchInput === false && (
              <Loader2 className="w-4 h-4 absolute right-9 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
            )}
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
              aria-label="Hapus kata kunci pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`min-h-11 px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer ${hasActiveFilters ? "bg-blue-600/10 border-blue-500/40 text-blue-400" : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Data</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="min-h-11 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs sm:text-sm font-medium flex items-center gap-1.5 justify-center transition-all cursor-pointer"
              title="Reset Semua Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium">
            Filter Aktif:
          </span>
          {status && (
            <ActiveFilterChip
              label="Status"
              value={status}
              valueClassName="capitalize"
              onRemove={() => setFilter(setStatus, "")}
            />
          )}
          {sites && (
            <ActiveFilterChip
              label="Site"
              value={sites}
              valueClassName="uppercase"
              onRemove={() => setFilter(setSites, "")}
            />
          )}
          {projectManager && (
            <ActiveFilterChip
              label="PM"
              value={selectedProjectManagerName || "1 Terpilih"}
              onRemove={() => setFilter(setProjectManager, "")}
            />
          )}
          {divisionId && (
            <ActiveFilterChip
              label="Divisi"
              value={selectedDivisionName || "1 Terpilih"}
              onRemove={() => setFilter(setDivisionId, "")}
            />
          )}
        </div>
      )}
      {isFilterOpen && (
        <div className="p-4 bg-slate-900/90 border border-white/10 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Filter Sekunder
            </span>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">
                Status Proyek
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) => setFilter(setStatus, event.target.value)}
                  className="w-full min-h-10 appearance-none bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Semua Status</option>
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">
                Lokasi Site
              </label>
              <div className="relative">
                <select
                  value={sites}
                  onChange={(event) => setFilter(setSites, event.target.value)}
                  className="w-full min-h-10 appearance-none bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Semua Site</option>
                  {PROJECT_SITE_OPTIONS.map((site) => (
                    <option key={site} value={site} className="capitalize">
                      {site.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <SearchableFilter
              label="Project Manager"
              emptyLabel="Semua PM"
              value={projectManager}
              displayValue={selectedProjectManagerName}
              items={filteredUsers}
              isOpen={isProjectManagerDropdownOpen}
              searchValue={projectManagerSearch}
              searchPlaceholder="Cari nama atau email PM..."
              emptyMessage="PM tidak ditemukan"
              dropdownRef={projectManagerDropdownRef}
              isLoading={isUsersLoading}
              onToggle={() => {
                setIsProjectManagerDropdownOpen((value) => !value);
                setIsDivisionDropdownOpen(false);
              }}
              onSearchChange={setProjectManagerSearch}
              onClear={() => setFilter(setProjectManager, "")}
              onSelect={selectProjectManager}
            />
            <SearchableFilter
              label="Divisi Terkait"
              emptyLabel="Semua Divisi"
              value={divisionId}
              displayValue={selectedDivisionName}
              items={filteredDivisions}
              isOpen={isDivisionDropdownOpen}
              searchValue={divisionSearch}
              searchPlaceholder="Cari nama divisi..."
              emptyMessage="Divisi tidak ditemukan"
              dropdownRef={divisionDropdownRef}
              onToggle={() => {
                setIsDivisionDropdownOpen((value) => !value);
                setIsProjectManagerDropdownOpen(false);
              }}
              onSearchChange={setDivisionSearch}
              onClear={() => setFilter(setDivisionId, "")}
              onSelect={selectDivision}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProjectFilters;
