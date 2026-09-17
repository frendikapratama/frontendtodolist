import React, { useState, useMemo, useEffect, useRef } from "react";
import { useCost } from "../../../hook/useCost";
import { useBudget } from "../../../hook/useBudget";
import { useBOQ } from "../../../hook/useBOQ";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Coins,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Receipt,
  Clock,
  Eye,
} from "lucide-react";

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    style: "bg-slate-800 text-slate-300 border-slate-700",
    dot: "bg-slate-400",
  },
  Submitted: {
    label: "Submitted",
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  Approved: {
    label: "Approved",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  Rejected: {
    label: "Rejected",
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
};

const CostTab = ({ projectId, project, tabContext, onClearTabContext, onNavigateToTab }) => {
  // Query parameters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBudgetId, setSelectedBudgetId] = useState("all");
  const [sortBy, setSortBy] = useState("costDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Active action menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Modals state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedCost, setSelectedCost] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form states
  const [formBOQItemId, setFormBOQItemId] = useState("");
  const [formCostDate, setFormCostDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");

  // Fetch budgets of this project for linking
  const { budgetQuery } = useBudget(projectId, { limit: 200 });
  const allBudgets = budgetQuery.data?.data || [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = useMemo(() => {
    const p = { page, limit, sortBy, sortOrder };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (selectedStatus !== "all") p.status = selectedStatus;
    if (selectedBudgetId !== "all") p.budgetId = selectedBudgetId;
    return p;
  }, [page, limit, sortBy, sortOrder, debouncedSearch, selectedStatus, selectedBudgetId]);

  const {
    costQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useCost(projectId, queryParams);

  const { data, isLoading, isError, isFetching, refetch } = costQuery;
  const costList = data?.data || [];
  const summary = data?.summary || {
    totalRealized: 0,
    totalApproved: 0,
    totalDraftOrSubmitted: 0,
    totalRejected: 0,
  };
  const pagination = data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 };

  // Determine linked Budget when user selects a BOQ Item in Create Modal
  const linkedBudgetForCreation = useMemo(() => {
    if (!formBOQItemId) return null;
    return allBudgets.find((b) => b.boqItem?._id === formBOQItemId) || null;
  }, [allBudgets, formBOQItemId]);

  // Warning when amount exceeds remaining budget (PRD Section 8)
  const isOverBudget = useMemo(() => {
    if (!linkedBudgetForCreation) return false;
    const num = Number(formAmount) || 0;
    return num > linkedBudgetForCreation.remainingBudget;
  }, [linkedBudgetForCreation, formAmount]);

  const overBudgetAmount = useMemo(() => {
    if (!isOverBudget || !linkedBudgetForCreation) return 0;
    return (Number(formAmount) || 0) - linkedBudgetForCreation.remainingBudget;
  }, [isOverBudget, linkedBudgetForCreation, formAmount]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Contextual Trigger listener from BOQ / Budget tabs
  useEffect(() => {
    if (!tabContext) return;
    if (tabContext.openCreate) {
      if (tabContext.boqItemId) {
        setFormBOQItemId(tabContext.boqItemId);
      }
      setFormCostDate(new Date().toISOString().slice(0, 10));
      setFormDescription("");
      setFormAmount("");
      setFormNotes("");
      setFormStatus("Draft");
      setIsCreateModalOpen(true);
    }
    if (onClearTabContext) {
      onClearTabContext();
    }
  }, [tabContext]);

  const handleOpenCreateModal = () => {
    // Default to first budget's boq item
    const firstBudgetItem = allBudgets[0]?.boqItem?._id || "";
    setFormBOQItemId(firstBudgetItem);
    setFormCostDate(new Date().toISOString().slice(0, 10));
    setFormDescription("");
    setFormAmount("");
    setFormNotes("");
    setFormStatus("Draft");
    setIsCreateModalOpen(true);
  };

  const handleOpenDetailModal = (cost) => {
    setSelectedCost(cost);
    setActiveMenuId(null);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditModal = (cost) => {
    setSelectedCost(cost);
    setFormCostDate(cost.costDate ? cost.costDate.slice(0, 10) : "");
    setFormDescription(cost.description || "");
    setFormAmount(cost.amount || "");
    setFormNotes(cost.notes || "");
    setActiveMenuId(null);
    setIsEditModalOpen(true);
  };

  const handleOpenStatusModal = (cost) => {
    setSelectedCost(cost);
    setActiveMenuId(null);
    setIsStatusModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formBOQItemId || !formCostDate || !formDescription || !formAmount) return;

    createMutation.mutate(
      {
        boqItemId: formBOQItemId,
        costDate: formCostDate,
        description: formDescription,
        amount: Number(formAmount),
        notes: formNotes,
        status: formStatus,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
      }
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedCost) return;

    updateMutation.mutate(
      {
        id: selectedCost._id,
        data: {
          costDate: formCostDate,
          description: formDescription,
          amount: Number(formAmount),
          notes: formNotes,
        },
      },
      {
        onSuccess: () => setIsEditModalOpen(false),
      }
    );
  };

  const handleUpdateStatus = (newStatus) => {
    if (!selectedCost) return;
    updateStatusMutation.mutate(
      { id: selectedCost._id, status: newStatus },
      {
        onSuccess: () => setIsStatusModalOpen(false),
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    deleteMutation.mutate(deleteCandidate._id, {
      onSuccess: () => setDeleteCandidate(null),
    });
  };

  return (
    <div className="space-y-6">
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
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition disabled:opacity-50 cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-cyan-400" : ""}`} />
          </button>
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

      {/* COST TABLE */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 rounded-2xl border border-white/5">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs mt-3 font-medium">Memuat data Cost...</p>
        </div>
      ) : isError ? (
        <div className="p-10 bg-slate-900/60 rounded-2xl border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-rose-400 font-bold text-sm">Gagal memuat data Cost</h4>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-white/10"
          >
            Coba Lagi
          </button>
        </div>
      ) : costList.length === 0 ? (
        <div className="p-16 bg-slate-900/60 rounded-2xl border-2 border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
            <Receipt className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">
            {debouncedSearch || selectedStatus !== "all"
              ? "Cost Tidak Ditemukan"
              : "Belum Ada Realisasi Biaya (Cost)"}
          </h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            {debouncedSearch || selectedStatus !== "all"
              ? "Tidak ada data cost yang sesuai kriteria pencarian Anda."
              : "Catat pengeluaran biaya nyata yang terjadi terhadap alokasi Budget yang telah disetujui."}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Cost Pertama</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10 select-none">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort("costCode")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Cost Code</span>
                      {sortBy === "costCode" && (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 cursor-pointer hover:text-white"
                    onClick={() => handleSort("costDate")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Tanggal</span>
                      {sortBy === "costDate" && (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 min-w-[180px]">BOQ Item</th>
                  <th className="py-3 px-3">Budget Code</th>
                  <th className="py-3 px-4 min-w-[200px]">Deskripsi Biaya</th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Amount</span>
                      {sortBy === "amount" && (
                        sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {costList.map((item, idx) => {
                  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.Draft;
                  const isMenuOpen = activeMenuId === item._id;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">
                        {item.costCode}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                        {formatDate(item.costDate)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white line-clamp-1">
                        {item.boqItem?.description || "-"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-purple-300">
                        {item.budget?.budgetCode || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-200">
                        {item.description}
                        {item.notes && (
                          <span className="block text-[11px] text-slate-500 truncate">
                            {item.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusConf.style}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center relative" ref={isMenuOpen ? actionMenuRef : null}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : item._id)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-3 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 divide-y divide-white/5 text-left animate-in fade-in zoom-in-95 duration-100">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetailModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View Detail</span>
                                </button>
                                {item.budget && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      if (onNavigateToTab) {
                                        onNavigateToTab("budget", {
                                          focusBudgetId: item.budget._id,
                                        });
                                      }
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-500/10 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Coins className="w-3.5 h-3.5 text-purple-400" />
                                    <span>View Budget ({item.budget.budgetCode})</span>
                                  </button>
                                )}
                              </div>
                              <div className="py-1">
                                {item.status !== "Approved" && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Edit Cost</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenStatusModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Approval Status</span>
                                </button>
                              </div>
                              {item.status !== "Approved" && (
                                <div className="py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setDeleteCandidate(item);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Cost</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
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
                Menampilkan <span className="text-white font-medium">{costList.length}</span> dari{" "}
                <span className="text-white font-medium">{pagination.total}</span> item.
              </span>
              <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
                <span>Baris:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-slate-950 text-slate-200 border border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-200">
                Hal {page} dari {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COST MODAL (Sesuai PRD Section 7) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsCreateModalOpen(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Catat Realisasi Biaya (Cost)</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Select BOQ Item */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Pilih BOQ Item <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formBOQItemId}
                  onChange={(e) => setFormBOQItemId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="" disabled>
                    -- Pilih item pekerjaan yang telah memiliki Budget --
                  </option>
                  {allBudgets.map((b) => (
                    <option key={b.boqItem?._id} value={b.boqItem?._id}>
                      [{b.budgetCode}] {b.boqItem?.description} (Sisa Budget: {formatCurrency(b.remainingBudget)})
                    </option>
                  ))}
                </select>
                {allBudgets.length === 0 && (
                  <p className="text-[11px] text-rose-400">
                    Belum ada Budget yang dibuat untuk proyek ini. Harap buat Budget terlebih dahulu di tab Budget.
                  </p>
                )}
              </div>

              {/* Linked Budget Overview Box (Sesuai PRD Section 7: User tidak perlu mengetik Budget Code manual) */}
              {linkedBudgetForCreation && (
                <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">BOQ Value:</span>
                    <span className="text-slate-200 font-mono">{formatCurrency(linkedBudgetForCreation.boqValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Budget Code Terkait:</span>
                    <span className="text-purple-300 font-mono font-semibold">{linkedBudgetForCreation.budgetCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Approval Budget:</span>
                    <span className="text-emerald-400 font-mono">{formatCurrency(linkedBudgetForCreation.approvedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Cost (Berjalan):</span>
                    <span className="text-amber-400 font-mono">{formatCurrency(linkedBudgetForCreation.actualCost)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5 font-bold">
                    <span className="text-cyan-400">Remaining Budget:</span>
                    <span className={`font-mono ${linkedBudgetForCreation.remainingBudget < 0 ? "text-rose-400" : "text-cyan-300"}`}>
                      {formatCurrency(linkedBudgetForCreation.remainingBudget)}
                    </span>
                  </div>
                </div>
              )}

              {/* Tanggal & Nilai Biaya */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">
                    Tanggal Cost <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formCostDate}
                    onChange={(e) => setFormCostDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">
                    Nilai Biaya (Amount) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Misal: 120000000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Over Budget Warning (PRD Section 8) */}
              {isOverBudget && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Peringatan Over-Budget:</span>
                    <p className="text-[11px] mt-0.5 text-amber-200/90">
                      Nilai Cost melebihi sisa Remaining Budget sebesar {formatCurrency(overBudgetAmount)}.
                    </p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Deskripsi Biaya <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pengadaan beton tahap 1"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan rincian cost..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Action */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Status Awal</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="costStatus"
                      value="Draft"
                      checked={formStatus === "Draft"}
                      onChange={(e) => setFormStatus(e.target.value)}
                    />
                    <span>Save Draft</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="costStatus"
                      value="Submitted"
                      checked={formStatus === "Submitted"}
                      onChange={(e) => setFormStatus(e.target.value)}
                    />
                    <span>Submit Approval</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formBOQItemId}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Simpan Cost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL COST */}
      {isDetailModalOpen && selectedCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsDetailModalOpen(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Detail Cost ({selectedCost.costCode})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rincian realisasi pengeluaran proyek
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Deskripsi:</span>
                <span className="text-white font-semibold text-right max-w-[280px]">
                  {selectedCost.description}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tanggal Transaksi:</span>
                <span className="text-slate-200">{formatDate(selectedCost.costDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nominal Biaya:</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">
                  {formatCurrency(selectedCost.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status Persetujuan:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    STATUS_CONFIG[selectedCost.status]?.style || STATUS_CONFIG.Draft.style
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      STATUS_CONFIG[selectedCost.status]?.dot || STATUS_CONFIG.Draft.dot
                    }`}
                  />
                  {selectedCost.status}
                </span>
              </div>

              {/* Linked BOQ & Budget Info */}
              <div className="pt-2 border-t border-white/5 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">BOQ Item Terkait:</span>
                  <span className="text-slate-300 font-medium text-right truncate max-w-[220px]">
                    {selectedCost.boqItem?.description || "-"}
                  </span>
                </div>
                {selectedCost.budget && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Budget Code:</span>
                    <span className="text-purple-300 font-mono font-semibold">
                      {selectedCost.budget.budgetCode}
                    </span>
                  </div>
                )}
              </div>

              {selectedCost.notes && (
                <div className="pt-1.5 border-t border-white/5 text-slate-400 text-[11px] italic">
                  Catatan: {selectedCost.notes}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {selectedCost.budget && onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      onNavigateToTab("budget", { focusBudgetId: selectedCost.budget._id });
                    }}
                    className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>View Budget</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenStatusModal(selectedCost);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Ubah Status
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COST MODAL */}
      {isEditModalOpen && selectedCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Edit Cost ({selectedCost.costCode})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Tanggal Cost</label>
                  <input
                    type="date"
                    required
                    value={formCostDate}
                    onChange={(e) => setFormCostDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">Amount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Deskripsi Biaya</label>
                <input
                  type="text"
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">Catatan</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Menyimpan..." : "Update Cost"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL STATUS WORKFLOW MODAL */}
      {isStatusModalOpen && selectedCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setIsStatusModalOpen(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Approval Cost ({selectedCost.costCode})</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <p className="font-medium text-white">{selectedCost.description}</p>
              <p className="text-cyan-400 font-mono font-bold">{formatCurrency(selectedCost.amount)}</p>
              <p className="text-[11px] text-slate-500">Status Saat Ini: {selectedCost.status}</p>
            </div>

            <p className="text-xs text-slate-400">
              Ubah status persetujuan cost. Cost dengan status <strong>Approved</strong> akan dihitung sebagai <em>Actual Cost</em> pada alokasi budget terkait.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus("Approved")}
                disabled={updateStatusMutation.isPending}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Approve Cost
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("Rejected")}
                disabled={updateStatusMutation.isPending}
                className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition"
              >
                Reject Cost
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus("Submitted")}
                disabled={updateStatusMutation.isPending}
                className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl transition"
              >
                Set to Submitted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setDeleteCandidate(null)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Hapus Cost</h3>
            </div>
            <p className="text-xs text-slate-300">
              Yakin ingin menghapus entri cost <strong className="text-white">{deleteCandidate.costCode}</strong> ({formatCurrency(deleteCandidate.amount)})?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-xl text-white"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostTab;
