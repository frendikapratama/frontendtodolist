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
    style: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Draft",
  },
  planning: {
    style: "bg-violet-50 text-violet-700 border-violet-100",
    label: "Planning",
  },
  "in progress": {
    style: "bg-cyan-50 text-[#0E7490] border-cyan-100",
    label: "In Progress",
  },
  "in-progress": {
    style: "bg-cyan-50 text-[#0E7490] border-cyan-100",
    label: "In Progress",
  },
  hold: {
    style: "bg-amber-50 text-amber-700 border-amber-100",
    label: "Hold",
  },
  completed: {
    style: "bg-emerald-50 text-emerald-700 border-emerald-100",
    label: "Completed",
  },
  cancelled: {
    style: "bg-rose-50 text-rose-700 border-rose-100",
    label: "Cancelled",
  },
};
