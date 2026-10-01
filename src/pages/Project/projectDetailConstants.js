export const PROJECT_DETAIL_STATUS_MAP = {
  draft: {
    style: "bg-slate-100 text-slate-600 border-slate-200",
    label: "Draft",
  },
  planning: {
    style: "bg-violet-50 text-violet-700 border-violet-100",
    label: "Planning",
  },
  "in progress": {
    style: "bg-[#ECFEFF] text-[#0891B2] border-[#CFFAFE]",
    label: "In Progress",
  },
  "in-progress": {
    style: "bg-[#ECFEFF] text-[#0891B2] border-[#CFFAFE]",
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

export const PROJECT_DETAIL_TABS = [
  { key: "overview", label: "Overview", color: "bg-blue-600" },
  { key: "boq", label: "BOQ", color: "bg-[#0E7490]" },
  { key: "budget", label: "Budget", color: "bg-purple-600" },
  { key: "cost", label: "Cost", color: "bg-cyan-600" },
];
