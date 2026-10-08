import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../../api/axios";
import { getBOQByProject } from "../../../../services/boq";
import {
  getBiddingsByProject,
  getBiddingById,
  createBidding as apiCreateBidding,
  deleteBidding as apiDeleteBidding,
  updateBiddingItems as apiUpdateBiddingItems,
  updateBiddingSuppliers as apiUpdateBiddingSuppliers,
  updateBiddingQuotations as apiUpdateBiddingQuotations,
  updateBiddingSelections as apiUpdateBiddingSelections,
  finishBidding as apiFinishBidding,
} from "../../../../services/bidding";
import {
  calculateBiddingTotal,
  checkBiddingFinishReady,
} from "../biddingUtils";

export const useBiddingTab = (
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
) => {
  const [biddings, setBiddings] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Bidding Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail / Edit Mode local state for active bidding
  const [activeBidding, setActiveBidding] = useState(null);
  const [savingQuotes, setSavingQuotes] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // BOQ Item selection modal in Detail view
  const [showItemPickerModal, setShowItemPickerModal] = useState(false);
  const [selectedBoqIds, setSelectedBoqIds] = useState([]);
  const [boqSearch, setBoqSearch] = useState("");
  const [boqSection, setBoqSection] = useState("");
  const [updatingItems, setUpdatingItems] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const [partyMaster, setPartyMaster] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);

  // Quote detail modal (leadTime, paymentTerm, notes)
  const [quoteDetailModal, setQuoteDetailModal] = useState(null);

  // Finish confirmation modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // Delete confirmation modal
  const [biddingToDelete, setBiddingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Result mode: show comparison matrix toggle
  const [showAuditMatrix, setShowAuditMatrix] = useState(false);

  // Distinct sections of BOQ items
  const boqSections = useMemo(
    () =>
      [...new Set(boqItems.map((item) => item.section).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b),
      ),
    [boqItems],
  );

  // Debounced search for Party Master
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        setLoadingParties(true);
        try {
          const res = await api.get("/party", {
            params: { search: partySearch.trim(), page: 1, limit: 100 },
          });
          if (!cancelled) setPartyMaster(res.data?.data || []);
        } catch (err) {
          console.error("Gagal memuat Party Master:", err);
          if (!cancelled) setPartyMaster([]);
        } finally {
          if (!cancelled) setLoadingParties(false);
        }
      },
      partySearch ? 250 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [partySearch]);

  // Load biddings list
  const loadBiddings = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getBiddingsByProject(projectId);
      setBiddings(res?.data || []);
    } catch (err) {
      console.error("Gagal memuat daftar bidding:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load BOQ items for project
  const loadBOQItems = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await getBOQByProject(projectId);
      const items = res?.data?.items || res?.items || res?.data || [];
      setBoqItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Gagal memuat item BOQ:", err);
    }
  }, [projectId]);

  useEffect(() => {
    loadBiddings();
    loadBOQItems();
  }, [loadBiddings, loadBOQItems]);

  // Deep load active bidding details
  const loadActiveBidding = useCallback(async (id) => {
    if (!id) {
      setActiveBidding(null);
      return;
    }
    try {
      const res = await getBiddingById(id);
      const data = res?.data;
      setActiveBidding(data);
      setSelectedBoqIds(
        (data?.items || []).map((i) => String(i.boqItem?._id || i.boqItem)),
      );
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Gagal memuat detail bidding:", err);
    }
  }, []);

  useEffect(() => {
    if (activeId) {
      loadActiveBidding(activeId);
    } else {
      setActiveBidding(null);
    }
  }, [activeId, loadActiveBidding]);

  // Handle deep-link / tabContext
  useEffect(() => {
    if (tabContext?.biddingId) {
      setActiveId(tabContext.biddingId);
      onClearTabContext?.();
    } else if (tabContext?.boqItemId) {
      setShowCreateModal(true);
      onClearTabContext?.();
    }
  }, [tabContext, onClearTabContext]);

  // Handle Create Bidding
  const handleCreateBidding = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!createTitle.trim()) return;
    setCreating(true);
    try {
      const res = await apiCreateBidding({
        projectId,
        title: createTitle.trim(),
        description: createDesc.trim(),
      });
      const newBid = res?.data;
      setShowCreateModal(false);
      setCreateTitle("");
      setCreateDesc("");
      await loadBiddings();
      if (newBid?._id) {
        setActiveId(newBid._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat bidding");
    } finally {
      setCreating(false);
    }
  };

  // Handle Delete Bidding
  const handleDeleteBidding = async () => {
    if (!biddingToDelete?._id) return;
    setDeleting(true);
    try {
      await apiDeleteBidding(biddingToDelete._id);
      setBiddingToDelete(null);
      if (activeId === biddingToDelete._id) {
        setActiveId("");
      }
      await loadBiddings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus bidding");
    } finally {
      setDeleting(false);
    }
  };

  // Handle Toggle Supplier Peserta
  const handleToggleSupplier = async (supplierId) => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    const current = (activeBidding.suppliers || []).map((s) =>
      String(s._id || s),
    );
    const exists = current.includes(String(supplierId));
    let nextSuppliers;
    if (exists) {
      // Check if supplier already has quotation
      const hasQuote = activeBidding.items?.some((item) =>
        item.quotations?.some(
          (q) => String(q.supplier?._id || q.supplier) === String(supplierId),
        ),
      );
      if (hasQuote) {
        alert(
          "Supplier yang sudah memiliki harga penawaran tidak dapat dikeluarkan.",
        );
        return;
      }
      nextSuppliers = current.filter((id) => id !== String(supplierId));
    } else {
      nextSuppliers = [...current, String(supplierId)];
    }

    try {
      const res = await apiUpdateBiddingSuppliers(
        activeBidding._id,
        nextSuppliers,
      );
      setActiveBidding(res?.data);
      await loadBiddings();
    } catch (err) {
      alert(
        err.response?.data?.message || "Gagal memperbarui supplier peserta",
      );
    }
  };

  // Handle Save BOQ Items Selection
  const handleSaveBOQItems = async () => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    if (!selectedBoqIds.length) {
      alert("Pilih minimal satu item BOQ");
      return;
    }
    setUpdatingItems(true);
    try {
      const res = await apiUpdateBiddingItems(
        activeBidding._id,
        selectedBoqIds,
      );
      setActiveBidding(res?.data);
      setShowItemPickerModal(false);
      await loadBiddings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal memperbarui item BOQ");
    } finally {
      setUpdatingItems(false);
    }
  };

  // Change quotation unitPrice locally in state
  const handleUnitPriceChange = (itemIndex, supplierId, rawValue) => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    const num = Math.max(0, Number(rawValue) || 0);

    setActiveBidding((prev) => {
      const nextItems = [...prev.items];
      const item = { ...nextItems[itemIndex] };
      const nextQuotes = [...(item.quotations || [])];
      const quoteIndex = nextQuotes.findIndex(
        (q) => String(q.supplier?._id || q.supplier) === String(supplierId),
      );

      if (quoteIndex >= 0) {
        nextQuotes[quoteIndex] = { ...nextQuotes[quoteIndex], unitPrice: num };
      } else {
        nextQuotes.push({
          supplier: supplierId,
          unitPrice: num,
          leadTime: "",
          paymentTerm: "",
          notes: "",
        });
      }
      item.quotations = nextQuotes;
      nextItems[itemIndex] = item;
      return { ...prev, items: nextItems };
    });
    setHasUnsavedChanges(true);
  };

  // Change quote metadata (leadTime, paymentTerm, notes)
  const handleUpdateQuoteMeta = (itemIndex, supplierId, meta) => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    setActiveBidding((prev) => {
      const nextItems = [...prev.items];
      const item = { ...nextItems[itemIndex] };
      const nextQuotes = [...(item.quotations || [])];
      const quoteIndex = nextQuotes.findIndex(
        (q) => String(q.supplier?._id || q.supplier) === String(supplierId),
      );

      if (quoteIndex >= 0) {
        nextQuotes[quoteIndex] = { ...nextQuotes[quoteIndex], ...meta };
      } else {
        nextQuotes.push({
          supplier: supplierId,
          unitPrice: 0,
          ...meta,
        });
      }
      item.quotations = nextQuotes;
      nextItems[itemIndex] = item;
      return { ...prev, items: nextItems };
    });
    setHasUnsavedChanges(true);
    setQuoteDetailModal(null);
  };

  // Change selected supplier & reason for item
  const handleSelectWinner = (itemIndex, supplierId) => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    setActiveBidding((prev) => {
      const nextItems = [...prev.items];
      const item = { ...nextItems[itemIndex] };
      item.selectedSupplier = supplierId ? { _id: supplierId } : null;
      nextItems[itemIndex] = item;
      return { ...prev, items: nextItems };
    });
    setHasUnsavedChanges(true);
  };

  const handleSelectionReasonChange = (itemIndex, reason) => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    setActiveBidding((prev) => {
      const nextItems = [...prev.items];
      nextItems[itemIndex] = {
        ...nextItems[itemIndex],
        selectionReason: reason,
      };
      return { ...prev, items: nextItems };
    });
    setHasUnsavedChanges(true);
  };

  // Save all changes (Quotations + Selections) to backend
  const handleSaveAllChanges = async () => {
    if (!activeBidding || activeBidding.status === "FINISHED") return;
    setSavingQuotes(true);
    try {
      // 1. Save quotations
      const quotePayload = {
        items: activeBidding.items.map((item) => ({
          boqItem: item.boqItem?._id || item.boqItem,
          quotations: (item.quotations || []).map((q) => ({
            supplier: q.supplier?._id || q.supplier,
            unitPrice: Number(q.unitPrice) || 0,
            leadTime: q.leadTime || "",
            paymentTerm: q.paymentTerm || "",
            notes: q.notes || "",
          })),
        })),
      };
      await apiUpdateBiddingQuotations(activeBidding._id, quotePayload);

      // 2. Save selections
      const selectionPayload = {
        items: activeBidding.items.map((item) => ({
          boqItem: item.boqItem?._id || item.boqItem,
          selectedSupplier:
            item.selectedSupplier?._id || item.selectedSupplier || null,
          selectionReason: item.selectionReason || "",
        })),
      };
      const res = await apiUpdateBiddingSelections(
        activeBidding._id,
        selectionPayload,
      );

      setActiveBidding(res?.data);
      setHasUnsavedChanges(false);
      setSaveSuccessMsg("Perubahan berhasil disimpan");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
      await loadBiddings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan perubahan");
    } finally {
      setSavingQuotes(false);
    }
  };

  // Finish Bidding
  const handleFinishBidding = async () => {
    if (!activeBidding) return;
    // Auto-save any pending changes first
    if (hasUnsavedChanges) {
      await handleSaveAllChanges();
    }
    setFinishing(true);
    try {
      const res = await apiFinishBidding(activeBidding._id);
      setActiveBidding(res?.data);
      setShowFinishModal(false);
      await loadBiddings();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyelesaikan bidding");
    } finally {
      setFinishing(false);
    }
  };

  // Back to list guard
  const handleBackToList = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm("Ada perubahan yang belum disimpan. Tetap keluar?")
    ) {
      return;
    }
    setActiveId("");
  };

  // Filter biddings in list
  const filteredBiddings = useMemo(() => {
    return biddings.filter((bid) => {
      const matchSearch =
        !searchQuery ||
        bid.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.description?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "FINISHED") return bid.status === "FINISHED";
      if (statusFilter === "IN_PROGRESS")
        return (
          bid.status === "IN_PROGRESS" ||
          bid.status === "QUOTATION" ||
          bid.status === "EVALUATION"
        );
      if (statusFilter === "DRAFT") return bid.status === "DRAFT";
      return true;
    });
  }, [biddings, searchQuery, statusFilter]);

  // Validation readiness
  const finishValidation = useMemo(() => {
    return checkBiddingFinishReady(activeBidding);
  }, [activeBidding]);

  const activeTotal = useMemo(() => {
    return calculateBiddingTotal(activeBidding);
  }, [activeBidding]);

  return {
    // Project context
    projectId,
    project,
    onNavigateToTab,

    // Data lists
    biddings,
    boqItems,
    boqSections,
    filteredBiddings,
    loading,
    activeId,
    setActiveId,
    activeBidding,
    setActiveBidding,
    handleBackToList,

    // Filters & Search
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,

    // Create Modal
    showCreateModal,
    setShowCreateModal,
    createTitle,
    setCreateTitle,
    createDesc,
    setCreateDesc,
    creating,
    handleCreateBidding,

    // Unsaved Changes & Saving
    savingQuotes,
    hasUnsavedChanges,
    saveSuccessMsg,
    handleSaveAllChanges,

    // BOQ Item Picker Modal
    showItemPickerModal,
    setShowItemPickerModal,
    selectedBoqIds,
    setSelectedBoqIds,
    boqSearch,
    setBoqSearch,
    boqSection,
    setBoqSection,
    updatingItems,
    handleSaveBOQItems,

    // Party Master search & selection
    partySearch,
    setPartySearch,
    partyMaster,
    loadingParties,
    handleToggleSupplier,

    // Quotations & Selections
    handleUnitPriceChange,
    handleUpdateQuoteMeta,
    handleSelectWinner,
    handleSelectionReasonChange,

    // Quote Detail Modal
    quoteDetailModal,
    setQuoteDetailModal,

    // Finish Modal & Action
    showFinishModal,
    setShowFinishModal,
    finishing,
    finishValidation,
    activeTotal,
    handleFinishBidding,

    // Delete Modal & Action
    biddingToDelete,
    setBiddingToDelete,
    deleting,
    handleDeleteBidding,

    // Result matrix
    showAuditMatrix,
    setShowAuditMatrix,

    // Refresh
    loadBiddings,
    loadBOQItems,
    loadActiveBidding,
  };
};
