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
  Eye,
  Coins,
  ShieldCheck,
  ListTree,
} from "lucide-react";
import { formatCurrency, STATUS_CONFIG } from "../budgetConstants";

export const BudgetTable = ({
  isLoading,
  isError,
  refetch,
  budgetList,
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
  handleAddCostFromBudget,
  handleOpenCostBreakdown,
  handleOpenEditModal,
  handleOpenApproveModal,
  setDeleteCandidate,
  pagination,
  page,
  setPage,
  limit,
  setLimit,
}) => (
  <>
    {/* BUDGET TABLE CONTENT */}
    {isLoading ? (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 rounded-2xl border border-white/5">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs mt-3 font-medium">
          Memuat data Budget...
        </p>
      </div>
    ) : isError ? (
      <div className="p-10 bg-slate-900/60 rounded-2xl border border-rose-500/20 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h4 className="text-rose-400 font-bold text-sm">
          Gagal memuat data Budget
        </h4>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-white/10"
        >
          Coba Lagi
        </button>
      </div>
    ) : budgetList.length === 0 ? (
      <div className="p-16 bg-slate-900/60 rounded-2xl border-2 border-dashed border-white/10 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
          <Coins className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-white">
          {debouncedSearch || selectedStatus !== "all"
            ? "Budget Tidak Ditemukan"
            : "Belum Ada Data Budget"}
        </h4>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          {debouncedSearch || selectedStatus !== "all"
            ? "Tidak ada item budget yang sesuai kriteria pencarian."
            : "Buat alokasi budget untuk item pekerjaan BOQ Anda untuk mulai mengontrol realisasi cost."}
        </p>
        <button
          onClick={handleOpenCreateModal}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Budget Pertama</span>
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
                  onClick={() => handleSort("budgetCode")}
                >
                  <div className="flex items-center gap-1">
                    <span>Budget Code</span>
                    {sortBy === "budgetCode" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-blue-400" />
                      ))}
                  </div>
                </th>
                <th
                  className="py-3 px-4 min-w-[200px] cursor-pointer hover:text-white"
                  onClick={() => handleSort("boqItem")}
                >
                  <div className="flex items-center gap-1">
                    <span>BOQ Item</span>
                    {sortBy === "boqItem" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-blue-400" />
                      ))}
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort("plannedAmount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Planned Budget</span>
                    {sortBy === "plannedAmount" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-blue-400" />
                      ))}
                  </div>
                </th>
                <th
                  className="py-3 px-3 text-right cursor-pointer hover:text-white"
                  onClick={() => handleSort("approvedAmount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Approval Budget</span>
                    {sortBy === "approvedAmount" &&
                      (sortOrder === "asc" ? (
                        <ArrowUp className="w-3 h-3 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-blue-400" />
                      ))}
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Actual Cost</th>
                <th className="py-3 px-3 text-right">Remaining</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {budgetList.map((item, idx) => {
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
                      {item.budgetCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white line-clamp-1">
                        {item.boqItem?.description || "-"}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        {item.boqItem?.section && (
                          <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-[10px]">
                            {item.boqItem.section}
                          </span>
                        )}
                        {item.boqItem?.itemCode && (
                          <span className="font-mono text-slate-500">
                            {item.boqItem.itemCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-purple-300">
                      {formatCurrency(item.plannedAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(item.approvedAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-amber-400">
                      <button
                        onClick={() => handleOpenCostBreakdown(item)}
                        className="hover:underline flex items-center justify-end gap-1 ml-auto text-amber-300 font-semibold cursor-pointer"
                        title="Klik untuk melihat daftar Cost"
                      >
                        <span>{formatCurrency(item.actualCost)}</span>
                        <ListTree className="w-3 h-3 text-amber-400/70" />
                      </button>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          item.remainingBudget < 0
                            ? "text-rose-400"
                            : "text-blue-300"
                        }
                      >
                        {formatCurrency(item.remainingBudget)}
                      </span>
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
                          title="Menu Aksi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Action dropdown menu */}
                        {isMenuOpen && (
                          <div className="absolute right-3 top-10 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-30 divide-y divide-white/5 animate-in fade-in zoom-in-95 duration-100 text-left">
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-400" />
                                <span>View Detail</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddCostFromBudget(item)}
                                className="w-full px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-400" />
                                <span>Add Cost</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenCostBreakdown(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                              >
                                <ListTree className="w-3.5 h-3.5 text-purple-400" />
                                <span>View Costs</span>
                              </button>
                            </div>
                            <div className="py-1">
                              {item.status !== "Approved" && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(item)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Edit Planned Budget</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleOpenApproveModal(item)}
                                className="w-full px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Approval Workflow</span>
                              </button>
                            </div>
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
                                <span>Hapus Budget</span>
                              </button>
                            </div>
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
              <span className="text-white font-medium">
                {budgetList.length}
              </span>{" "}
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
