import { useState, useEffect } from "react";
import { useReport } from "../../hook/useReport";
import { useWorkspace } from "../../hook/useWorkspace";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  CornerDownRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  FolderKanban,
  Users,PauseCircle
} from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getReports } from "../../services/report";

export default function ReportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [debouncedFilters, setDebouncedFilters] = useState({
    workspaceId: "",
    projectId: "",
    status: "all",
    priority: "all",
    startDate: "",
    endDate: "",
    search: "",
    page: 1,
    limit: 25,
  });

  const [isExporting, setIsExporting] = useState(false);

  const { workspacesQuery } = useWorkspace();
  const workspaces = workspacesQuery.data || [];

  const activeWorkspaceObj = workspaces.find((ws) => ws._id === selectedWorkspace);
  const projects = activeWorkspaceObj?.projects || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        workspaceId: selectedWorkspace,
        projectId: selectedProject,
        status: selectedStatus,
        priority: selectedPriority,
        startDate,
        endDate,
        search: searchQuery,
        page: currentPage,
        limit: pageSize,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    selectedWorkspace,
    selectedProject,
    selectedStatus,
    selectedPriority,
    startDate,
    endDate,
    searchQuery,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedWorkspace,
    selectedProject,
    selectedStatus,
    selectedPriority,
    startDate,
    endDate,
    searchQuery,
    pageSize,
  ]);

  const { data: reportResponse, isLoading, isPlaceholderData, refetch } = useReport(debouncedFilters);
  const reports = reportResponse?.data || [];
  const summary = reportResponse?.summary || {
    total: 0,
    totalTask: 0,
    totalSubtask: 0,
    done: 0,
    late: 0,
    ontime: 0,
    early: 0,
    unfinished: 0,
  };
  const pagination = reportResponse?.pagination || {
    totalTasks: 0,
    currentPage: 1,
    limit: 25,
    totalPages: 1,
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedWorkspace("");
    setSelectedProject("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("DD MMM YYYY");
  };

  const formatDuration = (days) => {
    if (days === null || days === undefined) return "-";
    return `${days} ${days === 1 || days === -1 ? "day" : "days"}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Done":
      case "Done-In review":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {status}
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {status}
          </span>
        );
      case "Hold":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {status}
          </span>
        );
      case "Blocked":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-300 border border-gray-500/30">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Urgent":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600/35 text-red-200 border border-red-500/40">
            Urgent
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Medium
          </span>
        );
      case "Low":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
            Low
          </span>
        );
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  const getCompletionBadge = (compStatus) => {
    if (!compStatus) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
          -
        </span>
      );
    }

    const lower = String(compStatus).toLowerCase().trim();

    if (lower.includes("overdue")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/35">
          Completed - Overdue
        </span>
      );
    }

    if (lower.includes("on time")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/35">
          Completed - On Time
        </span>
      );
    }

    if (lower.includes("early")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">
          Completed - Early
        </span>
      );
    }

    if (lower === "uncomplete") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35">
          Uncomplete
        </span>
      );
    }

    if (lower === "planning") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/35">
          Planning
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
        {compStatus}
      </span>
    );
  };


  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      toast.loading("Preparing CSV file...", { id: "csv-export" });

      const fullFilters = {
        workspaceId: selectedWorkspace,
        projectId: selectedProject,
        status: selectedStatus,
        priority: selectedPriority,
        startDate,
        endDate,
        search: searchQuery,
        limit: "all",
        export: "true",
      };

      const res = await getReports(fullFilters);
      const allRows = res?.data || [];

      if (allRows.length === 0) {
        toast.error("No report data available to export", { id: "csv-export" });
        setIsExporting(false);
        return;
      }

      const headers = [
        "Quarter",
        "Departemen",
        "Workspace",
        "Project Name",
        "Nama Group",
        "Level",
        "Task Name",
        "Subtask Name",
        "PIC",
        "Type",
        "Status",
        "Priority",
        "Scale",
        "Start Date",
        "End Date",
        "Durasi Start-End (Hari)",
        "Finish Date",
        "Durasi Start-Finish (Hari)",
        "Durasi Due-Finish (Hari)",
        "Status Penyelesaian",
      ];

      const escapeCSV = (val) => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvRows = [];
      csvRows.push(headers.join(","));

      for (const row of allRows) {
        const values = [
          row.kuarter,
          row.departemen,
          row.workspace,
          row.project,
          row.group,
          row.itemType,
          row.taskName,
          row.subtaskName || "-",
          row.pic,
          row.type,
          row.status,
          row.priority,
          row.scale,
          row.startDate ? dayjs(row.startDate).format("YYYY-MM-DD") : "-",
          row.dueDate ? dayjs(row.dueDate).format("YYYY-MM-DD") : "-",
          row.durationStartToEnd ?? "-",
          row.finishDate ? dayjs(row.finishDate).format("YYYY-MM-DD") : "-",
          row.durationStartToFinish ?? "-",
          row.durationDueToFinish ?? "-",
          row.completionStatus,
        ];
        csvRows.push(values.map(escapeCSV).join(","));
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const dateStr = dayjs().format("YYYYMMDD_HHmmss");
      link.setAttribute("href", url);
      link.setAttribute("download", `planify_detailed_report_${dateStr}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV file downloaded successfully", { id: "csv-export" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV export", { id: "csv-export" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="relative z-10 bg-linear-to-r from-blue-600/25 to-purple-600/25 backdrop-blur-sm rounded-xl p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Detailed Reports</h1>
          <p className="text-white/60 text-sm mt-1">
            Track, filter, analyze, and export comprehensive tasks & subtasks metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all active:scale-95"
            title="Refresh Report Data"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download size={16} />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* SUMMARY STATS GRID */}
  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* TOTAL REPORT ROWS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Rows</span>
            <span className="p-1 rounded bg-blue-500/20 text-blue-300"><FileText size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{isLoading ? "..." : summary.total}</p>
          <span className="text-xs text-white/40 block mt-1">Task + Subtask rows</span>
        </div>

        {/* TASKS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Tasks</span>
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-300"><FolderKanban size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{isLoading ? "..." : summary.totalTask}</p>
          <span className="text-xs text-indigo-300/60 block mt-1">Parent Tasks</span>
        </div>

        {/* SUBTASKS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Subtasks</span>
            <span className="p-1 rounded bg-purple-500/20 text-purple-300"><CornerDownRight size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{isLoading ? "..." : summary.totalSubtask}</p>
          <span className="text-xs text-purple-300/60 block mt-1">Subtasks linked</span>
        </div>

        {/* DONE ITEMS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Completed</span>
            <span className="p-1 rounded bg-emerald-500/20 text-emerald-300"><CheckCircle2 size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{isLoading ? "..." : summary.done}</p>
          <span className="text-xs text-white/40 block mt-1">
            {summary.total > 0 ? `${Math.round((summary.done / summary.total) * 100)}%` : "0%"} Completion rate
          </span>
        </div>

        {/* ON TIME */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">On-Time</span>
            <span className="p-1 rounded bg-indigo-500/20 text-indigo-300"><Clock size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{isLoading ? "..." : summary.ontime}</p>
          <span className="text-xs text-indigo-300/60 block mt-1">Completed on schedule</span>
        </div>

        {/* EARLY */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Early</span>
            <span className="p-1 rounded bg-teal-500/20 text-teal-300"><CheckCircle2 size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{isLoading ? "..." : summary.early}</p>
          <span className="text-xs text-emerald-400/60 block mt-1">Finished before due date</span>
        </div>

        {/* LATE ITEMS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Late</span>
            <span className="p-1 rounded bg-rose-500/20 text-rose-300"><AlertCircle size={16} /></span>
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{isLoading ? "..." : summary.late}</p>
          <span className="text-xs text-rose-400/60 block mt-1">Exceeded deadline</span>
        </div>


        {/* UNFINISHED ITEMS */}
        <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10 col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              Unfinished
            </span>

            <span className="p-1 rounded bg-amber-500/20 text-amber-300">
              <PauseCircle size={16} />
            </span>
          </div>

          <p className="text-2xl font-bold text-amber-400 mt-2">
            {isLoading ? "..." : summary.unfinished}
          </p>

          <span className="text-xs text-amber-400/60 block mt-1">
            Planning & uncomplete 
          </span>
        </div>
      </div>

      {/* FILTER BUILDER MODULE */}
      <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="flex items-center gap-2 text-white font-semibold">
            <Filter size={16} className="text-indigo-400" />
            Filters Panel
          </span>
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* SEARCH INPUT */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Search Item
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by task name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white placeholder-white/30 focus:outline-hidden transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            </div>
          </div>

          {/* WORKSPACE SELECTION */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Workspace (Division)
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => {
                setSelectedWorkspace(e.target.value);
                setSelectedProject(""); 
              }}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden focus:bg-[#1C3A5A] transition-all"
            >
              <option value="" className="bg-[#18304B] text-white">All Workspaces</option>
              {workspaces.map((ws) => (
                <option key={ws._id} value={ws._id} className="bg-[#18304B] text-white">
                  {ws.nama}
                </option>
              ))}
            </select>
          </div>

          {/* PROJECT SELECTION */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              disabled={!selectedWorkspace}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden focus:bg-[#1C3A5A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <option value="" className="bg-[#18304B] text-white">
                {selectedWorkspace ? "All Projects" : "Select workspace first"}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id} className="bg-[#18304B] text-white">
                  {project.nama}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS SELECTION */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden focus:bg-[#1C3A5A] transition-all"
            >
              <option value="all" className="bg-[#18304B] text-white">All Statuses</option>
              <option value="To Do" className="bg-[#18304B] text-white">To Do</option>
              <option value="In Progress" className="bg-[#18304B] text-white">In Progress</option>
              <option value="Hold" className="bg-[#18304B] text-white">Hold</option>
              <option value="Blocked" className="bg-[#18304B] text-white">Blocked</option>
              <option value="Done" className="bg-[#18304B] text-white">Done</option>
              <option value="Done-In review" className="bg-[#18304B] text-white">Done-In review</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* PRIORITY */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden focus:bg-[#1C3A5A] transition-all"
            >
              <option value="all" className="bg-[#18304B] text-white">All Priorities</option>
              <option value="Low" className="bg-[#18304B] text-white">Low</option>
              <option value="Medium" className="bg-[#18304B] text-white">Medium</option>
              <option value="High" className="bg-[#18304B] text-white">High</option>
              <option value="Urgent" className="bg-[#18304B] text-white">Urgent</option>
            </select>
          </div>

          {/* START DATE */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Start Date From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden transition-all scheme-dark"
            />
          </div>

          {/* END DATE */}
          <div>
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
              Start Date To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-hidden transition-all scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* REPORT DATA TABLE */}
      <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto min-w-[1600px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold text-white/60 uppercase tracking-wider">
                <th className="px-6 py-4 min-w-[140px]">Project Name</th>
                <th className="px-6 py-4 min-w-[140px]">Group Name</th>
                <th className="px-6 py-4 min-w-[280px] sticky left-0 bg-[#1f3f62] z-20 shadow-md">Task & Subtask</th>
                <th className="px-6 py-4 min-w-[150px]">PIC</th>
                <th className="px-6 py-4 min-w-[90px] text-center">Type</th>
                <th className="px-6 py-4 min-w-[110px] text-center">Status</th>
                <th className="px-6 py-4 min-w-[100px] text-center">Priority</th>
                <th className="px-6 py-4 min-w-20 text-center">Scale</th>
                <th className="px-6 py-4 min-w-[120px] text-center">Start Date</th>
                <th className="px-6 py-4 min-w-[120px] text-center">End Date</th>
                <th className="px-6 py-4 min-w-[110px] text-center">Start-End Dur.</th>
                <th className="px-6 py-4 min-w-[120px] text-center">Finish Date</th>
                <th className="px-6 py-4 min-w-[110px] text-center">Start-Finish</th>
                <th className="px-6 py-4 min-w-[110px] text-center">Due-Finish</th>
                <th className="px-6 py-4 min-w-[130px] text-center">Completion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
              {isLoading ? (
                <tr>
                  <td colSpan="14" className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-indigo-400 w-8 h-8" />
                      <span className="text-white/60 text-sm">Retrieving report database...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="14" className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="text-white/30 w-10 h-10" />
                      <span className="text-white/50 text-sm">No report rows found matching the filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((row, index) => {
                  const isSubtask = row.itemType === "SUBTASK";
                  return (
                    <tr
                      key={`${row.taskId}-${row.subtaskId || "parent"}-${index}`}
                      className={`transition-colors hover:bg-white/5 ${
                        isSubtask ? "bg-white/2" : ""
                      } ${isPlaceholderData ? "opacity-60" : ""}`}
                    >
                      {/* GROUP NAME */}
                      <td className="px-6 py-3.5 font-medium text-white/70">{row.project}</td>
                      <td className="px-6 py-3.5 font-medium text-white/70">{row.group}</td>

                      {/* TASK & SUBTASK STICKY COLUMN */}
                      <td
                        className={`px-6 py-3.5 font-semibold sticky left-0 z-10 shadow-md ${
                          isSubtask
                            ? "bg-[#183554] text-white/80 pl-10"
                            : "bg-[#1d4469] text-white"
                        }`}
                      >
                        {isSubtask ? (
                          <div className="flex items-center gap-2 text-white/60">
                            <CornerDownRight size={14} className="text-indigo-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={row.subtaskName}>
                              {row.subtaskName}
                            </span>
                          </div>
                        ) : (
                          <span className="truncate max-w-[260px] block" title={row.taskName}>
                            {row.taskName}
                          </span>
                        )}
                      </td>

                      {/* PIC */}
                      <td className="px-6 py-3.5 text-white/70">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-white/40 shrink-0" />
                          <span className="truncate max-w-[130px]" title={row.pic}>
                            {row.pic}
                          </span>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                            row.type === "Major"
                              ? "bg-purple-500/25 text-purple-300 border border-purple-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/25"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-3.5 text-center">{getStatusBadge(row.status)}</td>

                      {/* PRIORITY */}
                      <td className="px-6 py-3.5 text-center">{getPriorityBadge(row.priority)}</td>

                      {/* SCALE */}
                      <td className="px-6 py-3.5 text-center font-medium text-white/80">{row.scale}</td>

                      {/* START DATE */}
                      <td className="px-6 py-3.5 text-center text-white/70">{formatDate(row.startDate)}</td>

                      {/* END DATE */}
                      <td className="px-6 py-3.5 text-center text-white/70">{formatDate(row.dueDate)}</td>

                      {/* DURASI START-END */}
                      <td className="px-6 py-3.5 text-center font-medium text-indigo-200">
                        {formatDuration(row.durationStartToEnd)}
                      </td>

                      {/* FINISH DATE */}
                      <td className="px-6 py-3.5 text-center text-white/70">{formatDate(row.finishDate)}</td>

                      {/* DURASI START-FINISH */}
                      <td className="px-6 py-3.5 text-center font-medium text-white/60">
                        {formatDuration(row.durationStartToFinish)}
                      </td>

                      {/* DURASI DUE-FINISH */}
                      <td className="px-6 py-3.5 text-center font-medium text-white/60">
                        {formatDuration(row.durationDueToFinish)}
                      </td>

                      {/* STATUS PENYELESAIAN */}
                      <td className="px-6 py-3.5 text-center">{getCompletionBadge(row.completionStatus)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {!isLoading && reports.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10 gap-4">
            <div className="text-xs text-white/50">
              Showing{" "}
              <span className="font-semibold text-white">
                {pagination.totalTasks > 0 ? (currentPage - 1) * pageSize + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, pagination.totalTasks)}
              </span>{" "}
              of <span className="font-semibold text-white">{pagination.totalTasks}</span> tasks
            </div>

            <div className="flex items-center gap-4">
              {/* ROWS PER PAGE SELECTOR */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white focus:outline-hidden"
                >
                  <option value="10" className="bg-[#18304B]">10</option>
                  <option value="25" className="bg-[#18304B]">25</option>
                  <option value="50" className="bg-[#18304B]">50</option>
                  <option value="100" className="bg-[#18304B]">100</option>
                </select>
              </div>

              {/* NAVIGATOR BUTTONS */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-90"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-xs text-white/80">
                  Page <span className="font-semibold">{currentPage}</span> of{" "}
                  <span className="font-semibold">{pagination.totalPages || 1}</span>
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage >= pagination.totalPages}
                  className="p-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-90"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
