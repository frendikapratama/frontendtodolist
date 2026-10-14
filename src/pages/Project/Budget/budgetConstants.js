export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const STATUS_CONFIG = {
  Draft: {
    label: "Draft",
    style: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
  },
  Submitted: {
    label: "Submitted",
    style: "bg-amber-50 text-amber-700 border-amber-300",
    dot: "bg-amber-500",
  },
  Approved: {
    label: "Approved",
    style: "bg-emerald-50 text-emerald-700 border-emerald-300",
    dot: "bg-emerald-500",
  },
  Rejected: {
    label: "Rejected",
    style: "bg-rose-50 text-rose-700 border-rose-300",
    dot: "bg-rose-500",
  },
};
