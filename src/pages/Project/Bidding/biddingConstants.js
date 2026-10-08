export const BIDDING_STATUS = {
  ALL: "ALL",
  IN_PROGRESS: "IN_PROGRESS",
  FINISHED: "FINISHED",
  DRAFT: "DRAFT",
};

export const BIDDING_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "FINISHED", label: "Selesai" },
  { value: "DRAFT", label: "Draft" },
];

export const BIDDING_STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    badge: "bg-slate-800 text-slate-400 border border-slate-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-cyan-950/90 text-cyan-300 border border-cyan-700/50",
  },
  QUOTATION: {
    label: "In Progress",
    badge: "bg-cyan-950/90 text-cyan-300 border border-cyan-700/50",
  },
  EVALUATION: {
    label: "In Progress",
    badge: "bg-cyan-950/90 text-cyan-300 border border-cyan-700/50",
  },
  FINISHED: {
    label: "Selesai",
    badge: "bg-emerald-950/90 text-emerald-300 border border-emerald-700/50",
  },
};

export const DEFAULT_CREATE_FORM = {
  title: "",
  description: "",
};
