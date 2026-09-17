import React from "react";

/**
 * Status configuration for consistent badge styling across BOQ, Budget, and Cost modules.
 */
export const STATUS_STYLES = {
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

/**
 * Reusable status badge component.
 * @param {{ status: string, size?: 'sm' | 'md' }} props
 */
const StatusBadge = React.memo(({ status, size = "sm" }) => {
  const conf = STATUS_STYLES[status] || STATUS_STYLES.Draft;
  const sizeClass =
    size === "md"
      ? "px-2.5 py-0.5 text-xs"
      : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold border ${conf.style} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
      {conf.label}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

export default StatusBadge;
