import {
  RefreshCw,
  AlertCircle,
  CornerDownRight,
  Users,
} from "lucide-react";
import dayjs from "dayjs";

function formatDate(date) {
  if (!date) return "-";
  return dayjs(date).format("DD MMM YYYY");
}

function formatDuration(days) {
  if (days === null || days === undefined) return "-";
  return `${days} ${Math.abs(days) === 1 ? "day" : "days"}`;
}

function StatusBadge({ status }) {
  const map = {
    Done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "Done-In review": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    "In Progress": "bg-sky-500/20 text-sky-300 border-sky-500/30",
    Hold: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    Blocked: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  };
  const cls = map[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    Urgent: "bg-red-600/35 text-red-200 border-red-500/40",
    High: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Medium: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  const cls = map[priority];
  if (!cls) return <span className="text-gray-400">-</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {priority}
    </span>
  );
}

function CompletionBadge({ status }) {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
        -
      </span>
    );
  }
  const lower = String(status).toLowerCase().trim();
  if (lower.includes("overdue"))
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/35">Completed - Overdue</span>;
  if (lower.includes("on time"))
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/35">Completed - On Time</span>;
  if (lower.includes("early"))
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/35">Completed - Early</span>;
  if (lower === "uncomplete")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/35">Uncomplete</span>;
  if (lower === "planning")
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/35">Planning</span>;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">
      {status}
    </span>
  );
}

const TH = ({ children, className = "" }) => (
  <th className={`px-5 py-4 ${className}`}>{children}</th>
);

export default function GroupReportTable({ reports, isLoading, isPlaceholderData }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <RefreshCw className="animate-spin text-indigo-400 w-8 h-8" />
        <span className="text-white/60 text-sm">Retrieving report data...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-24">
        <AlertCircle className="text-white/30 w-10 h-10" />
        <span className="text-white/50 text-sm">No report rows found matching the filters.</span>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
      <table className="w-full text-left border-collapse table-auto min-w-[1600px]">
        <thead>
          <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold text-white/60 uppercase tracking-wider">
            <TH className="min-w-[280px] sticky left-0 bg-[#1f3f62] z-20 shadow-md">
              Task &amp; Subtask
            </TH>
            <TH className="min-w-[150px]">PIC</TH>
            <TH className="min-w-[90px] text-center">Type</TH>
            <TH className="min-w-[110px] text-center">Status</TH>
            <TH className="min-w-[100px] text-center">Priority</TH>
            <TH className="min-w-20 text-center">Scale</TH>
            <TH className="min-w-[120px] text-center">Start Date</TH>
            <TH className="min-w-[120px] text-center">End Date</TH>
            <TH className="min-w-[110px] text-center">Start-End Dur.</TH>
            <TH className="min-w-[120px] text-center">Finish Date</TH>
            <TH className="min-w-[110px] text-center">Start-Finish</TH>
            <TH className="min-w-[110px] text-center">Due-Finish</TH>
            <TH className="min-w-[150px] text-center">Completion Status</TH>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-[13px] text-white/80">
          {reports.map((row, index) => {
            const isSubtask = row.itemType === "SUBTASK";
            return (
              <tr
                key={`${row.taskId}-${row.subtaskId || "parent"}-${index}`}
                className={`transition-colors hover:bg-white/5 ${isSubtask ? "bg-white/2" : ""}`}
              >
                {/* Task / Subtask name – sticky column */}
                <td
                  className={`px-5 py-3.5 font-semibold sticky left-0 z-10 shadow-md ${
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
                <td className="px-5 py-3.5 text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-white/40 shrink-0" />
                    <span className="truncate max-w-[130px]" title={row.pic}>
                      {row.pic}
                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="px-5 py-3.5 text-center">
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

                {/* Status */}
                <td className="px-5 py-3.5 text-center">
                  <StatusBadge status={row.status} />
                </td>

                {/* Priority */}
                <td className="px-5 py-3.5 text-center">
                  <PriorityBadge priority={row.priority} />
                </td>

                {/* Scale */}
                <td className="px-5 py-3.5 text-center font-medium text-white/80">
                  {row.scale}
                </td>

                {/* Start Date */}
                <td className="px-5 py-3.5 text-center text-white/70">
                  {formatDate(row.startDate)}
                </td>

                {/* End Date */}
                <td className="px-5 py-3.5 text-center text-white/70">
                  {formatDate(row.dueDate)}
                </td>

                {/* Duration Start-End */}
                <td className="px-5 py-3.5 text-center font-medium text-indigo-200">
                  {formatDuration(row.durationStartToEnd)}
                </td>

                {/* Finish Date */}
                <td className="px-5 py-3.5 text-center text-white/70">
                  {formatDate(row.finishDate)}
                </td>

                {/* Duration Start-Finish */}
                <td className="px-5 py-3.5 text-center font-medium text-white/60">
                  {formatDuration(row.durationStartToFinish)}
                </td>

                {/* Duration Due-Finish */}
                <td className="px-5 py-3.5 text-center font-medium text-white/60">
                  {formatDuration(row.durationDueToFinish)}
                </td>

                {/* Completion Status */}
                <td className="px-5 py-3.5 text-center">
                  <CompletionBadge status={row.completionStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

