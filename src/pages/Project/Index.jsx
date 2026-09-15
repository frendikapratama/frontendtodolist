import React, { useState, useEffect, useMemo, useRef } from "react";
import { useProject } from "../../hook/useProject";
import { useDivision } from "../../hook/useDivision";
import { getUsers } from "../../services/userServices";
import FormProject from "./Form";
import ProjectDetailModal from "./ProjectDetailModal";
import {
  Trash2,
  Edit3,
  Calendar,
  FolderKanban,
  Plus,
  Search,
  Clock,
  Briefcase,
  Building2,
  MapPin,
  Layers,
  UserCheck,
  ChevronDown,
  X,
  RotateCcw,
  AlertCircle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Eye,
  Receipt,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Planning" },
  { value: "in progress", label: "In Progress" },
  { value: "hold", label: "Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const SITES_OPTIONS = ["site 1", "site 2", "site 3"];

const STATUS_MAP = {
  draft: {
    style: "bg-slate-800 text-slate-300 border-slate-700",
    label: "Draft",
  },
  planning: {
    style: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    label: "Planning",
  },
  "in progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  "in-progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  hold: {
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Hold",
  },
  completed: {
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Completed",
  },
  cancelled: {
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    label: "Cancelled",
  },
};

const IndexProject = () => {
  const {
    projectQuery,
    deleteProjectMutation,
    search,
    setSearch,
    status,
    setStatus,
    projectManager,
    setProjectManager,
    sites,
    setSites,
    divisionId,
    setDivisionId,
    page,
    setPage,
    limit,
    setLimit,
  } = useProject();

  const { divisionQuery } = useDivision();
  const divisions = divisionQuery.data || [];

  const [usersList, setUsersList] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForDetail, setProjectForDetail] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isPMDropdownOpen, setIsPMDropdownOpen] = useState(false);
  const [pmSearchQuery, setPmSearchQuery] = useState("");
  const pmDropdownRef = useRef(null);

  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [divisionSearchQuery, setDivisionSearchQuery] = useState("");
  const divisionDropdownRef = useRef(null);

  const [searchInput, setSearchInput] = useState(search);
  const [isSearchPending, setIsSearchPending] = useState(false);

  const formModalRef = useRef(null);
  const deleteModalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pmDropdownRef.current && !pmDropdownRef.current.contains(e.target)) {
        setIsPMDropdownOpen(false);
      }
      if (
        divisionDropdownRef.current &&
        !divisionDropdownRef.current.contains(e.target)
      ) {
        setIsDivisionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchInput !== search) {
      setIsSearchPending(true);
    }
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      setIsSearchPending(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setIsUsersLoading(true);
    getUsers({ limit: 200, canAccess: "planify" })
      .then((res) => {
        if (res?.data) {
          setUsersList(res.data);
        } else if (Array.isArray(res)) {
          setUsersList(res);
        }
      })
      .catch((err) => console.error("Gagal memuat daftar user:", err))
      .finally(() => setIsUsersLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (projectForDetail) {
        closeDetailModal();
      } else if (projectToDelete) {
        closeDeleteModal();
      } else if (isFormOpen) {
        requestCloseFormModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, projectToDelete, projectForDetail, isFormDirty]);

  const projectList = projectQuery.data?.data || [];
  const summary = projectQuery.data?.summary || {};
  const pagination = projectQuery.data?.pagination || {};
  const totalProjects = pagination.total ?? summary.total ?? projectList.length;
  const totalPages =
    pagination.totalPages || Math.ceil(totalProjects / limit) || 1;

  const aggregatedMetrics = useMemo(() => {
    const total = summary.total || 0;
    const active = (summary["in progress"] || 0) + (summary.planning || 0);
    const needsAttention = (summary.hold || 0) + (summary.draft || 0);

    return [
      {
        label: "Total Proyek",
        value: total,
        description: "Semua portofolio",
        icon: Briefcase,
        colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      },
      {
        label: "Proyek Aktif",
        value: active,
        description: "In Progress & Planning",
        icon: Clock,
        colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      },
      {
        label: "Perlu Perhatian",
        value: needsAttention,
        description: "Hold & Status Draft",
        icon: AlertCircle,
        colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
    ];
  }, [summary]);

  const openCreateModal = () => {
    setSelectedProject(null);
    setIsFormDirty(false);
    setIsFormOpen(true);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setIsFormDirty(false);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
    setIsFormDirty(false);
  };

  const requestCloseFormModal = () => {
    if (isFormDirty) {
      const confirmClose = window.confirm(
        "Perubahan yang belum disimpan akan hilang. Tutup form ini?",
      );
      if (!confirmClose) return;
    }
    closeFormModal();
  };

  const openDeleteModal = (project) => setProjectToDelete(project);
  const closeDeleteModal = () => setProjectToDelete(null);

  const openDetailModal = (project) => setProjectForDetail(project);
  const closeDetailModal = () => setProjectForDetail(null);

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    deleteProjectMutation.mutate(projectToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (statusKey) => {
    const normalized = statusKey?.toLowerCase();
    const target = STATUS_MAP[normalized];

    if (!target) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-800 text-slate-400 border-dashed border-slate-600">
          <AlertCircle className="w-3 h-3" />
          {statusKey ? `Unknown: ${statusKey}` : "Tanpa Status"}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${target.style}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {target.label}
      </span>
    );
  };

  const hasActiveFilters = Boolean(
    status || sites || projectManager || divisionId || searchInput,
  );

  const handleResetFilters = () => {
    setStatus("");
    setSites("");
    setProjectManager("");
    setDivisionId("");
    setSearchInput("");
    setSearch("");
    setPmSearchQuery("");
    setDivisionSearchQuery("");
    setPage(1);
  };

  const selectedPMName = useMemo(() => {
    const u = usersList.find((item) => item._id === projectManager);
    return u ? u.username || u.name || u.nama || u.email : "";
  }, [usersList, projectManager]);

  const selectedDivisionName = useMemo(() => {
    const d = divisions.find((item) => item._id === divisionId);
    return d ? d.nama || d.name : "";
  }, [divisions, divisionId]);

  const filteredUsersList = useMemo(() => {
    if (!pmSearchQuery.trim()) return usersList;
    const q = pmSearchQuery.toLowerCase();
    return usersList.filter((u) => {
      const name = (u.username || u.name || u.nama || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [usersList, pmSearchQuery]);

  const filteredDivisions = useMemo(() => {
    if (!divisionSearchQuery.trim()) return divisions;
    const q = divisionSearchQuery.toLowerCase();
    return divisions.filter((d) => {
      const name = (d.nama || d.name || "").toLowerCase();
      return name.includes(q);
    });
  }, [divisions, divisionSearchQuery]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Daftar Proyek
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau progres, alokasi tim, dan tenggat waktu seluruh proyek aktif.
          </p>
        </div>

        <button
          className="min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          <span>Buat Proyek Baru</span>
        </button>
      </header>

      {/* METRIC HIGHLIGHTS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {aggregatedMetrics.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-900/80 border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-sm"
            >
              <div className={`p-3 rounded-xl border ${card.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {card.description}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* SEARCH & FILTER CONTROLS */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama proyek atau PM..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full min-h-11 bg-slate-900 text-white placeholder:text-slate-500 text-sm pl-10 pr-10 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {/* Fix #1: indikator loading selama debounce/query berjalan */}
            {(isSearchPending || projectQuery.isFetching) &&
              !searchInput === false && (
                <Loader2 className="w-4 h-4 absolute right-9 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
              )}
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
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
              className={`min-h-11 px-4 py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 justify-center transition-colors cursor-pointer ${
                hasActiveFilters
                  ? "bg-blue-600/10 border-blue-500/40 text-blue-400"
                  : "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter Data</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="min-h-11 px-3 py-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs sm:text-sm font-medium flex items-center gap-1.5 justify-center transition-all cursor-pointer"
                title="Reset Semua Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ACTIVE FILTER CHIPS */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">
              Filter Aktif:
            </span>
            {status && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">
                Status:{" "}
                <strong className="text-white capitalize">{status}</strong>
                <button
                  onClick={() => {
                    setStatus("");
                    setPage(1);
                  }}
                  className="hover:text-rose-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sites && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">
                Site: <strong className="text-white uppercase">{sites}</strong>
                <button
                  onClick={() => {
                    setSites("");
                    setPage(1);
                  }}
                  className="hover:text-rose-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {projectManager && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">
                PM:{" "}
                <strong className="text-white">
                  {selectedPMName || "1 Terpilih"}
                </strong>
                <button
                  onClick={() => {
                    setProjectManager("");
                    setPage(1);
                  }}
                  className="hover:text-rose-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {divisionId && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-white/10 text-xs text-slate-200">
                Divisi:{" "}
                <strong className="text-white">
                  {selectedDivisionName || "1 Terpilih"}
                </strong>
                <button
                  onClick={() => {
                    setDivisionId("");
                    setPage(1);
                  }}
                  className="hover:text-rose-400 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* EXPANDABLE FILTER SHEET */}
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
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="w-full min-h-10 appearance-none bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Semua Status</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
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
                    onChange={(e) => {
                      setSites(e.target.value);
                      setPage(1);
                    }}
                    className="w-full min-h-10 appearance-none bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Semua Site</option>
                    {SITES_OPTIONS.map((site) => (
                      <option key={site} value={site} className="capitalize">
                        {site.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* PROJECT MANAGER SEARCHABLE DROPDOWN */}
              <div className="space-y-1" ref={pmDropdownRef}>
                <label className="text-xs text-slate-400 font-medium">
                  Project Manager
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPMDropdownOpen((prev) => !prev);
                      setIsDivisionDropdownOpen(false);
                    }}
                    disabled={isUsersLoading}
                    className="w-full min-h-10 text-left bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:border-blue-500 flex items-center justify-between transition-colors disabled:opacity-60"
                  >
                    <span className="truncate">
                      {isUsersLoading
                        ? "Memuat data..."
                        : selectedPMName || "Semua PM"}
                    </span>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {projectManager && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectManager("");
                            setPage(1);
                          }}
                          className="p-0.5 text-slate-400 hover:text-white"
                          title="Hapus pilihan"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isPMDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isPMDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2 border-b border-white/10 bg-slate-950/60">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari nama atau email PM..."
                            value={pmSearchQuery}
                            onChange={(e) => setPmSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full bg-slate-900 text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                          />
                          {pmSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPmSearchQuery("")}
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
                          onClick={() => {
                            setProjectManager("");
                            setIsPMDropdownOpen(false);
                            setPmSearchQuery("");
                            setPage(1);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                            !projectManager
                              ? "text-blue-400 font-semibold bg-blue-500/10"
                              : "text-slate-300"
                          }`}
                        >
                          <span>Semua PM</span>
                          {!projectManager && (
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </button>

                        {filteredUsersList.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">
                            PM tidak ditemukan
                          </div>
                        ) : (
                          filteredUsersList.map((u) => {
                            const isSelected = projectManager === u._id;
                            const displayName =
                              u.username || u.name || u.nama || u.email;
                            return (
                              <button
                                key={u._id}
                                type="button"
                                onClick={() => {
                                  setProjectManager(u._id);
                                  setIsPMDropdownOpen(false);
                                  setPmSearchQuery("");
                                  setPage(1);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                                  isSelected
                                    ? "text-blue-400 font-semibold bg-blue-500/10"
                                    : "text-slate-200"
                                }`}
                              >
                                <div className="truncate">
                                  <div className="truncate">{displayName}</div>
                                  {u.email && (
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {u.email}
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

              {/* DIVISI SEARCHABLE DROPDOWN */}
              <div className="space-y-1" ref={divisionDropdownRef}>
                <label className="text-xs text-slate-400 font-medium">
                  Divisi Terkait
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDivisionDropdownOpen((prev) => !prev);
                      setIsPMDropdownOpen(false);
                    }}
                    className="w-full min-h-10 text-left bg-slate-950 text-slate-200 text-xs pl-3 pr-8 rounded-lg border border-white/10 hover:border-white/20 focus:outline-none focus:border-blue-500 flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">
                      {selectedDivisionName || "Semua Divisi"}
                    </span>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {divisionId && (
                        <span
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDivisionId("");
                            setPage(1);
                          }}
                          className="p-0.5 text-slate-400 hover:text-white"
                          title="Hapus pilihan"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isDivisionDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isDivisionDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2 border-b border-white/10 bg-slate-950/60">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari nama divisi..."
                            value={divisionSearchQuery}
                            onChange={(e) =>
                              setDivisionSearchQuery(e.target.value)
                            }
                            autoFocus
                            className="w-full bg-slate-900 text-white text-xs pl-8 pr-7 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                          />
                          {divisionSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setDivisionSearchQuery("")}
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
                          onClick={() => {
                            setDivisionId("");
                            setIsDivisionDropdownOpen(false);
                            setDivisionSearchQuery("");
                            setPage(1);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                            !divisionId
                              ? "text-blue-400 font-semibold bg-blue-500/10"
                              : "text-slate-300"
                          }`}
                        >
                          <span>Semua Divisi</span>
                          {!divisionId && (
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </button>

                        {filteredDivisions.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">
                            Divisi tidak ditemukan
                          </div>
                        ) : (
                          filteredDivisions.map((div) => {
                            const isSelected = divisionId === div._id;
                            const displayName = div.nama || div.name;
                            return (
                              <button
                                key={div._id}
                                type="button"
                                onClick={() => {
                                  setDivisionId(div._id);
                                  setIsDivisionDropdownOpen(false);
                                  setDivisionSearchQuery("");
                                  setPage(1);
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                                  isSelected
                                    ? "text-blue-400 font-semibold bg-blue-500/10"
                                    : "text-slate-200"
                                }`}
                              >
                                <span className="truncate">{displayName}</span>
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
            </div>
          </div>
        )}
      </section>

      {/* DATA PRESENTATION AREA */}
      <main className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {projectQuery.isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-16 w-full bg-slate-800/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : projectQuery.isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="text-white font-medium text-base">
              Gagal memuat data proyek
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {projectQuery.error?.response?.data?.message ||
                projectQuery.error?.message ||
                "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda lalu coba lagi."}
            </p>
            <button
              onClick={() => projectQuery.refetch()}
              className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : projectList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-slate-200 font-medium text-base">
              {hasActiveFilters ? "Proyek tidak ditemukan" : "Belum ada proyek"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? "Coba hapus kata kunci pencarian atau reset filter."
                : "Buat proyek pertama untuk mulai memantau progres tim."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 font-medium transition-colors"
              >
                Reset Filter
              </button>
            ) : (
              <button
                onClick={openCreateModal}
                className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-blue-600 text-xs text-white hover:bg-blue-500 font-medium transition-colors"
              >
                + Buat Proyek
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE VIEW CARD LIST (< 768px) */}
            <div className="block md:hidden divide-y divide-white/5">
              {projectList.map((project) => {
                const clientParties =
                  project.parties?.filter((p) => p.role === "client") || [];

                const vendorParties =
                  project.parties?.filter((p) => p.role === "vendor") || [];

                return (
                  <div key={project._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">
                        {project.nama}
                      </h3>
                      <div>{getStatusBadge(project.status)}</div>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-300">
                      {project.projectManager && (
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>PM: {project.projectManager.username}</span>
                        </div>
                      )}

                      {(clientParties.length > 0 ||
                        vendorParties.length > 0) && (
                        <div className="flex items-start gap-2 text-slate-400">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />

                          <div className="space-y-1 min-w-0">
                            {clientParties.map((item) => (
                              <div key={item._id} className="truncate">
                                <span className="text-emerald-400">
                                  Client:
                                </span>{" "}
                                {item.party?.name || "-"}
                              </div>
                            ))}

                            {vendorParties.map((item) => (
                              <div key={item._id} className="truncate">
                                <span className="text-amber-400">Vendor:</span>{" "}
                                {item.party?.name || "-"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-0.5">
                        {project.sites?.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1">
                            {project.sites.map((site, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-[10px] text-slate-300 capitalize border border-white/5 font-medium"
                              >
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {site}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">-</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>
                          {formatDate(project.startedAt)} –{" "}
                          {formatDate(project.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => openDetailModal(project)}
                        className="min-h-11 px-3 py-1.5 rounded-lg bg-[#0E7490]/20 text-cyan-300 hover:bg-[#0E7490]/30 text-xs font-medium flex items-center gap-1.5"
                        title="Lihat Detail & BOQ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & BOQ</span>
                      </button>
                      <button
                        onClick={() => openEditModal(project)}
                        className="min-h-11 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(project)}
                        className="min-h-11 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW TABLE (≥ 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Nama Proyek</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Project Manager</th>
                    <th className="py-3.5 px-4">Klien & Vendor</th>
                    <th className="py-3.5 px-4">Scope</th>
                    <th className="py-3.5 px-4">Timeline</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projectList.map((project) => {
                    const clientParties =
                      project.parties?.filter((p) => p.role === "client") || [];

                    const vendorParties =
                      project.parties?.filter((p) => p.role === "vendor") || [];
                    return (
                      <tr
                        key={project._id}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        <td className="py-4 px-4 font-semibold text-white max-w-[200px] truncate">
                          <button
                            type="button"
                            onClick={() => openDetailModal(project)}
                            className="text-left group-hover:text-blue-400 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Klik untuk melihat Detail & BOQ"
                          >
                            <span className="truncate">{project.nama}</span>
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="py-4 px-4">
                          {project.projectManager ? (
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="font-medium truncate max-w-[120px]">
                                {project.projectManager.username}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 space-y-1 max-w-[180px]">
                          {clientParties.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-1.5 text-slate-300"
                            >
                              <Building2 className="w-3 h-3 shrink-0 text-emerald-400" />
                              <span className="truncate">
                                {item.party?.name || "-"}
                              </span>
                            </div>
                          ))}

                          {vendorParties.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-1.5 text-slate-300"
                            >
                              <Building2 className="w-3 h-3 shrink-0 text-amber-400" />
                              <span className="truncate">
                                {item.party?.name || "-"}
                              </span>
                            </div>
                          ))}

                          {clientParties.length === 0 &&
                            vendorParties.length === 0 && (
                              <span className="text-slate-500">-</span>
                            )}
                        </td>
                        <td className="py-4 px-4">
                          {project.sites?.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                              {project.sites.map((site, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[11px] text-slate-300 capitalize border border-white/5 font-medium transition-colors"
                                >
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {site}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>
                              {formatDate(project.startedAt)} –{" "}
                              {formatDate(project.dueDate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              title="Lihat Detail & BOQ"
                              className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#0E7490]/20 transition-colors cursor-pointer"
                              onClick={() => openDetailModal(project)}
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Edit Proyek"
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                              onClick={() => openEditModal(project)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              title="Hapus Proyek"
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              onClick={() => openDeleteModal(project)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>
                  Menampilkan{" "}
                  <span className="text-white font-medium">
                    {projectList.length}
                  </span>{" "}
                  dari{" "}
                  <span className="text-white font-medium">
                    {totalProjects}
                  </span>{" "}
                  total proyek.
                </span>

                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 pl-3 border-l border-white/10">
                  <span>Baris per hal:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-slate-900 text-slate-200 border border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="p-2 rounded-lg border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-slate-900 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-slate-200 font-medium px-2">
                    Hal {page} dari {totalPages}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="p-2 rounded-lg border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:text-slate-600 disabled:hover:bg-slate-900 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-modal-title"
          ref={formModalRef}
        >
          <div
            className="fixed inset-0"
            onClick={requestCloseFormModal}
            aria-hidden="true"
          />
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <h3 id="form-modal-title" className="font-bold text-lg">
                {selectedProject ? "Edit Proyek" : "Buat Proyek Baru"}
              </h3>
              <button
                onClick={requestCloseFormModal}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FormProject
              project={selectedProject}
              onClose={closeFormModal}
              onDirtyChange={setIsFormDirty}
            />
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          ref={deleteModalRef}
        >
          <div
            className="fixed inset-0"
            onClick={closeDeleteModal}
            aria-hidden="true"
          />
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3
                id="delete-modal-title"
                className="font-bold text-lg text-white"
              >
                Konfirmasi Hapus
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin
              menghapus proyek{" "}
              <strong className="text-white">"{projectToDelete?.nama}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                autoFocus
                className="min-h-11 px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-white/10"
                onClick={closeDeleteModal}
                disabled={deleteProjectMutation.isPending}
              >
                Batal
              </button>
              <button
                type="button"
                className="min-h-11 px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 cursor-pointer"
                onClick={handleConfirmDelete}
                disabled={deleteProjectMutation.isPending}
              >
                {deleteProjectMutation.isPending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  "Ya, Hapus Proyek"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT DETAIL & BOQ MODAL */}
      {projectForDetail && (
        <ProjectDetailModal
          project={projectForDetail}
          onClose={closeDetailModal}
          onEdit={() => {
            const p = projectForDetail;
            closeDetailModal();
            openEditModal(p);
          }}
        />
      )}
    </div>
  );
};

export default IndexProject;
