import React from "react";
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  AlertCircle,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Coins,
  ShieldCheck,
  Receipt,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate, STATUS_CONFIG } from "../costConstants";

export const CostTable = ({
  isLoading,
  isError,
  refetch,
  costList,
  debouncedSearch,
  selectedStatus,
  handleOpenCreateModal,
  sortBy,
  sortOrder,
  handleSort,
  activeMenuId,
  setActiveMenuId,
  actionMenuRef,
  handleOpenDetailModal,
  handleOpenEditModal,
  handleOpenStatusModal,
  setDeleteCandidate,
  pagination,
  page,
  setPage,
  limit,
  setLimit,
  onNavigateToTab,
}) => (
  <>
    {/* COST TABLE */}
    {isLoading ? (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 rounded-2xl border border-white/5">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs mt-3 font-medium">
          Memuat data Cost...
        </p>
      </div>
    ) : isError ? (
      <div className="p-10 bg-slate-900/60 rounded-2xl border border-rose-500/20 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h4 className="text-rose-400 font-bold text-sm">
          Gagal memuat data Cost
        </h4>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-white/10"
        >
          Coba Lagi
        </button>
      </div>
    ) : costList.length === 0 ? (
      <div className="p-16 bg-slate-900/60 rounded-2xl border-2 border-dashed border-white/10 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
          <Receipt className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-white">
          {debouncedSearch || selectedStatus !== "all"
            ? "Cost Tidak Ditemukan"
            : "Belum Ada Realisasi Biaya (Cost)"}
        </h4>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          {debouncedSearch || selectedStatus !== "all"
            ? "Tidak ada data cost yang sesuai kriteria pencarian Anda."
            : "Catat pengeluaran biaya nyata yang terjadi terhadap alokasi Budget yang telah disetujui."}
        </p>
        <button
          onClick={handleOpenCreateModal}
          className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Cost Pertama</span>
        </button>
      </div>
    ) : (
      <div className="bg-slate-900/60 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort("costCode")}
                >
                  <div className="flex items-center gap-1">
                    <span>Cost Code</span>
                    {sortBy === "costCode" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-400" />
                      ))}
                  </div>
                </th>
                <th
                  className="py-3 px-3 cursor-pointer hover:text-white"
                  onClick={() => handleSort("costDate")}
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal</span>
                    {sortBy === "costDate" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-400" />
                      ))}
                  </div>
                </th>
                <th className="py-3 px-4 min-w-[180px]">BOQ Item</th>
                <th className="py-3 px-3">Budget Code</th>
                <th className="py-3 px-4 min-w-[200px]">Deskripsi Biaya</th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    {sortBy === "amount" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-400" />
                      ))}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {costList.map((item, idx) => {
                const statusConf =
                  STATUS_CONFIG[item.status] || STATUS_CONFIG.Draft;
                const isMenuOpen = activeMenuId === item._id;

                return (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-3 text-center text-slate-500 font-mono">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-400">
                      {item.costCode}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 whitespace-nowrap">
                      {formatDate(item.costDate)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white line-clamp-1">
                      {item.boqItem?.description || "-"}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-purple-300">
                      {item.budget?.budgetCode || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200">
                      {item.description}
                      {item.notes && (
                        <span className="block text-[11px] text-slate-500 truncate">
                          {item.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${statusConf.style}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                        />
                        {statusConf.label}
                      </span>
                    </td>
                    <td
                      className="py-3.5 px-3 text-center relative"
                      ref={isMenuOpen ? actionMenuRef : null}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : item._id)
                          }
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-3 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 divide-y divide-white/5 text-left animate-in fade-in zoom-in-95 duration-100">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>View Detail</span>
                              </button>
                              {item.budget && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (onNavigateToTab) {
                                      onNavigateToTab("budget", {
                                        focusBudgetId: item.budget._id,
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-500/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <Coins className="w-3.5 h-3.5 text-purple-400" />
                                  <span>
                                    View Budget ({item.budget.budgetCode})
                                  </span>
                                </button>
                              )}
                            </div>
                            <div className="py-1">
                              {item.status !== "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Edit Cost</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Approval Status</span>
                              </button>
                            </div>
                            {item.status !== "Approved" && (
                              <div className="py-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setDeleteCandidate(item);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Cost</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Menampilkan{" "}
              <span className="text-white font-medium">{costList.length}</span>{" "}
              dari{" "}
              <span className="text-white font-medium">{pagination.total}</span>{" "}
              item.
            </span>
            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <span>Baris:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-slate-950 text-slate-200 border border-white/10 rounded px-1.5 py-0.5 text-xs focus:outline-none"
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
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium text-slate-200">
              Hal {page} dari {pagination.totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
              className="p-1.5 rounded-lg border border-white/10 bg-slate-950 text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
