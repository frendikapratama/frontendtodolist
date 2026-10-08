import { useState, useMemo, useEffect, useRef } from "react";
import { useCost } from "../../../../hook/useCost";
import { useBudget } from "../../../../hook/useBudget";

export const useCostTab = (
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
) => {
  // Query parameters state
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedBudgetId, setSelectedBudgetId] = useState("all");
  const [selectedSourceId, setSelectedSourceId] = useState("all");
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
  const [formCostDate, setFormCostDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");

  // Fetch budgets of this project for linking
  const { budgetQuery } = useBudget(projectId, { limit: 200 });
  const allBudgets = useMemo(() => budgetQuery.data?.data || [], [budgetQuery.data?.data]);

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
    if (selectedSourceId !== "all") p.sourceId = selectedSourceId;
    return p;
  }, [
    page,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedStatus,
    selectedBudgetId,
    selectedSourceId,
  ]);

  const {
    costQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useCost(projectId, queryParams);

  const { data, isLoading, isError, isFetching, refetch } = costQuery || {};
  const costList = data?.data || [];
  const summary = data?.summary || {
    totalRealized: 0,
    totalApproved: 0,
    totalDraftOrSubmitted: 0,
    totalRejected: 0,
  };
  const pagination = data?.pagination || {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  };

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
    if (tabContext.sourceId) setSelectedSourceId(tabContext.sourceId);
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
  }, [tabContext, onClearTabContext]);

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
    if (e && e.preventDefault) e.preventDefault();
    if (!formBOQItemId || !formCostDate || !formDescription || !formAmount)
      return;

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
      },
    );
  };

  const handleEditSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
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
      },
    );
  };

  const handleUpdateStatus = (newStatus) => {
    if (!selectedCost) return;
    updateStatusMutation.mutate(
      { id: selectedCost._id, status: newStatus },
      {
        onSuccess: () => setIsStatusModalOpen(false),
      },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteCandidate) return;
    deleteMutation.mutate(deleteCandidate._id, {
      onSuccess: () => setDeleteCandidate(null),
    });
  };

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
    selectedStatus,
    setSelectedStatus,
    selectedBudgetId,
    setSelectedBudgetId,
    selectedSourceId,
    setSelectedSourceId,
    sortBy,
    sortOrder,
    handleSort,
    page,
    setPage,
    limit,
    setLimit,
    activeMenuId,
    setActiveMenuId,
    actionMenuRef,
    isDetailModalOpen,
    setIsDetailModalOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isStatusModalOpen,
    setIsStatusModalOpen,
    selectedCost,
    setSelectedCost,
    deleteCandidate,
    setDeleteCandidate,
    formBOQItemId,
    setFormBOQItemId,
    formCostDate,
    setFormCostDate,
    formDescription,
    setFormDescription,
    formAmount,
    setFormAmount,
    formNotes,
    setFormNotes,
    formStatus,
    setFormStatus,
    allBudgets,
    linkedBudgetForCreation,
    isOverBudget,
    overBudgetAmount,
    costList,
    summary,
    pagination,
    isLoading,
    isError,
    isFetching,
    refetch,
    handleOpenDetailModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenStatusModal,
    handleCreateSubmit,
    handleEditSubmit,
    handleUpdateStatus,
    handleDeleteConfirm,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
    onNavigateToTab,
  };
};
