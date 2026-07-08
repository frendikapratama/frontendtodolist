import React, { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import {
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  MapPin,
  Download,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import useMeetingRecap from "../../../hook/BookingMeeting/useMeetingRecap";
import meetingRecapService from "../../../services/BookingMeeting/meetingRecap";

const displayName = (entity) =>
  entity?.name || entity?.nama || entity?.username || "";

// Mengubah warna status badge agar match dengan tema dark mode transparan
const STATUS_MAP = {
  scheduled: {
    label: "Scheduled",
    bg: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20",
  },
};

const STATUS_LABEL = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] || {
    label: status,
    bg: "bg-white/5 text-slate-400 ring-1 ring-white/10",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
};

// Mengubah StatCard ke gaya dark panel
const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 p-5 flex items-center gap-4 shadow-xl transition-all duration-200 hover:border-white/20">
    <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-400">
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mt-0.5">
        {(value ?? 0).toLocaleString()}
      </p>
    </div>
  </div>
);

const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-slate-500">
    <div className="p-4 bg-white/5 rounded-full mb-3 border border-white/5">
      <ClipboardList size={28} className="text-slate-400" />
    </div>
    <p className="text-sm font-medium text-slate-400">{message}</p>
  </div>
);

const ErrorState = ({ message = "Failed to load data", onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-rose-400">
    <div className="p-3 bg-rose-500/10 rounded-full mb-3 border border-rose-500/20">
      <AlertTriangle size={24} className="text-rose-400" />
    </div>
    <p className="text-sm font-semibold text-slate-200">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 transition-all shadow-sm"
      >
        <RefreshCw size={12} />
        Try again
      </button>
    )}
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-white/5">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
      </td>
    ))}
  </tr>
);

const MeetingRecapPage = () => {
  const { recapSummaryQuery, meetingResultsListQuery } = useMeetingRecap();

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    onlyWithResults: false,
  });
  const [dateError, setDateError] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const summaryQ = recapSummaryQuery(appliedFilters);
  const resultsQ = meetingResultsListQuery({
    ...appliedFilters,
    page,
    limit: 25,
    onlyWithResults: appliedFilters.onlyWithResults ? "true" : undefined,
  });

  const summary = summaryQ.data?.data || {};
  const results = resultsQ.data?.data || [];
  const pagination = resultsQ.data?.pagination || {};
  const byStatus = summary.byStatus || {};

  const filteredResults = useMemo(() => {
    if (!searchText.trim()) return results;
    const q = searchText.toLowerCase();
    return results.filter(
      (m) =>
        m.title?.toLowerCase().includes(q) ||
        displayName(m.organizerId).toLowerCase().includes(q) ||
        m.organizerId?.username?.toLowerCase().includes(q) ||
        displayName(m.roomId).toLowerCase().includes(q),
    );
  }, [results, searchText]);

  useEffect(() => {
    if (
      filters.startDate &&
      filters.endDate &&
      dayjs(filters.endDate).isBefore(dayjs(filters.startDate))
    ) {
      setDateError("End date must be on or after start date");
      return;
    }
    setDateError("");

    const timer = setTimeout(() => {
      setPage(1);
      const f = {};
      if (filters.startDate) f.startDate = filters.startDate;
      if (filters.endDate) f.endDate = filters.endDate;
      if (filters.status) f.status = filters.status;
      if (filters.onlyWithResults) f.onlyWithResults = true;
      setAppliedFilters(f);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    filters.startDate,
    filters.endDate,
    filters.status,
    filters.onlyWithResults,
  ]);

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      status: "",
      onlyWithResults: false,
      e,
    });
    setDateError("");
    setAppliedFilters({});
    setPage(1);
  };

  const isFetchingAny = summaryQ.isFetching || resultsQ.isFetching;
  const handleExportExcel = async () => {
    setIsExporting(true);

    try {
      const res = await meetingRecapService.getMeetingResultsList({
        ...appliedFilters,
        limit: "all",
        onlyWithResults: appliedFilters.onlyWithResults ? "true" : undefined,
      });

      let exportData = res?.data || [];

      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        exportData = exportData.filter(
          (m) =>
            m.title?.toLowerCase().includes(q) ||
            displayName(m.organizerId).toLowerCase().includes(q) ||
            m.organizerId?.username?.toLowerCase().includes(q) ||
            displayName(m.roomId).toLowerCase().includes(q),
        );
      }

      if (!exportData.length) return;

      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Planify";
      workbook.created = new Date();

      const sheet = workbook.addWorksheet("Rekap Meeting");

      const headers = [
        "No",
        "Judul Meeting",
        "Ruangan",
        "Organizer",
        "Tanggal",
        "Jam Mulai",
        "Jam Selesai",
        "Status",
        "Catatan / Isi",
      ];

      const headerRow = sheet.addRow(headers);

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
        };

        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };

        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let no = 1;

      exportData.forEach((meeting) => {
        const results =
          meeting.meetingResults?.length > 0 ? meeting.meetingResults : [null];

        results.forEach((result) => {
          const row = sheet.addRow([
            no++,
            meeting.title || "-",
            displayName(meeting.roomId) || "-",
            displayName(meeting.organizerId) ||
              meeting.organizerId?.email ||
              "-",
            dayjs(meeting.startTime).format("DD MMM YYYY"),
            dayjs(meeting.startTime).format("HH:mm"),
            dayjs(meeting.endTime).format("HH:mm"),
            STATUS_LABEL[meeting.status] || meeting.status,
            result?.content || "-",
          ]);

          row.eachCell((cell) => {
            cell.alignment = {
              vertical: "top",
              horizontal: "left",
              wrapText: true,
            };
          });
        });
      });

      sheet.columns = [
        { width: 6 }, // No
        { width: 35 }, // Judul Meeting
        { width: 22 }, // Ruangan
        { width: 22 }, // Organizer
        { width: 16 }, // Tanggal
        { width: 12 }, // Jam Mulai
        { width: 12 }, // Jam Selesai
        { width: 15 }, // Status
        { width: 60 }, // Catatan
      ];

      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length },
      };

      sheet.views = [
        {
          state: "frozen",
          ySplit: 1,
        },
      ];

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Rekap_Meeting_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export Excel failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header Container - Clean transparan dark mode */}
      <div className="sticky top-0 z-40 bg-linear-to-b from-slate-900/80 to-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 p-5 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Ikon Header (Menggunakan Calendar ala Meeting Recap) */}
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <Calendar size={22} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Meeting Recap
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                  {(pagination.totalCount || 0).toLocaleString()} Total
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Comprehensive overview of organization meetings and descriptive
                summaries.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Search & Actions Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Tombol Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={
                isExporting || resultsQ.isLoading || !pagination.totalCount
              }
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-500/50 font-semibold text-sm text-emerald-400 border border-emerald-500/20 transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              Export Excel
            </button>

            {/* Tombol Refresh */}
            {/* <button
              onClick={() => {
                summaryQ.refetch();
                resultsQ.refetch();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 text-sm font-medium text-white shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <RefreshCw
                size={14}
                className={
                  isFetchingAny
                    ? "animate-spin text-blue-400"
                    : "text-slate-400"
                }
              />
              Refresh
            </button> */}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryQ.isError ? (
        <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 mb-6">
          <ErrorState
            message="Failed to load summary"
            onRetry={() => summaryQ.refetch()}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<Calendar size={18} className="text-blue-400" />}
            label="Total Meetings"
            value={summary.totalMeetings}
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-emerald-400" />}
            label="Completed"
            value={byStatus.completed}
          />
          <StatCard
            icon={<XCircle size={18} className="text-rose-400" />}
            label="Cancelled"
            value={byStatus.cancelled}
          />
          <StatCard
            icon={<FileText size={18} className="text-blue-400" />}
            label="With Results"
            value={summary.totalWithResults}
          />
        </div>
      )}

      {/* Filters & Workspace Panel */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4 text-white font-semibold text-sm border-b border-white/5 pb-2">
          <SlidersHorizontal size={14} className="text-blue-400" />
          <span>Filter & Search Workspace</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label
              htmlFor="startDate"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white/5 text-white transition-all scheme-dark"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
            >
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white/5 text-white transition-all scheme-dark"
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
            >
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="w-full border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white/5 text-slate-300 transition-all [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-4 h-9 lg:mb-0.5">
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.onlyWithResults}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    onlyWithResults: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/20 accent-blue-600 transition-all"
              />
              Only with results
            </label>
            <button
              onClick={resetFilters}
              className="px-4 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all shadow-sm"
            >
              Reset Filter
            </button>
          </div>
        </div>
        {dateError && (
          <p className="text-xs font-medium text-rose-400 mt-2 flex items-center gap-1">
            <AlertTriangle size={12} /> {dateError}
          </p>
        )}
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden">
        {/* Search Bar & Table Header */}
        <div className="p-4 bg-white/2 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title, organizer, or room…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 bg-white/5 text-white placeholder-slate-400 transition-all"
            />
          </div>
          <div className="text-xs font-medium text-slate-400 self-end sm:self-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
            <span className="text-blue-400 font-semibold">
              {(pagination.totalCount ?? 0).toLocaleString()}
            </span>{" "}
            records found
          </div>
        </div>

        {resultsQ.isError ? (
          <ErrorState
            message="Failed to load meeting results"
            onRetry={() => resultsQ.refetch()}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white/2 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-5 py-3.5 font-bold">Meeting Title</th>
                  <th className="px-4 py-3.5 font-bold">Room</th>
                  <th className="px-4 py-3.5 font-bold">Organizer</th>
                  <th className="px-4 py-3.5 font-bold">Schedule</th>
                  <th className="px-4 py-3.5 font-bold text-center">Status</th>
                  <th className="px-5 py-3.5 font-bold text-center">
                    Summary Results
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {resultsQ.isLoading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="bg-transparent">
                      <EmptyState message="No matching meetings found" />
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((meeting) => {
                    const resultCount = meeting.meetingResults?.length || 0;
                    return (
                      <tr
                        key={meeting._id}
                        className="hover:bg-white/3 transition-colors duration-150"
                      >
                        <td className="px-5 py-4 max-w-60">
                          <p
                            className="font-semibold text-white truncate"
                            title={meeting.title}
                          >
                            {meeting.title}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
                            <MapPin size={13} className="text-slate-400" />
                            {displayName(meeting.roomId) || (
                              <span className="text-white/20 font-normal">
                                —
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-300 font-medium">
                          {displayName(meeting.organizerId) || (
                            <span className="text-white/20 font-normal">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-slate-300">
                          <div className="font-semibold text-white">
                            {dayjs(meeting.startTime).format("DD MMM YYYY")}
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-0.5">
                            {dayjs(meeting.startTime).format("HH:mm")} –{" "}
                            {dayjs(meeting.endTime).format("HH:mm")}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusBadge status={meeting.status} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          {resultCount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                              {resultCount} Document{resultCount > 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Panel */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/1">
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="join">
              <button
                className="join-item btn btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                «
              </button>
              <button className="join-item btn btn-sm bg-slate-800 text-white border-white/10 cursor-default">
                {pagination.page}
              </button>
              <button
                className="join-item btn btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pagination.totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRecapPage;
