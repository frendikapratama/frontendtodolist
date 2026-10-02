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
