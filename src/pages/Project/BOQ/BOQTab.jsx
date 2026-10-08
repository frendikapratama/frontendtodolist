import React from "react";
import { useBOQTab } from "./hooks/useBOQTab";
import BOQOverviewCards from "./components/BOQOverviewCards";
import BOQToolbar from "./components/BOQToolbar";
import BOQTable from "./components/BOQTable";
import {
  BOQFormModal,
  DeleteBOQModal,
  DetailBOQModal,
  CreateBudgetModal,
  ViewBudgetModal,
} from "./components/BOQModals";

const BOQTab = ({ projectId, onNavigateToTab }) => {
  const boqTab = useBOQTab(projectId);

  const {
    // Queries & data
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
    deleteMutation,
    createBudgetMutation,

    // Filters & pagination
    searchInput,
    setSearchInput,
    selectedSection,
    setSelectedSection,
    selectedStatus,
    setSelectedStatus,
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
    isSectionDropdownOpen,
    setIsSectionDropdownOpen,
    sectionFilterText,
    setSectionFilterText,
    sectionDropdownRef,
    filteredModalSections,
    handleSubmitForm,

    // Quick Budget Form
    budgetPlannedAmount,
    setBudgetPlannedAmount,
    budgetNotes,
    setBudgetNotes,
    budgetStatus,
    setBudgetStatus,
    handleCreateBudgetSubmit,

    // Sort
    sortBy,
    sortOrder,
  } = boqTab;

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <BOQOverviewCards
        availableSections={availableSections}
        statusCounts={data?.statusCounts}
      />

      {/* Toolbar: Search, Filters, Add Button */}
      <BOQToolbar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onClearSearch={() => setSearchInput("")}
        selectedSection={selectedSection}
        onSectionChange={(val) => {
          setSelectedSection(val);
          setPage(1);
        }}
        availableSections={availableSections}
        selectedStatus={selectedStatus}
        onStatusChange={(val) => {
          setSelectedStatus(val);
          setPage(1);
        }}
        onRefresh={refetch}
        isFetching={isFetching}
        onAddClick={() => handleOpenAddModal()}
      />

      {/* BOQ Table Content */}
      <BOQTable
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        data={data}
        refetch={refetch}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onOpenAddModal={handleOpenAddModal}
        onOpenEditModal={handleOpenEditModal}
        onOpenDeleteModal={setDeleteCandidate}
        onOpenDetailModal={setDetailItem}
        onOpenCreateBudget={(item) => {
          handleOpenCreateBudget(item);
        }}
        onOpenViewBudget={setViewBudgetItem}
        onCreateBidding={(item) => onNavigateToTab?.("bidding", { boqItemId: item._id })}
        budgetByBOQItemIdMap={budgetByBOQItemIdMap}
        collapsedSections={collapsedSections}
        onToggleSection={toggleSection}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        activeMenuId={activeMenuId}
        setActiveMenuId={setActiveMenuId}
        actionMenuRef={actionMenuRef}
        onStatusChange={handleStatusChange}
        pagination={pagination}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
      />

      {/* MODAL: ADD / EDIT BOQ ITEM */}
      <BOQFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        availableSections={availableSections}
        filteredModalSections={filteredModalSections}
        isSectionDropdownOpen={isSectionDropdownOpen}
        setIsSectionDropdownOpen={setIsSectionDropdownOpen}
        sectionFilterText={sectionFilterText}
        setSectionFilterText={setSectionFilterText}
        sectionDropdownRef={sectionDropdownRef}
        onSubmit={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* MODAL: DELETE CONFIRMATION */}
      <DeleteBOQModal
        candidate={deleteCandidate}
        isDeleting={deleteMutation.isPending}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* MODAL: VIEW DETAIL BOQ ITEM */}
      <DetailBOQModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        budgetByBOQItemIdMap={budgetByBOQItemIdMap}
        onOpenViewBudget={setViewBudgetItem}
        onOpenCreateBudget={(item) => {
          handleOpenCreateBudget(item);
        }}
      />

      {/* MODAL: CONTEXTUAL CREATE BUDGET */}
      <CreateBudgetModal
        item={createBudgetItem}
        onClose={() => setCreateBudgetItem(null)}
        budgetPlannedAmount={budgetPlannedAmount}
        setBudgetPlannedAmount={setBudgetPlannedAmount}
        budgetNotes={budgetNotes}
        setBudgetNotes={setBudgetNotes}
        budgetStatus={budgetStatus}
        setBudgetStatus={setBudgetStatus}
        onSubmit={handleCreateBudgetSubmit}
        isSubmitting={createBudgetMutation.isPending}
      />

      {/* MODAL: VIEW BUDGET DARI BOQ ITEM */}
      <ViewBudgetModal
        item={viewBudgetItem}
        onClose={() => setViewBudgetItem(null)}
        onNavigateToTab={onNavigateToTab}
      />
    </div>
  );
};

export default BOQTab;
