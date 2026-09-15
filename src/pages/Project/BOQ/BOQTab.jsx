import React, { useState, useMemo, useEffect, useRef } from "react";
import { useBOQ } from "../../../hook/useBOQ";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  FileText,
  DollarSign,
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
} from "lucide-react";

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatNumber = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID").format(num);
};

const STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
    icon: Clock,
  },
  Submitted: {
    label: "Submitted",
    bg: "bg-amber-50 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  Approved: {
    label: "Approved",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-rose-50 text-rose-700 border-rose-300",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

const BOQTab = ({ projectId, project }) => {
  // Query parameters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Section collapse state
  const [collapsedSections, setCollapsedSections] = useState({});

  // Action Menu Dropdown state (Item ID for active menu)
  const [activeMenuId, setActiveMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    itemCode: "",
    sectionMode: "select", // "select" or "create"
    sectionSelect: "",
    sectionCustom: "",
    description: "",
    unit: "",
    quantity: "",
    unitPrice: "",
    notes: "",
    status: "Draft",
  });
  const [formErrors, setFormErrors] = useState({});

  // Section searchable dropdown state in Modal
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const [sectionFilterText, setSectionFilterText] = useState("");
  const sectionDropdownRef = useRef(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close active dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
      if (
        sectionDropdownRef.current &&
        !sectionDropdownRef.current.contains(e.target)
      ) {
        setIsSectionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const queryParams = useMemo(() => {
    const p = { page, limit, sortBy, sortOrder };
    if (debouncedSearch.trim()) p.search = debouncedSearch.trim();
    if (selectedSection !== "all") p.section = selectedSection;
    if (selectedStatus !== "all") p.status = selectedStatus;
    return p;
  }, [page, limit, sortBy, sortOrder, debouncedSearch, selectedSection, selectedStatus]);

  const {
    boqQuery,
    sectionsQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useBOQ(projectId, queryParams);

  const { data, isLoading, isError, isFetching, refetch } = boqQuery;
  const availableSections = sectionsQuery.data || data?.allSections || [];

  // Real-time calculated total in modal
  const modalCalculatedTotal = useMemo(() => {
    const q = Number(formData.quantity) || 0;
    const p = Number(formData.unitPrice) || 0;
    return q * p;
  }, [formData.quantity, formData.unitPrice]);

  const toggleSection = (sectionName) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleOpenAddModal = (defaultSection = "") => {
    const hasExisting = availableSections.length > 0;
    setEditingItem(null);
    setFormData({
      itemCode: "",
      sectionMode: hasExisting ? "select" : "create",
      sectionSelect: defaultSection || (hasExisting ? availableSections[0] : ""),
      sectionCustom: defaultSection && !hasExisting ? defaultSection : "",
      description: "",
      unit: "",
      quantity: "",
      unitPrice: "",
      notes: "",
      status: "Draft",
    });
    setFormErrors({});
    setSectionFilterText("");
    setIsSectionDropdownOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode || "",
      sectionMode: "select",
      sectionSelect: item.section || "",
      sectionCustom: "",
      description: item.description || "",
      unit: item.unit || "",
      quantity: String(item.quantity ?? ""),
      unitPrice: String(item.unitPrice ?? ""),
      notes: item.notes || "",
      status: item.status || "Draft",
    });
    setFormErrors({});
    setSectionFilterText("");
    setIsSectionDropdownOpen(false);
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    let finalSection = "";

    if (formData.sectionMode === "create") {
      finalSection = formData.sectionCustom.trim();
      if (!finalSection) {
        errors.section = "Nama Section/Category baru wajib diisi";
      }
    } else {
      finalSection = formData.sectionSelect.trim();
      if (!finalSection) {
        errors.section = "Pilih salah satu Section yang tersedia";
      }
    }

    if (!formData.description.trim()) {
      errors.description = "Deskripsi pekerjaan wajib diisi";
    }

    if (!formData.unit.trim()) {
      errors.unit = "Satuan (unit) wajib diisi";
    }

    const qty = Number(formData.quantity);
    if (formData.quantity === "" || isNaN(qty) || qty < 0) {
      errors.quantity = "Quantity harus berupa angka dan tidak boleh negatif";
    }

    const price = Number(formData.unitPrice);
    if (formData.unitPrice === "" || isNaN(price) || price < 0) {
      errors.unitPrice = "Unit Price harus berupa angka dan tidak boleh negatif";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalSection =
      formData.sectionMode === "create"
        ? formData.sectionCustom.trim()
        : formData.sectionSelect.trim();

    const payload = {
      itemCode: formData.itemCode.trim(),
      section: finalSection,
      description: formData.description.trim(),
      unit: formData.unit.trim(),
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      notes: formData.notes.trim(),
      status: formData.status,
    };

    if (editingItem) {
      updateMutation.mutate(
        { itemId: editingItem._id, data: payload },
        {
          onSuccess: () => setIsModalOpen(false),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    deleteMutation.mutate(deleteCandidate._id, {
      onSuccess: () => setDeleteCandidate(null),
    });
  };

  const handleStatusChange = (itemId, newStatus) => {
    setActiveMenuId(null);
    updateStatusMutation.mutate({ itemId, status: newStatus });
  };

  const filteredModalSections = useMemo(() => {
    if (!sectionFilterText.trim()) return availableSections;
    return availableSections.filter((s) =>
      s.toLowerCase().includes(sectionFilterText.toLowerCase())
    );
  }, [availableSections, sectionFilterText]);

  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    totalOverall: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Grand Total BOQ
            </p>
            <h3 className="text-xl font-bold text-slate-800 mt-1 font-mono">
              {formatCurrency(data?.grandTotal || 0)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {pagination.totalOverall || 0} total item pekerjaan
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0E7490] flex items-center justify-center border border-cyan-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Section
            </p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {availableSections.length} Kategori
            </h3>
            <p className="text-xs text-slate-400 mt-1">Pengelompokan pekerjaan</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </p>
            <h3 className="text-xl font-bold text-emerald-600 mt-1">
              {data?.statusCounts?.Approved || 0} Item
            </h3>
            <p className="text-xs text-slate-400 mt-1">Telah disetujui</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Draft & Submitted
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold text-slate-700">
                {data?.statusCounts?.Draft || 0} Draft
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-lg font-bold text-amber-600">
                {data?.statusCounts?.Submitted || 0} Sub
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Menunggu review</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Limit, Add Button */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Debounced Search */}
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode, deskripsi, catatan..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent transition"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            >
              <option value="all">Semua Section ({availableSections.length})</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            >
              <option value="all">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 text-slate-400 hover:text-[#0E7490] hover:bg-slate-50 rounded-xl border border-slate-200 transition disabled:opacity-50"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-[#0E7490]" : ""}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Item BOQ</span>
          </button>
        </div>
      </div>

      {/* BOQ Table Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-[#0E7490] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs mt-3 font-medium">
            Memuat data Bill of Quantity...
          </p>
        </div>
      ) : isError ? (
        <div className="p-10 bg-white rounded-2xl border border-rose-200 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-rose-600 font-bold text-sm">Gagal memuat data BOQ</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Terjadi kendala saat mengambil data BOQ dari server.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Coba Lagi
          </button>
        </div>
      ) : !data?.items || data.items.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-[#0E7490] flex items-center justify-center mx-auto mb-4 border border-cyan-100">
            <FileText className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {debouncedSearch || selectedSection !== "all" || selectedStatus !== "all"
              ? "Item BOQ Tidak Ditemukan"
              : "Belum Ada Item BOQ"}
          </h4>
          <p className="text-slate-500 text-xs max-w-md mx-auto mt-1 mb-5">
            {debouncedSearch || selectedSection !== "all" || selectedStatus !== "all"
              ? "Tidak ada item BOQ yang cocok dengan kriteria pencarian atau filter Anda."
              : "Buat rincian pekerjaan pertama Anda. Ketik nama section secara manual atau pilih section yang sudah ada."}
          </p>
          {debouncedSearch || selectedSection !== "all" || selectedStatus !== "all" ? (
            <button
              onClick={() => {
                setSearchInput("");
                setSelectedSection("all");
                setSelectedStatus("all");
                setPage(1);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5"
            >
              Reset Filter
            </button>
          ) : (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Buat Section & Item Baru
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grouped by Section */}
          {data.sections.map((sec, secIdx) => {
            const isCollapsed = !!collapsedSections[sec.name];

            return (
              <div
                key={sec.name}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                {/* Section Header */}
                <div
                  onClick={() => toggleSection(sec.name)}
                  className="px-5 py-3.5 bg-slate-50/90 hover:bg-slate-100/80 border-b border-slate-200 flex items-center justify-between cursor-pointer transition select-none sticky top-0 z-10"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0E7490]/10 text-[#0E7490] uppercase tracking-wider">
                          Section
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">
                          {sec.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sec.itemCount} item pada halaman ini
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-slate-400">
                        Subtotal Section
                      </p>
                      <p className="text-sm font-bold text-slate-800 font-mono">
                        {formatCurrency(sec.subtotal)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddModal(sec.name);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-[#0E7490] text-xs font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs"
                      title="Tambah item pada section ini"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Item</span>
                    </button>
                  </div>
                </div>

                {/* Section Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-10 text-center">No</th>
                          <th
                            className="py-2.5 px-3 w-28 cursor-pointer hover:text-slate-600 transition"
                            onClick={() => handleSort("itemCode")}
                          >
                            <div className="flex items-center gap-1">
                              <span>Item Code</span>
                              {sortBy === "itemCode" ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-[#0E7490]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#0E7490]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            className="py-2.5 px-4 min-w-[240px] cursor-pointer hover:text-slate-600 transition"
                            onClick={() => handleSort("description")}
                          >
                            <div className="flex items-center gap-1">
                              <span>Deskripsi</span>
                              {sortBy === "description" ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-[#0E7490]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#0E7490]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th className="py-2.5 px-3 w-16 text-center">Unit</th>
                          <th
                            className="py-2.5 px-3 w-24 text-right cursor-pointer hover:text-slate-600 transition"
                            onClick={() => handleSort("quantity")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <span>Qty</span>
                              {sortBy === "quantity" ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-[#0E7490]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#0E7490]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            className="py-2.5 px-3 w-32 text-right cursor-pointer hover:text-slate-600 transition"
                            onClick={() => handleSort("unitPrice")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <span>Harga Satuan</span>
                              {sortBy === "unitPrice" ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-[#0E7490]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#0E7490]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th
                            className="py-2.5 px-3 w-36 text-right cursor-pointer hover:text-slate-600 transition"
                            onClick={() => handleSort("totalPrice")}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <span>Total Harga</span>
                              {sortBy === "totalPrice" ? (
                                sortOrder === "asc" ? (
                                  <ArrowUp className="w-3 h-3 text-[#0E7490]" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-[#0E7490]" />
                                )
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40" />
                              )}
                            </div>
                          </th>
                          <th className="py-2.5 px-3 w-28 text-center">Status</th>
                          <th className="py-2.5 px-3 min-w-[120px]">Catatan</th>
                          <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {sec.items.map((item, itemIdx) => {
                          const statusInfo =
                            STATUS_CONFIG[item.status] || STATUS_CONFIG.Draft;
                          const isMenuOpen = activeMenuId === item._id;

                          return (
                            <tr
                              key={item._id}
                              className="hover:bg-slate-50/70 transition-colors group"
                            >
                              <td className="py-3 px-3 text-center text-slate-400 font-mono">
                                {(pagination.page - 1) * pagination.limit + itemIdx + 1}
                              </td>
                              <td className="py-3 px-3 font-mono font-medium text-slate-600">
                                {item.itemCode || <span className="text-slate-300">-</span>}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-800">
                                  {item.description}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center text-slate-600 uppercase font-semibold">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                                  {item.unit}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-medium text-slate-700">
                                {formatNumber(item.quantity)}
                              </td>
                              <td className="py-3 px-3 text-right text-slate-600 font-mono">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-slate-800 font-mono">
                                {formatCurrency(item.totalPrice)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                  <span>{statusInfo.label}</span>
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 max-w-[160px] truncate">
                                {item.notes || <span className="text-slate-300">-</span>}
                              </td>
                              <td className="py-3 px-3 text-center relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuId((prev) =>
                                      prev === item._id ? null : item._id
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                  title="Menu Aksi"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {/* Action Dropdown Menu */}
                                {isMenuOpen && (
                                  <div
                                    ref={actionMenuRef}
                                    className="absolute right-2 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleOpenEditModal(item);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Edit Item</span>
                                    </button>

                                    <div className="my-1 border-t border-slate-100 px-3 py-1">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Ubah Status:
                                      </span>
                                    </div>

                                    {["Draft", "Submitted", "Approved", "Rejected"].map(
                                      (st) => (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => handleStatusChange(item._id, st)}
                                          className={`w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                                            item.status === st
                                              ? "font-bold text-[#0E7490]"
                                              : "text-slate-600"
                                          }`}
                                        >
                                          <span>{st}</span>
                                          {item.status === st && (
                                            <Check className="w-3 h-3 text-[#0E7490]" />
                                          )}
                                        </button>
                                      )
                                    )}

                                    <div className="my-1 border-t border-slate-100" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDeleteCandidate(item);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                      <span>Hapus Item</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Section Subtotal Row */}
                        <tr className="bg-slate-50/70 font-semibold border-t border-slate-200">
                          <td
                            colSpan={6}
                            className="py-2.5 px-4 text-right text-[11px] text-slate-500 uppercase tracking-wider"
                          >
                            Subtotal {sec.name}:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-800">
                            {formatCurrency(sec.subtotal)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {/* Grand Total Footer Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Akumulasi Anggaran BOQ
              </span>
              <h3 className="text-lg font-bold mt-0.5">Grand Total Bill of Quantity</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Total kumulatif keseluruhan proyek ({pagination.totalOverall} item terdata)
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-cyan-300 font-medium">
                Total Estimasi Biaya
              </span>
              <div className="text-2xl md:text-3xl font-extrabold text-white mt-0.5 font-mono">
                {formatCurrency(data.grandTotal)}
              </div>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Menampilkan{" "}
                <strong className="text-slate-800">
                  {pagination.total > 0
                    ? (pagination.page - 1) * pagination.limit + 1
                    : 0}
                  –
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </strong>{" "}
                dari <strong className="text-slate-800">{pagination.total}</strong>{" "}
                item
                {pagination.total !== pagination.totalOverall && (
                  <span className="text-slate-400 ml-1">
                    (difilter dari total {pagination.totalOverall})
                  </span>
                )}
              </span>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span>Baris per hal:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
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
                disabled={pagination.page <= 1 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold px-2">
                Halaman {pagination.page} dari {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  pagination.page >= pagination.totalPages || isFetching
                }
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, pagination.totalPages))
                }
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT BOQ ITEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center font-bold text-xs">
                  BOQ
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {editingItem ? "Edit Item BOQ" : "Tambah Item BOQ"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem
                      ? "Perbarui detail pekerjaan dan harga"
                      : "Buat rincian pekerjaan dan harga satuan baru"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {/* Section Requirement: Input manual saat awal, atau Searchable Dropdown saat sudah ada */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Section / Kategori <span className="text-rose-500">*</span>
                  </label>
                  {availableSections.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            sectionMode:
                              prev.sectionMode === "select" ? "create" : "select",
                          }));
                          setFormErrors((prev) => ({ ...prev, section: null }));
                        }}
                        className="text-[#0E7490] hover:underline font-semibold"
                      >
                        {formData.sectionMode === "select"
                          ? "+ Buat Section Baru"
                          : "← Pilih Section Tersedia"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Case 1: Tidak ada section sama sekali ATAU user memilih membuat section baru */}
                {availableSections.length === 0 ||
                formData.sectionMode === "create" ? (
                  <div>
                    <input
                      type="text"
                      placeholder="Ketik nama Section baru (mis. Pekerjaan Struktur)..."
                      value={formData.sectionCustom}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sectionCustom: e.target.value,
                        })
                      }
                      autoFocus
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Section ini akan otomatis tersimpan dan dapat digunakan kembali untuk item BOQ lainnya.
                    </p>
                  </div>
                ) : (
                  /* Case 2: Section sudah ada -> Searchable Select Dropdown */
                  <div className="relative" ref={sectionDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSectionDropdownOpen((prev) => !prev)}
                      className="w-full min-h-10 text-left bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl text-slate-800 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                    >
                      <span className="truncate font-medium">
                        {formData.sectionSelect || "Pilih Section / Kategori..."}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isSectionDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isSectionDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari section..."
                              value={sectionFilterText}
                              onChange={(e) =>
                                setSectionFilterText(e.target.value)
                              }
                              autoFocus
                              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0E7490]"
                            />
                          </div>
                        </div>

                        <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 py-1">
                          {filteredModalSections.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              Section tidak ditemukan
                            </div>
                          ) : (
                            filteredModalSections.map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    sectionSelect: sec,
                                  }));
                                  setIsSectionDropdownOpen(false);
                                  setSectionFilterText("");
                                }}
                                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                                  formData.sectionSelect === sec
                                    ? "bg-cyan-50 font-bold text-[#0E7490]"
                                    : "text-slate-700"
                                }`}
                              >
                                <span>{sec}</span>
                                {formData.sectionSelect === sec && (
                                  <Check className="w-3.5 h-3.5 text-[#0E7490]" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {formErrors.section && (
                  <p className="text-xs text-rose-500 mt-1">
                    {formErrors.section}
                  </p>
                )}
              </div>

              {/* Item Code & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Item Code
                  </label>
                  <input
                    type="text"
                    placeholder="mis. STR-001"
                    value={formData.itemCode}
                    onChange={(e) =>
                      setFormData({ ...formData, itemCode: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Pekerjaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Rincian spesifikasi atau item pekerjaan..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
                {formErrors.description && (
                  <p className="text-xs text-rose-500 mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Unit, Quantity, Unit Price */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Satuan (Unit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="m2, unit, ls, kg"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                  {formErrors.unit && (
                    <p className="text-xs text-rose-500 mt-1">
                      {formErrors.unit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                  {formErrors.quantity && (
                    <p className="text-xs text-rose-500 mt-1">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Harga Satuan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: e.target.value })
                    }
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                  />
                  {formErrors.unitPrice && (
                    <p className="text-xs text-rose-500 mt-1">
                      {formErrors.unitPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Real-time Calculated Total Price (Read-only) */}
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Total Harga (Otomatis)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Quantity × Harga Satuan
                  </p>
                </div>
                <div className="text-sm font-bold text-[#0E7490] font-mono">
                  {formatCurrency(modalCalculatedTotal)}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Keterangan spesifikasi material / catatan teknis..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? "Simpan Perubahan" : "Tambah Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800 text-center">
              Hapus Item BOQ?
            </h4>
            <p className="text-xs text-slate-500 text-center mt-1 mb-6 leading-relaxed">
              Item <strong className="text-slate-700">"{deleteCandidate.description}"</strong>{" "}
              akan dihapus secara permanen. Subtotal dan Grand Total akan dihitung ulang secara otomatis.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm disabled:opacity-50"
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

export default BOQTab;
