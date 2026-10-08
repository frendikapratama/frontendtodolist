import React from "react";
import { useBudgetTab } from "./hooks/useBudgetTab";
import { BudgetOverviewCards } from "./components/BudgetOverviewCards";
import { BudgetToolbar } from "./components/BudgetToolbar";

import { BudgetTable } from "./components/BudgetTable";
import { BudgetModals } from "./components/BudgetModals";

const BudgetTab = ({
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
}) => {
  const budgetData = useBudgetTab(
    projectId,
    project,
    tabContext,
    onClearTabContext,
    onNavigateToTab,
  );

  return (
    <div className="space-y-6">
      <BudgetOverviewCards summary={budgetData.summary} />

      <div className="flex justify-end">
        <button type="button" onClick={() => onNavigateToTab?.("bidding")} className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20">
          Create Bidding from project BOQ
        </button>
      </div>

      <BudgetToolbar
        searchInput={budgetData.searchInput}
        setSearchInput={budgetData.setSearchInput}
        selectedStatus={budgetData.selectedStatus}
        setSelectedStatus={budgetData.setSelectedStatus}
        selectedSection={budgetData.selectedSection}
        setSelectedSection={budgetData.setSelectedSection}
        availableSections={budgetData.availableSections}
        refetch={budgetData.refetch}
        isFetching={budgetData.isFetching}
        handleOpenCreateModal={budgetData.handleOpenCreateModal}
      />

      <BudgetTable {...budgetData} />

      <BudgetModals {...budgetData} />
    </div>
  );
};

export default BudgetTab;
