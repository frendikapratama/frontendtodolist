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
    style: "bg-slate-800 text-slate-300 border-slate-700",
    dot: "bg-slate-400",
  },
  Submitted: {
    label: "Submitted",
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  Approved: {
    label: "Approved",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  Rejected: {
    label: "Rejected",
    style: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dot: "bg-rose-400",
  },
};
