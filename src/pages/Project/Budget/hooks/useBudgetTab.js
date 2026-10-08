import { useState, useMemo, useEffect, useRef } from "react";

import { useBudget } from "../../../../hook/useBudget";
import { useBOQ } from "../../../../hook/useBOQ";
import { getBudgetById } from "../../../../services/budget";

export const useBudgetTab = (
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
) => {
  // Search & Filter

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // Active Action Menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const actionMenuRef = useRef(null);

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isCostBreakdownOpen, setIsCostBreakdownOpen] = useState(false);

  // Selected Data
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Form State
  const [formBOQItemId, setFormBOQItemId] = useState("");
  const [formPlannedAmount, setFormPlannedAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("Draft");

  const [approvalAmount, setApprovalAmount] = useState("");
  const [approvalNote, setApprovalNote] = useState("");

  // BOQ Query
  const { boqQuery, sectionsQuery } = useBOQ(projectId, {
    limit: 200,
  });

  const allBOQItems = boqQuery.data?.items || [];
  const availableSections = sectionsQuery.data || [];

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close Action Menu When Clicking Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset Page When Filter Changes
  useEffect(() => {
    setPage(1);
  }, [selectedStatus, selectedSection, limit]);

  // Budget Query / Mutation
  const budgetOptions = useMemo(
    () => ({
      search: debouncedSearch,
      status: selectedStatus,
      section: selectedSection,
      sortBy,
      sortOrder,
      page,
      limit,
    }),
    [
      debouncedSearch,
      selectedStatus,
      selectedSection,
      sortBy,
      sortOrder,
      page,
      limit,
    ],
  );

  const {
    budgetQuery,
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  } = useBudget(projectId, budgetOptions);

  const { data, isLoading, isError, isFetching, refetch } = budgetQuery || {};
  const budgetList = data?.data || [];
  const summary = data?.summary || {
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

  // Sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setPage(1);
  };

  // Available BOQ For Creation
  const availableBOQForCreation = useMemo(() => {
    if (!allBOQItems.length) {
      return [];
    }

    const usedBOQIds = new Set(
      budgetList
        .map((budget) => {
          return budget.boqItemId || budget.boqItem?._id || budget.boqItem?.id;
        })
        .filter(Boolean),
    );

    return allBOQItems.filter((item) => {
      const id = item._id || item.id;

      return !usedBOQIds.has(id);
    });
  }, [allBOQItems, budgetList]);

  // Selected BOQ Item
  const selectedBOQItem = useMemo(() => {
    if (!formBOQItemId) {
      return null;
    }

    return (
      allBOQItems.find(
        (item) => item._id === formBOQItemId || item.id === formBOQItemId,
      ) || null
    );
  }, [allBOQItems, formBOQItemId]);

  // Reset Form
  const resetForm = () => {
    setFormBOQItemId("");
    setFormPlannedAmount("");
    setFormNotes("");
    setFormStatus("Draft");

    setApprovalAmount("");
    setApprovalNote("");
  };

  // Open Detail Modal
  const handleOpenDetailModal = async (budget) => {
    if (!budget) {
      return;
    }

    try {
      const budgetId = budget._id || budget.id;

      let detail = budget;

      if (budgetId) {
        try {
          const response = await getBudgetById(budgetId);

          detail = response?.data?.data || response?.data || response || budget;
        } catch (error) {
          console.error("Failed to get budget detail:", error);

          // Fallback menggunakan data dari list
          detail = budget;
        }
      }

      setSelectedBudget(detail);
      setIsDetailModalOpen(true);
      setActiveMenuId(null);
    } catch (error) {
      console.error("Failed to open budget detail:", error);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    resetForm();

    setSelectedBudget(null);
    setDeleteCandidate(null);

    setIsCreateModalOpen(true);
    setActiveMenuId(null);
  };

  // Open Edit Modal
  const handleOpenEditModal = (budget) => {
    if (!budget) {
      return;
    }

    setSelectedBudget(budget);

    setFormBOQItemId(
      budget.boqItemId || budget.boqItem?._id || budget.boqItem?.id || "",
    );

    setFormPlannedAmount(budget.plannedAmount ?? budget.planned_amount ?? "");

    setFormNotes(budget.notes || "");
    setFormStatus(budget.status || "Draft");

    setIsEditModalOpen(true);
    setActiveMenuId(null);
  };

  // Open Approve Modal
  const handleOpenApproveModal = (budget) => {
    if (!budget) {
      return;
    }

    setSelectedBudget(budget);

    setApprovalAmount(
      budget.approvedAmount ??
        budget.approved_amount ??
        budget.plannedAmount ??
        "",
    );

    setApprovalNote("");

    setIsApproveModalOpen(true);
    setActiveMenuId(null);
  };

  // Open Cost Breakdown
  const handleOpenCostBreakdown = (budget) => {
    if (!budget) {
      return;
    }

    setSelectedBudget(budget);
    setIsCostBreakdownOpen(true);
    setActiveMenuId(null);
  };

  // Add Cost From Budget
  const handleAddCostFromBudget = (budget) => {
    if (!budget) {
      return;
    }

    setActiveMenuId(null);
    setIsDetailModalOpen(false);
    setIsCostBreakdownOpen(false);

    if (onNavigateToTab) {
      onNavigateToTab("cost", {
        openCreate: true,
        boqItemId: budget.boqItem?._id,
        budgetId: budget._id || budget.id,
      });
    }
  };

  // Create Submit
  const handleCreateSubmit = async (eventOrData) => {
    try {
      const data = eventOrData?.preventDefault
        ? {
            boqItemId: formBOQItemId,
            plannedAmount: Number(formPlannedAmount) || 0,
            notes: formNotes,
            status: formStatus,
            projectId,
          }
        : eventOrData || {
            boqItemId: formBOQItemId,
            plannedAmount: Number(formPlannedAmount) || 0,
            notes: formNotes,
            status: formStatus,
            projectId,
          };

      if (eventOrData?.preventDefault) {
        eventOrData.preventDefault();
      }

      if (!data.boqItemId) {
        return;
      }

      if (createMutation?.mutateAsync) {
        await createMutation.mutateAsync(data);
      } else if (createMutation?.mutate) {
        createMutation.mutate(data);
      }

      setIsCreateModalOpen(false);
      resetForm();

      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  // Edit Submit
  const handleEditSubmit = async (eventOrData) => {
    try {
      if (!selectedBudget) {
        return;
      }

      const budgetId = selectedBudget._id || selectedBudget.id;

      const data = eventOrData?.preventDefault
        ? {
            boqItemId: formBOQItemId,
            plannedAmount: Number(formPlannedAmount) || 0,
            notes: formNotes,
            status: formStatus,
          }
        : eventOrData || {
            boqItemId: formBOQItemId,
            plannedAmount: Number(formPlannedAmount) || 0,
            notes: formNotes,
            status: formStatus,
          };

      if (eventOrData?.preventDefault) {
        eventOrData.preventDefault();
      }

      if (!budgetId) {
        return;
      }

      const payload = {
        id: budgetId,
        data,
        ...data,
      };

      if (updateMutation?.mutateAsync) {
        await updateMutation.mutateAsync(payload);
      } else if (updateMutation?.mutate) {
        updateMutation.mutate(payload);
      }

      setIsEditModalOpen(false);
      setSelectedBudget(null);
      resetForm();

      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
    }
  };

  // Approve Status

  const handleApproveStatus = async (status = "Approved") => {
    try {
      if (!selectedBudget) {
        return;
      }

      const budgetId = selectedBudget._id || selectedBudget.id;

      if (!budgetId) {
        return;
      }

      const statusData = {
        status,
        approvedAmount: Number(approvalAmount) || 0,
        approvalNote,
      };

      const payload = {
        id: budgetId,
        data: statusData,
        ...statusData,
      };

      if (updateStatusMutation?.mutateAsync) {
        await updateStatusMutation.mutateAsync(payload);
      } else if (updateStatusMutation?.mutate) {
        updateStatusMutation.mutate(payload);
      }

      setIsApproveModalOpen(false);
      setSelectedBudget(null);

      setApprovalAmount("");
      setApprovalNote("");

      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Failed to update budget status:", error);
    }
  };

  // Delete Confirm

  const handleDeleteConfirm = async (budget = deleteCandidate) => {
    try {
      if (!budget) {
        return;
      }

      const budgetId =
        typeof budget === "string" ? budget : budget._id || budget.id;

      if (!budgetId) {
        return;
      }

      const payload =
        typeof budget === "string"
          ? budget
          : {
              id: budgetId,
            };

      if (deleteMutation?.mutateAsync) {
        await deleteMutation.mutateAsync(payload);
      } else if (deleteMutation?.mutate) {
        deleteMutation.mutate(payload);
      }

      setDeleteCandidate(null);
      setActiveMenuId(null);

      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  // Cost Breakdown

  const breakdownCosts = useMemo(() => {
    if (!selectedBudget) {
      return [];
    }

    return (
      selectedBudget.costs ||
      selectedBudget.costBreakdown ||
      selectedBudget.breakdownCosts ||
      []
    );
  }, [selectedBudget]);

  const isBreakdownLoading = false;

  // Tab Context

  useEffect(() => {
    if (!tabContext) {
      return;
    }

    if (tabContext.budgetId) {
      const budget = budgetList.find(
        (item) =>
          item._id === tabContext.budgetId || item.id === tabContext.budgetId,
      );

      if (budget) {
        handleOpenDetailModal(budget);

        if (onClearTabContext) {
          onClearTabContext();
        }
      }
    }
  }, [tabContext, budgetList, onClearTabContext]);

  // Return

  return {
    // Search
    searchInput,
    setSearchInput,
    debouncedSearch,

    // Filter
    selectedStatus,
    setSelectedStatus,

    selectedSection,
    setSelectedSection,

    // Sort
    sortBy,
    sortOrder,
    handleSort,

    // Pagination
    page,
    setPage,
    limit,
    setLimit,

    // Action menu
    activeMenuId,
    setActiveMenuId,
    actionMenuRef,

    // Modals
    isDetailModalOpen,
    setIsDetailModalOpen,

    isCreateModalOpen,
    setIsCreateModalOpen,

    isEditModalOpen,
    setIsEditModalOpen,

    isApproveModalOpen,
    setIsApproveModalOpen,

    isCostBreakdownOpen,
    setIsCostBreakdownOpen,

    // Selected data
    selectedBudget,
    setSelectedBudget,

    deleteCandidate,
    setDeleteCandidate,

    // Form
    formBOQItemId,
    setFormBOQItemId,

    formPlannedAmount,
    setFormPlannedAmount,

    formNotes,
    setFormNotes,

    formStatus,
    setFormStatus,

    approvalAmount,
    setApprovalAmount,

    approvalNote,
    setApprovalNote,

    // BOQ
    allBOQItems,
    availableBOQForCreation,
    availableSections,
    selectedBOQItem,

    // Budget data
    budgetList,
    summary,
    pagination,

    // Query state
    isLoading,
    isError,
    isFetching,
    refetch,

    // Handlers
    handleOpenDetailModal,
    handleAddCostFromBudget,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenApproveModal,
    handleOpenCostBreakdown,

    handleCreateSubmit,
    handleEditSubmit,
    handleApproveStatus,
    handleDeleteConfirm,

    // Breakdown
    breakdownCosts,
    isBreakdownLoading,

    // Mutations
    createMutation,
    updateMutation,
    updateStatusMutation,
    deleteMutation,
  };
};
