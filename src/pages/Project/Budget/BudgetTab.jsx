import React, { useState, useMemo, useEffect, useRef } from "react";
import { useBudget } from "../../../hook/useBudget";
import { useBOQ } from "../../../hook/useBOQ";
import { getBudgetById } from "../../../services/budget";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Check,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Wallet,
  Coins,
  ShieldCheck,
  TrendingDown,
  ListTree,
} from "lucide-react";

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
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

const BudgetTab = ({
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
}) => {
  // Query parameters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
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
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form states
  const [formBOQItemId, setFormBOQItemId] = useState("");
  const [formPlannedAmount, setFormPlannedAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");
  const [approvalAmount, setApprovalAmount] = useState("");
  const [approvalNote, setApprovalNote] = useState("");

  // BOQ Query for dropdown selection
  const { boqQuery, sectionsQuery } = useBOQ(projectId, { limit: 200 });
  const allBOQItems = boqQuery.data?.items || [];
  const availableSections = sectionsQuery.data || [];

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
    if (selectedSection !== "all") p.section = selectedSection;
    return p;
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedStatus,
    selectedSection,
  ]);

  const {
    budgetQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useBudget(projectId, queryParams);

  const { data, isLoading, isError, isFetching, refetch } = budgetQuery;
  const budgetList = data?.data || [];
  const summary = data?.summary || {
    totalBOQValue: 0,
    totalPlannedBudget: 0,
    totalApprovalBudget: 0,
    totalActualCost: 0,
    totalRemainingBudget: 0,
  };
  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  };

  // Currently selected BOQ item in Create Modal
  const selectedBOQItem = useMemo(() => {
    return allBOQItems.find((b) => b._id === formBOQItemId) || null;
  }, [allBOQItems, formBOQItemId]);

  // Available BOQ items that don't already have a budget
  const existingBudgetBOQItemIds = useMemo(() => {
    return budgetList.map((b) => b.boqItem?._id).filter(Boolean);
  }, [budgetList]);

  const availableBOQForCreation = useMemo(() => {
    return allBOQItems.filter(
      (item) => !existingBudgetBOQItemIds.includes(item._id),
    );
  }, [allBOQItems, existingBudgetBOQItemIds]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Respond to incoming tabContext (e.g. from BOQ or detail)
  useEffect(() => {
    if (!tabContext) return;
    if (tabContext.openCreate) {
      if (tabContext.boqItemId) {
        setFormBOQItemId(tabContext.boqItemId);
        if (tabContext.plannedAmount) {
          setFormPlannedAmount(tabContext.plannedAmount);
        }
      }
      setIsCreateModalOpen(true);
    }
    if (tabContext.focusBudgetId && budgetList.length > 0) {
      const b = budgetList.find((x) => x._id === tabContext.focusBudgetId);
      if (b) {
        handleOpenDetailModal(b);
      }
    }
    if (onClearTabContext) {
      onClearTabContext();
    }
  }, [tabContext, budgetList]);

  const handleOpenDetailModal = async (budget) => {
    setSelectedBudget(budget);
    setActiveMenuId(null);
    setIsDetailModalOpen(true);
    setIsBreakdownLoading(true);
    try {
      const detail = await getBudgetById(budget._id);
      setBreakdownCosts(detail?.costs || []);
    } catch (err) {
      setBreakdownCosts([]);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleAddCostFromBudget = (budget) => {
    setActiveMenuId(null);
    setIsDetailModalOpen(false);
    setIsCostBreakdownOpen(false);
    if (onNavigateToTab) {
      onNavigateToTab("cost", {
        openCreate: true,
        boqItemId: budget.boqItem?._id,
        budgetId: budget._id,
      });
    }
  };

  const handleOpenCreateModal = () => {
    setFormBOQItemId(availableBOQForCreation[0]?._id || "");
    setFormPlannedAmount("");
    setFormNotes("");
    setFormStatus("Draft");
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setSelectedBudget(budget);
    setFormPlannedAmount(budget.plannedAmount || "");
    setFormNotes(budget.notes || "");
    setActiveMenuId(null);
    setIsEditModalOpen(true);
  };

  const handleOpenApproveModal = (budget) => {
    setSelectedBudget(budget);
    setApprovalAmount(budget.approvedAmount || budget.plannedAmount || "");
    setApprovalNote(budget.approvalNote || "");
    setActiveMenuId(null);
    setIsApproveModalOpen(true);
  };

  const [breakdownCosts, setBreakdownCosts] = useState([]);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);

  const handleOpenCostBreakdown = async (budget) => {
    setSelectedBudget(budget);
    setActiveMenuId(null);
    setIsCostBreakdownOpen(true);
    setIsBreakdownLoading(true);
    try {
      const detail = await getBudgetById(budget._id);
      setBreakdownCosts(detail?.costs || []);
    } catch (err) {
      setBreakdownCosts([]);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formBOQItemId) return;
    createMutation.mutate(
      {
        boqItemId: formBOQItemId,
        plannedAmount: Number(formPlannedAmount) || 0,
        notes: formNotes,
        status: formStatus,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
      },
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    updateMutation.mutate(
      {
        id: selectedBudget._id,
        data: {
          plannedAmount: Number(formPlannedAmount) || 0,
          notes: formNotes,
        },
      },
      {
        onSuccess: () => setIsEditModalOpen(false),
      },
    );
  };

  const handleApproveStatus = (statusDecision) => {
    if (!selectedBudget) return;
    updateStatusMutation.mutate(
      {
        id: selectedBudget._id,
        data: {
          status: statusDecision,
          approvedAmount: Number(approvalAmount) || 0,
          approvalNote,
        },
      },
      {
        onSuccess: () => setIsApproveModalOpen(false),
      },
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
          <p className="text-[11px] text-slate-500">
            Realisasi (Approved Cost)
          </p>
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
              summary.totalRemainingBudget < 0
                ? "text-rose-400"
                : "text-blue-300"
            }`}
          >
            {formatCurrency(summary.totalRemainingBudget)}
          </h4>
          <p className="text-[11px] text-slate-500">Approval - Actual</p>
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
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition disabled:opacity-50 cursor-pointer"
            title="Muat Ulang"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-400" : ""}`}
            />
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Budget</span>
        </button>
      </div>

      {/* BUDGET TABLE CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 rounded-2xl border border-white/5">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs mt-3 font-medium">
            Memuat data Budget...
          </p>
        </div>
      ) : isError ? (
        <div className="p-10 bg-slate-900/60 rounded-2xl border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-rose-400 font-bold text-sm">
            Gagal memuat data Budget
          </h4>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-white/10"
          >
            Coba Lagi
          </button>
        </div>
      ) : budgetList.length === 0 ? (
        <div className="p-16 bg-slate-900/60 rounded-2xl border-2 border-dashed border-white/10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
            <Coins className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">
            {debouncedSearch || selectedStatus !== "all"
              ? "Budget Tidak Ditemukan"
              : "Belum Ada Data Budget"}
          </h4>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            {debouncedSearch || selectedStatus !== "all"
              ? "Tidak ada item budget yang sesuai kriteria pencarian."
              : "Buat alokasi budget untuk item pekerjaan BOQ Anda untuk mulai mengontrol realisasi cost."}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Budget Pertama</span>
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
                    onClick={() => handleSort("budgetCode")}
                  >
                    <div className="flex items-center gap-1">
                      <span>Budget Code</span>
                      {sortBy === "budgetCode" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 min-w-[200px] cursor-pointer hover:text-white"
                    onClick={() => handleSort("boqItem")}
                  >
                    <div className="flex items-center gap-1">
                      <span>BOQ Item</span>
                      {sortBy === "boqItem" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("boqValue")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>BOQ Value</span>
                      {sortBy === "boqValue" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("plannedAmount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Planned Budget</span>
                      {sortBy === "plannedAmount" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        ))}
                    </div>
                  </th>
                  <th
                    className="py-3 px-3 text-right cursor-pointer hover:text-white"
                    onClick={() => handleSort("approvedAmount")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Approval Budget</span>
                      {sortBy === "approvedAmount" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-400" />
                        ))}
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Actual Cost</th>
                  <th className="py-3 px-3 text-right">Remaining</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {budgetList.map((item, idx) => {
                  const statusConf =
                    STATUS_CONFIG[item.status] || STATUS_CONFIG.Draft;
                  const isMenuOpen = activeMenuId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">
                        {item.budgetCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white line-clamp-1">
                          {item.boqItem?.description || "-"}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {item.boqItem?.section && (
                            <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-[10px]">
                              {item.boqItem.section}
                            </span>
                          )}
                          {item.boqItem?.itemCode && (
                            <span className="font-mono text-slate-500">
                              {item.boqItem.itemCode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                        {formatCurrency(item.boqValue)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-purple-300">
                        {formatCurrency(item.plannedAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(item.approvedAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-amber-400">
                        <button
                          onClick={() => handleOpenCostBreakdown(item)}
                          className="hover:underline flex items-center justify-end gap-1 ml-auto text-amber-300 font-semibold cursor-pointer"
                          title="Klik untuk melihat daftar Cost"
                        >
                          <span>{formatCurrency(item.actualCost)}</span>
                          <ListTree className="w-3 h-3 text-amber-400/70" />
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span
                          className={
                            item.remainingBudget < 0
                              ? "text-rose-400"
                              : "text-blue-300"
                          }
                        >
                          {formatCurrency(item.remainingBudget)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusConf.style}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                          />
                          {statusConf.label}
                        </span>
                      </td>
                      <td
                        className="py-3.5 px-3 text-center relative"
                        ref={isMenuOpen ? actionMenuRef : null}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : item._id)
                            }
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                            title="Menu Aksi"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action dropdown menu */}
                          {isMenuOpen && (
                            <div className="absolute right-3 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-100 text-left">
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetailModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View Detail</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddCostFromBudget(item)}
                                  className="w-full px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Add Cost</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCostBreakdown(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <ListTree className="w-3.5 h-3.5 text-purple-400" />
                                  <span>View Costs</span>
                                </button>
                              </div>
                              <div className="py-1">
                                {item.status !== "Approved" && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(item)}
                                    className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>Edit Planned Budget</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Approval Workflow</span>
                                </button>
                              </div>
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
                                  <span>Hapus Budget</span>
                                </button>
                              </div>
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
                Menampilkan{" "}
                <span className="text-white font-medium">
                  {budgetList.length}
                </span>{" "}
                dari{" "}
                <span className="text-white font-medium">
                  {pagination.total}
                </span>{" "}
                item.
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
                onClick={() =>
                  setPage((p) => Math.min(p + 1, pagination.totalPages))
                }
                className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE BUDGET */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">
                Tambah Alokasi Budget
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
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
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>
                    -- Pilih item pekerjaan BOQ --
                  </option>
                  {availableBOQForCreation.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.itemCode ? `[${b.itemCode}] ` : ""}
                      {b.description} ({formatCurrency(b.totalPrice)})
                    </option>
                  ))}
                </select>
                {availableBOQForCreation.length === 0 && (
                  <p className="text-[11px] text-amber-400">
                    Semua BOQ Item saat ini sudah memiliki alokasi Budget.
                  </p>
                )}
              </div>

              {/* Readonly BOQ Value Info Box (Sesuai PRD: Jangan diinput manual) */}
              {selectedBOQItem && (
                <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Section:</span>
                    <span className="text-slate-200">
                      {selectedBOQItem.section}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Satuan & Volume:</span>
                    <span className="text-slate-200">
                      {selectedBOQItem.quantity} {selectedBOQItem.unit} @{" "}
                      {formatCurrency(selectedBOQItem.unitPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5 font-semibold">
                    <span className="text-cyan-400">
                      BOQ Value (Dasar Nilai):
                    </span>
                    <span className="text-cyan-300 font-mono text-sm">
                      {formatCurrency(selectedBOQItem.totalPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* Planned Budget Input */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Planned Budget (IDR) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="Misal: 510000000"
                  value={formPlannedAmount}
                  onChange={(e) => setFormPlannedAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-500">
                  Perkiraan batas anggaran yang diajukan untuk item pekerjaan
                  ini.
                </p>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Keterangan pengajuan budget..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Action */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Status Awal
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formStatus === "Draft"}
                      onChange={(e) => setFormStatus(e.target.value)}
                    />
                    <span>Save Draft</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Submitted"
                      checked={formStatus === "Submitted"}
                      onChange={(e) => setFormStatus(e.target.value)}
                    />
                    <span>Submit untuk Approval</span>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
                >
                  {createMutation.isPending ? "Menyimpan..." : "Simpan Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT BUDGET */}
      {isEditModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">
                Edit Budget ({selectedBudget.budgetCode})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-xs space-y-1">
                <p className="font-semibold text-white">
                  {selectedBudget.boqItem?.description}
                </p>
                <p className="text-slate-400">
                  BOQ Value: {formatCurrency(selectedBudget.boqValue)}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Planned Budget (IDR)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formPlannedAmount}
                  onChange={(e) => setFormPlannedAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Catatan
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Menyimpan..." : "Update Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BUDGET DETAIL (Sesuai PRD CTA 2 & CTA 3) */}
      {isDetailModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setIsDetailModalOpen(false)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative z-10 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header with Title and Primary CTA [+ Add Cost] */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">
                      Detail Budget {selectedBudget.budgetCode}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        STATUS_CONFIG[selectedBudget.status]?.style ||
                        STATUS_CONFIG.Draft.style
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATUS_CONFIG[selectedBudget.status]?.dot ||
                          STATUS_CONFIG.Draft.dot
                        }`}
                      />
                      {selectedBudget.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Rincian alokasi anggaran dan riwayat realisasi biaya.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* PRIMARY CTA: [+ Add Cost] */}
                <button
                  type="button"
                  onClick={() => handleAddCostFromBudget(selectedBudget)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Cost</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Overview Info Cards */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-white/5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/5">
                <div>
                  <span className="text-slate-500 text-[11px] block">
                    BOQ Item:
                  </span>
                  <span className="text-white font-semibold text-sm">
                    {selectedBudget.boqItem?.description || "-"}
                  </span>
                  {selectedBudget.boqItem?.section && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Section: {selectedBudget.boqItem.section}
                    </span>
                  )}
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-500 text-[11px] block">
                    BOQ Value (Dasar Kontrak):
                  </span>
                  <span className="text-cyan-400 font-mono font-bold text-sm">
                    {formatCurrency(selectedBudget.boqValue)}
                  </span>
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-white/2 border border-white/5">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">
                    Planned Budget
                  </span>
                  <p className="font-mono font-semibold text-purple-300 text-xs mt-0.5">
                    {formatCurrency(selectedBudget.plannedAmount)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">
                    Approval Budget
                  </span>
                  <p className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                    {formatCurrency(selectedBudget.approvedAmount)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">
                    Actual Cost
                  </span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    {formatCurrency(selectedBudget.actualCost)}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <span className="text-slate-500 text-[10px] uppercase font-semibold">
                    Remaining Budget
                  </span>
                  <p
                    className={`font-mono font-bold text-xs mt-0.5 ${
                      selectedBudget.remainingBudget < 0
                        ? "text-rose-400"
                        : "text-blue-300"
                    }`}
                  >
                    {formatCurrency(selectedBudget.remainingBudget)}
                  </p>
                </div>
              </div>

              {selectedBudget.notes && (
                <div className="pt-2 text-slate-400 text-[11px] italic">
                  Catatan: {selectedBudget.notes}
                </div>
              )}
            </div>

            {/* Section Cost / Actual Usage Breakdown */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[140px] max-h-56">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ListTree className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cost / Actual Usage ({breakdownCosts.length})</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleAddCostFromBudget(selectedBudget)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Cost Baru</span>
                </button>
              </div>

              {isBreakdownLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Memuat data riwayat Cost...
                </div>
              ) : breakdownCosts.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-xs text-slate-400">
                    Belum ada pengeluaran/cost tercatat untuk budget ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddCostFromBudget(selectedBudget)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Entri Cost Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-slate-950/60">
                  {breakdownCosts.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-white/2 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-semibold">
                            {c.costCode}
                          </span>
                          <span className="text-white font-medium">
                            {c.description}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {c.costDate
                            ? new Date(c.costDate).toLocaleDateString("id-ID")
                            : "-"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white block">
                          {formatCurrency(c.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            c.status === "Approved"
                              ? "text-emerald-400"
                              : c.status === "Rejected"
                                ? "text-rose-400"
                                : "text-amber-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenCostBreakdown(selectedBudget);
                  }}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  View Costs List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenApproveModal(selectedBudget);
                  }}
                  className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Approval
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

      {/* MODAL 3: APPROVAL WORKFLOW (Sesuai PRD section 3) */}
      {isApproveModalOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsApproveModalOpen(false)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">
                Approval Budget ({selectedBudget.budgetCode})
              </h3>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">BOQ Item:</span>
                  <span className="text-white font-medium">
                    {selectedBudget.boqItem?.description}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">BOQ Value:</span>
                  <span className="text-cyan-400 font-mono font-medium">
                    {formatCurrency(selectedBudget.boqValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Planned Budget:</span>
                  <span className="text-purple-300 font-mono font-medium">
                    {formatCurrency(selectedBudget.plannedAmount)}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Approval Budget (Nilai Disetujui)
                </label>
                <input
                  type="number"
                  min="0"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Approval Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan persetujuan / alasan revisi..."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleApproveStatus("Rejected")}
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveStatus("Approved")}
                  disabled={updateStatusMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white shadow-md shadow-emerald-600/20"
                >
                  Approve Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: BREAKDOWN COST PER BUDGET (Sesuai PRD Section 10) */}
      {isCostBreakdownOpen && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setIsCostBreakdownOpen(false)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative z-10 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-white text-base">
                  Realisasi Cost untuk {selectedBudget.budgetCode}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  BOQ Item: {selectedBudget.boqItem?.description}
                </p>
              </div>
              <button
                onClick={() => setIsCostBreakdownOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick summary header */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-white/5 text-xs">
              <div>
                <span className="text-slate-500 text-[11px]">
                  Approval Budget
                </span>
                <p className="font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(selectedBudget.approvedAmount)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">
                  Actual Cost (Approved)
                </span>
                <p className="font-bold font-mono text-amber-400 mt-0.5">
                  {formatCurrency(selectedBudget.actualCost)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[11px]">Sisa Budget</span>
                <p
                  className={`font-bold font-mono mt-0.5 ${selectedBudget.remainingBudget < 0 ? "text-rose-400" : "text-blue-300"}`}
                >
                  {formatCurrency(selectedBudget.remainingBudget)}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Daftar Entri Biaya Terkait ({breakdownCosts.length}):
              </p>
              {isBreakdownLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Memuat data Cost...
                </div>
              ) : breakdownCosts.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 text-center">
                  Belum ada entri Cost yang dicatat untuk Budget ini. Catat
                  pengeluaran di tab <strong>"Cost"</strong>.
                </div>
              ) : (
                <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-slate-950/50">
                  {breakdownCosts.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 flex items-center justify-between text-xs hover:bg-white/2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-cyan-400 font-semibold">
                            {c.costCode}
                          </span>
                          <span className="text-white font-medium">
                            {c.description}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {c.costDate
                            ? new Date(c.costDate).toLocaleDateString("id-ID")
                            : "-"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-white block">
                          {formatCurrency(c.amount)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            c.status === "Approved"
                              ? "text-emerald-400"
                              : c.status === "Rejected"
                                ? "text-rose-400"
                                : "text-amber-400"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleAddCostFromBudget(selectedBudget)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Cost</span>
              </button>
              <button
                onClick={() => setIsCostBreakdownOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DELETE CONFIRMATION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setDeleteCandidate(null)}
          />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Hapus Budget</h3>
            </div>
            <p className="text-xs text-slate-300">
              Yakin ingin menghapus budget{" "}
              <strong className="text-white">
                {deleteCandidate.budgetCode}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
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

export default BudgetTab;
