export const PROJECT_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "planning", label: "Planning" },
  { value: "in progress", label: "In Progress" },
  { value: "hold", label: "Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const PROJECT_SITE_OPTIONS = ["site 1", "site 2", "site 3"];

export const PROJECT_STATUS_STYLES = {
  draft: {
    style: "bg-slate-800 text-slate-300 border-slate-700",
    label: "Draft",
  },
  planning: {
    style: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    label: "Planning",
  },
  "in progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  "in-progress": {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "In Progress",
  },
  hold: {
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    label: "Hold",
  },
  completed: {
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    label: "Completed",
  },
  cancelled: {
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    label: "Cancelled",
  },
};
