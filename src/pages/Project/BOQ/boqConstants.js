import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const BOQ_STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    bg: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
    icon: Clock,
  },
  Submitted: {
    label: "Submitted",
    bg: "bg-amber-50 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  Approved: {
    label: "Approved",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-rose-50 text-rose-700 border-rose-300",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

export const BOQ_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "Draft", label: "Draft" },
  { value: "Submitted", label: "Submitted" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export const BOQ_PAGE_LIMIT_OPTIONS = [10, 25, 50, 100];
