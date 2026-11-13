import {
  FileText,
  FolderKanban,
  CornerDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  PauseCircle,
} from "lucide-react";

const STAT_CARDS = (summary, isLoading) => [
  {
    label: "Total Rows",
    value: summary.total,
    sub: "Task + Subtask rows",
    icon: <FileText size={16} />,
    iconBg: "bg-blue-500/20 text-blue-300",
    valueColor: "text-white",
  },
  {
    label: "Tasks",
    value: summary.totalTask,
    sub: "Parent Tasks",
    icon: <FolderKanban size={16} />,
    iconBg: "bg-indigo-500/20 text-indigo-300",
    valueColor: "text-white",
  },
  {
    label: "Subtasks",
    value: summary.totalSubtask,
    sub: "Subtasks linked",
    icon: <CornerDownRight size={16} />,
    iconBg: "bg-purple-500/20 text-purple-300",
    valueColor: "text-white",
  },
  {
    label: "Completed",
    value: summary.done,
    sub:
      summary.total > 0
        ? `${Math.round((summary.done / summary.total) * 100)}% completion rate`
        : "0% completion rate",
    icon: <CheckCircle2 size={16} />,
    iconBg: "bg-emerald-500/20 text-emerald-300",
    valueColor: "text-emerald-400",
  },
  {
    label: "On-Time",
    value: summary.ontime,
    sub: "Completed on schedule",
    icon: <Clock size={16} />,
    iconBg: "bg-indigo-500/20 text-indigo-300",
    valueColor: "text-indigo-400",
  },
  {
    label: "Early",
    value: summary.early,
    sub: "Finished before due date",
    icon: <CheckCircle2 size={16} />,
    iconBg: "bg-teal-500/20 text-teal-300",
    valueColor: "text-emerald-400",
  },
  {
    label: "Late",
    value: summary.late,
    sub: "Exceeded deadline",
    icon: <AlertCircle size={16} />,
    iconBg: "bg-rose-500/20 text-rose-300",
    valueColor: "text-rose-400",
  },
  {
    label: "Unfinished Tasks",
    value: summary.unfinished,
    sub: "Planning & uncomplete",
    icon: <PauseCircle size={16} />,
    iconBg: "bg-amber-500/20 text-amber-300",
    valueColor: "text-amber-400",
  },
];

export default function GroupReportSummaryCards({ summary, isLoading }) {
  const cards = STAT_CARDS(summary, isLoading);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-102 hover:bg-white/10"
        >
          <div className="flex justify-between items-start">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">
              {card.label}
            </span>
            <span className={`p-1 rounded ${card.iconBg}`}>{card.icon}</span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${card.valueColor}`}>
            {isLoading ? "..." : (card.value ?? 0)}
          </p>
          <span className="text-xs text-white/40 block mt-1">{card.sub}</span>
        </div>
      ))}
    </div>
  );
}
