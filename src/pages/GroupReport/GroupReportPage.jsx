import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReport } from "../../hook/useReport";

import GroupReportHeader from "./components/GroupReportHeader";
import GroupReportSummaryCards from "./components/GroupReportSummaryCards";
import GroupReportFilters from "./components/GroupReportFilters";
import GroupReportTable from "./components/GroupReportTable";
import GroupReportPagination from "./components/GroupReportPagination";
import { exportGroupReportToExcel } from "./utils/groupReportExport";

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  priority: "all",
  startDate: "",
  endDate: "",
};

const DEFAULT_SUMMARY = {
  total: 0,
  totalTask: 0,
  totalSubtask: 0,
  done: 0,
  late: 0,
  ontime: 0,
  early: 0,
  unfinished: 0,
};

export default function GroupReportPage() {
  const { projectId, groupId } = useParams();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [debouncedFilters, setDebouncedFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);

  // Debounce filters → prevent API spam on fast typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        groupId,
        status: filters.status,
        priority: filters.priority,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        page: currentPage,
        limit: pageSize,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [groupId, filters, currentPage, pageSize]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, pageSize]);

  const {
    data: reportResponse,
    isLoading,
    isPlaceholderData,
    refetch,
  } = useReport(debouncedFilters);

  const reports = reportResponse?.data || [];
  const summary = reportResponse?.summary || DEFAULT_SUMMARY;
  const pagination = reportResponse?.pagination || {
    totalTasks: 0,
    currentPage: 1,
    limit: 25,
    totalPages: 1,
  };

  // Extract group name from first row (most reliable source without extra fetch)
  const groupName = reports[0]?.group || null;

  const handleFilterChange = (partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportGroupReportToExcel({
      groupId,
      groupName,
      filters: {
        groupId,
        status: filters.status,
        priority: filters.priority,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
      },
    });
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <GroupReportHeader
        groupName={groupName}
        projectId={projectId}
        isLoading={isLoading}
        isExporting={isExporting}
        onRefresh={() => refetch()}
        onExport={handleExport}
      />

      {/* Summary Cards */}
      <GroupReportSummaryCards summary={summary} isLoading={isLoading} />

      {/* Filters */}
      <GroupReportFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table + Pagination */}
      <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <GroupReportTable
          reports={reports}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
        />

        {!isLoading && reports.length > 0 && (
          <GroupReportPagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalTasks={pagination.totalTasks}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}

