import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Reusable pagination footer.
 * @param {{ page, totalPages, total, showing, limit, onPageChange, onLimitChange }} props
 */
const Pagination = React.memo(
  ({ page, totalPages, total, showing, limit, onPageChange, onLimitChange }) => {
    return (
      <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan{" "}
            <span className="text-white font-medium">{showing}</span> dari{" "}
            <span className="text-white font-medium">{total}</span> item.
          </span>
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
            <span>Baris:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-950 text-slate-200 border border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-200">
            Hal {page} dari {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
            className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
