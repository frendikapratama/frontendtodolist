import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GroupReportPagination({
  currentPage,
  totalPages,
  totalTasks,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const from = totalTasks > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to = Math.min(currentPage * pageSize, totalTasks);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10 gap-4">
      {/* Count info */}
      <div className="text-xs text-white/50">
        Showing{" "}
        <span className="font-semibold text-white">{from}</span>
        {" to "}
        <span className="font-semibold text-white">{to}</span>
        {" of "}
        <span className="font-semibold text-white">{totalTasks}</span>
        {" tasks"}
      </div>

      <div className="flex items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white focus:outline-hidden"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n} className="bg-[#18304B]">
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-90"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-xs text-white/80">
            Page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages || 1}</span>
          </div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded bg-white/5 border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all active:scale-90"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

