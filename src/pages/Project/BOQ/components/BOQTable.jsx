import React from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Coins,
  Eye,
  Check,
  Plus,
} from "lucide-react";
import { BOQ_STATUS_CONFIG, BOQ_PAGE_LIMIT_OPTIONS } from "../boqConstants";
import { formatCurrency, formatNumber } from "../boqUtils";

const BOQTable = ({
  isLoading,
  isError,
  isFetching,
  data,
  refetch,
  hasActiveFilters,
  onResetFilters,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenDetailModal,
  onOpenCreateBudget,
  onOpenViewBudget,
  budgetByBOQItemIdMap,
  collapsedSections,
  onToggleSection,
  sortBy,
  sortOrder,
  onSort,
  activeMenuId,
  setActiveMenuId,
  actionMenuRef,
  onStatusChange,
  pagination,
  page,
  setPage,
  limit,
  setLimit,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-slate-950/60 rounded-2xl border border-white/5">
        <div className="w-10 h-10 border-4 border-[#0E7490] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs mt-3 font-medium">
          Memuat data Bill of Quantity...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 bg-slate-950/60 rounded-2xl border border-rose-500/20 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h4 className="text-rose-400 font-bold text-sm">
          Gagal memuat data BOQ
        </h4>
        <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
          Terjadi kendala saat mengambil data BOQ dari server.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-white/10 cursor-pointer"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="p-16 bg-slate-950/60 rounded-2xl border-2 border-dashed border-white/10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0E7490]/10 text-[#0E7490] flex items-center justify-center mx-auto mb-4 border border-[#0E7490]/20">
          <FileText className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-100">
          {hasActiveFilters ? "Item BOQ Tidak Ditemukan" : "Belum Ada Item BOQ"}
        </h4>
        <p className="text-slate-400 text-xs max-w-md mx-auto mt-1 mb-5">
          {hasActiveFilters
            ? "Tidak ada item BOQ yang cocok dengan kriteria pencarian atau filter Anda."
            : "Buat rincian pekerjaan pertama Anda. Ketik nama section secara manual atau pilih section yang sudah ada."}
        </p>
        {hasActiveFilters ? (
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 border border-white/10 cursor-pointer"
          >
            Reset Filter
          </button>
        ) : (
          <button
            onClick={() => onOpenAddModal()}
            className="px-4 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-semibold rounded-xl transition inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buat Section & Item Baru
          </button>
        )}
      </div>
    );
  }

  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3 h-3 text-[#0E7490]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#0E7490]" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Grouped by Section */}
      {data.sections.map((sec) => {
        const isCollapsed = !!collapsedSections[sec.name];

        return (
          <div
            key={sec.name}
            className="bg-slate-950/60 rounded-2xl border border-white/5 shadow-sm overflow-hidden transition"
          >
            {/* Section Header */}
            <div
              onClick={() => onToggleSection(sec.name)}
              className="px-5 py-3.5 bg-slate-900/90 hover:bg-slate-800/60 border-b border-white/5 flex items-center justify-between cursor-pointer transition select-none sticky top-0 z-10 backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-200"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0E7490]/10 text-[#0E7490] uppercase tracking-wider border border-[#0E7490]/20">
                      Section
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      {sec.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {sec.itemCount} item pada halaman ini
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="text-right">
                  <p className="text-[11px] font-medium text-slate-400">
                    Subtotal Section
                  </p>
                  <p className="text-sm font-bold text-slate-100 font-mono">
                    {formatCurrency(sec.subtotal)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddModal(sec.name);
                  }}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-cyan-400 text-xs font-semibold rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Tambah item pada section ini"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Item</span>
                </button>
              </div>
            </div>

            {/* Section Table */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th
                        className="py-2.5 px-3 w-28 cursor-pointer hover:text-slate-200 transition"
                        onClick={() => onSort("itemCode")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Item Code</span>
                          {renderSortIndicator("itemCode")}
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-4 min-w-60 cursor-pointer hover:text-slate-200 transition"
                        onClick={() => onSort("description")}
                      >
                        <div className="flex items-center gap-1">
                          <span>Deskripsi</span>
                          {renderSortIndicator("description")}
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-16 text-center">Unit</th>
                      <th
                        className="py-2.5 px-3 w-24 text-right cursor-pointer hover:text-slate-200 transition"
                        onClick={() => onSort("quantity")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Qty</span>
                          {renderSortIndicator("quantity")}
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 w-32 text-right cursor-pointer hover:text-slate-200 transition"
                        onClick={() => onSort("unitPrice")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Harga Satuan</span>
                          {renderSortIndicator("unitPrice")}
                        </div>
                      </th>
                      <th
                        className="py-2.5 px-3 w-36 text-right cursor-pointer hover:text-slate-200 transition"
                        onClick={() => onSort("totalPrice")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Total Harga</span>
                          {renderSortIndicator("totalPrice")}
                        </div>
                      </th>
                      <th className="py-2.5 px-3 w-28 text-center">Status</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Catatan</th>
                      <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {sec.items.map((item, itemIdx) => {
                      const statusInfo =
                        BOQ_STATUS_CONFIG[item.status] ||
                        BOQ_STATUS_CONFIG.Draft;
                      const isMenuOpen = activeMenuId === item._id;

                      return (
                        <tr
                          key={item._id}
                          className="hover:bg-slate-900/60 transition-colors group text-slate-300"
                        >
                          <td className="py-3 px-3 text-center text-slate-500 font-mono">
                            {(pagination.page - 1) * pagination.limit +
                              itemIdx +
                              1}
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-slate-300">
                            {item.itemCode || (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-100">
                              {item.description}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-300 uppercase font-semibold">
                            <span className="px-2 py-0.5 bg-slate-800/80 rounded text-[11px] border border-white/5">
                              {item.unit}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-200">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-300 font-mono">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-100 font-mono">
                            {formatCurrency(item.totalPrice)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                              />
                              <span>{statusInfo.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 max-w-40 truncate">
                            {item.notes || (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId((prev) =>
                                  prev === item._id ? null : item._id,
                                );
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
                              title="Menu Aksi"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Action Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-2 top-full mt-1 w-48 bg-slate-900 rounded-xl shadow-2xl border border-white/10 py-1.5 text-left animate-in fade-in zoom-in-95 duration-100 z-50"
                              >
                                {/* 1. View Detail BOQ Item */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onOpenDetailModal(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>View Detail</span>
                                </button>

                                {/* 2. Create Budget / View Budget (Contextual CTA) */}
                                {budgetByBOQItemIdMap[item._id] ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onOpenViewBudget(
                                        budgetByBOQItemIdMap[item._id],
                                      );
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-purple-300 hover:bg-purple-500/10 flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <Coins className="w-3.5 h-3.5 text-purple-400" />
                                    <span>
                                      View Budget (
                                      {
                                        budgetByBOQItemIdMap[item._id]
                                          .budgetCode
                                      }
                                      )
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onOpenCreateBudget(item);
                                    }}
                                    className="w-full px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Create Budget</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-white/5" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onOpenEditModal(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Edit Item</span>
                                </button>

                                <div className="my-1 border-t border-white/5 px-3 py-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Ubah Status:
                                  </span>
                                </div>

                                {[
                                  "Draft",
                                  "Submitted",
                                  "Approved",
                                  "Rejected",
                                ].map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    onClick={() => onStatusChange(item._id, st)}
                                    className={`w-full px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition cursor-pointer ${
                                      item.status === st
                                        ? "font-bold text-[#0E7490]"
                                        : "text-slate-300"
                                    }`}
                                  >
                                    <span>{st}</span>
                                    {item.status === st && (
                                      <Check className="w-3 h-3 text-[#0E7490]" />
                                    )}
                                  </button>
                                ))}

                                <div className="my-1 border-t border-white/5" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onOpenDeleteModal(item);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Hapus Item</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Section Subtotal Row */}
                    <tr className="bg-slate-900/60 font-semibold border-t border-white/5">
                      <td
                        colSpan={6}
                        className="py-2.5 px-4 text-right text-[11px] text-slate-400 uppercase tracking-wider"
                      >
                        Subtotal {sec.name}:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs font-bold text-slate-100">
                        {formatCurrency(sec.subtotal)}
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Grand Total Footer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Akumulasi Anggaran BOQ
          </span>
          <h3 className="text-lg font-bold mt-0.5 text-slate-100">
            Grand Total Bill of Quantity
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Total kumulatif keseluruhan proyek ({pagination.totalOverall} item
            terdata)
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-cyan-300 font-medium">
            Total Estimasi Biaya
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-white mt-0.5 font-mono">
            {formatCurrency(data.grandTotal)}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="bg-slate-950/60 rounded-2xl p-4 border border-white/5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan{" "}
            <strong className="text-slate-200">
              {pagination.total > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
              –{Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            dari <strong className="text-slate-200">{pagination.total}</strong>{" "}
            item
            {pagination.total !== pagination.totalOverall && (
              <span className="text-slate-500 ml-1">
                (difilter dari total {pagination.totalOverall})
              </span>
            )}
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
            <span>Baris per hal:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-900 text-slate-200 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            >
              {BOQ_PAGE_LIMIT_OPTIONS.map((lim) => (
                <option key={lim} value={lim}>
                  {lim}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isFetching}
            onClick={() => setPage(Math.max(page - 1, 1))}
            className="p-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300 cursor-pointer"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-semibold px-2 text-slate-300">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>

          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages || isFetching}
            onClick={() => setPage(Math.min(page + 1, pagination.totalPages))}
            className="p-2 rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition text-slate-300 cursor-pointer"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOQTable;
