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
    badge: "bg-slate-100 text-slate-700 border-slate-300",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  QUOTATION: {
    label: "In Progress",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  EVALUATION: {
    label: "In Progress",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-300",
  },
  FINISHED: {
    label: "Selesai",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
};

export const DEFAULT_CREATE_FORM = {
  title: "",
  description: "",
};
