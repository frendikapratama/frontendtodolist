import { useState, useMemo, useEffect, useRef } from "react";
import { useBOQ } from "../../../../hook/useBOQ";
import { useBudget } from "../../../../hook/useBudget";

export const useBOQTab = (projectId) => {
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
  const [detailItem, setDetailItem] = useState(null);
  const [createBudgetItem, setCreateBudgetItem] = useState(null);
  const [viewBudgetItem, setViewBudgetItem] = useState(null);

  // Quick budget creation form state
  const [budgetPlannedAmount, setBudgetPlannedAmount] = useState("");
  const [budgetNotes, setBudgetNotes] = useState("");
  const [budgetStatus, setBudgetStatus] = useState("Draft");

  // Form State for Add/Edit BOQ Item
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
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedSection,
    selectedStatus,
  ]);

  const {
    boqQuery,
    sectionsQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useBOQ(projectId, queryParams);

  // Budget query to know which BOQ items have a budget
  const { budgetQuery, createMutation: createBudgetMutation } = useBudget(
    projectId,
    { limit: 200 },
  );
  const allBudgets = budgetQuery.data?.data || [];

  const budgetByBOQItemIdMap = useMemo(() => {
    const map = {};
    allBudgets.forEach((b) => {
      if (b.boqItem?._id) {
        map[b.boqItem._id] = b;
      }
    });
    return map;
  }, [allBudgets]);

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
      sectionSelect:
        defaultSection || (hasExisting ? availableSections[0] : ""),
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
      errors.unitPrice =
        "Unit Price harus berupa angka dan tidak boleh negatif";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    validateForm();

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
        },
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

  const handleOpenCreateBudget = (item) => {
    setCreateBudgetItem(item);
    setBudgetPlannedAmount(item.totalPrice || "");
    setBudgetNotes("");
    setBudgetStatus("Draft");
  };

  const handleCreateBudgetSubmit = (e) => {
    e.preventDefault();
    if (!createBudgetItem) return;

    createBudgetMutation.mutate(
      {
        boqItemId: createBudgetItem._id,
        plannedAmount: Number(budgetPlannedAmount) || 0,
        notes: budgetNotes,
        status: budgetStatus,
      },
      {
        onSuccess: () => {
          setCreateBudgetItem(null);
        },
      },
    );
  };

  const filteredModalSections = useMemo(() => {
    if (!sectionFilterText.trim()) return availableSections;
    return availableSections.filter((s) =>
      s.toLowerCase().includes(sectionFilterText.toLowerCase()),
    );
  }, [availableSections, sectionFilterText]);

  const hasActiveFilters = Boolean(
    debouncedSearch.trim() ||
    selectedSection !== "all" ||
    selectedStatus !== "all",
  );

  const resetFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setSelectedSection("all");
    setSelectedStatus("all");
    setPage(1);
  };

  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    totalOverall: 0,
  };

  return {
    // Queries & data
    boqQuery,
    sectionsQuery,
    budgetQuery,
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
    availableSections,
    budgetByBOQItemIdMap,
    pagination,

    // Mutations
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
    createBudgetMutation,

    // Filters & pagination
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedSection,
    setSelectedSection,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    sortOrder,
    page,
    setPage,
    limit,
    setLimit,
    hasActiveFilters,
    resetFilters,
    handleSort,

    // Sections collapse
    collapsedSections,
    toggleSection,

    // Action menu
    activeMenuId,
    setActiveMenuId,
    actionMenuRef,
    handleStatusChange,

    // Modals
    isModalOpen,
    setIsModalOpen,
    editingItem,
    handleOpenAddModal,
    handleOpenEditModal,
    deleteCandidate,
    setDeleteCandidate,
    handleDeleteConfirm,
    detailItem,
    setDetailItem,
    createBudgetItem,
    setCreateBudgetItem,
    handleOpenCreateBudget,
    viewBudgetItem,
    setViewBudgetItem,

    // BOQ Item Form
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    isSectionDropdownOpen,
    setIsSectionDropdownOpen,
    sectionFilterText,
    setSectionFilterText,
    sectionDropdownRef,
    filteredModalSections,
    modalCalculatedTotal,
    handleSubmitForm,

    // Quick Budget Form
    budgetPlannedAmount,
    setBudgetPlannedAmount,
    budgetNotes,
    setBudgetNotes,
    budgetStatus,
    setBudgetStatus,
    handleCreateBudgetSubmit,
  };
};
