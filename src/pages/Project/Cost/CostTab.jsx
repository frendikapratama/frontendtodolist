import React from "react";
import { useCostTab } from "./hooks/useCostTab";
import { CostOverviewCards } from "./components/CostOverviewCards";
import { CostToolbar } from "./components/CostToolbar";
import { CostTable } from "./components/CostTable";
import { CostModals } from "./components/CostModals";

const CostTab = ({ projectId, project, tabContext, onClearTabContext, onNavigateToTab }) => {
  const costData = useCostTab(projectId, project, tabContext, onClearTabContext, onNavigateToTab);

  return (
    <div className="space-y-6">
      <CostOverviewCards summary={costData.summary} />
      
      <CostToolbar 
        searchInput={costData.searchInput} 
        setSearchInput={costData.setSearchInput}
        selectedStatus={costData.selectedStatus} 
        setSelectedStatus={costData.setSelectedStatus}
        selectedBudgetId={costData.selectedBudgetId} 
        setSelectedBudgetId={costData.setSelectedBudgetId}
        allBudgets={costData.allBudgets}
        refetch={costData.refetch}
        isFetching={costData.isFetching}
        handleOpenCreateModal={costData.handleOpenCreateModal}
        setPage={costData.setPage}
      />
      
      <CostTable {...costData} />
      
      <CostModals {...costData} />
    </div>
  );
};

export default CostTab;
