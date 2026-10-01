import React from "react";
import {
  X,
  Check,
  Search,
  ChevronDown,
  Trash2,
  FileText,
  Coins,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "../boqUtils";

//  Modal for Creating or Editing a BOQ Item
export const BOQFormModal = ({
  isOpen,
  onClose,
  editingItem,
  formData,
  setFormData,
  formErrors,
  availableSections = [],
  filteredModalSections = [],
  isSectionDropdownOpen,
  setIsSectionDropdownOpen,
  sectionFilterText,
  setSectionFilterText,
  sectionDropdownRef,
  modalCalculatedTotal,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0E7490]/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              BOQ
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingItem ? "Edit Item BOQ" : "Tambah Item BOQ"}
              </h3>
              <p className="text-xs text-slate-400">
                {editingItem
                  ? "Perbarui detail pekerjaan dan harga"
                  : "Buat rincian pekerjaan dan harga satuan baru"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Section Requirement */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Section / Kategori <span className="text-rose-400">*</span>
              </label>
              {availableSections.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        sectionMode:
                          prev.sectionMode === "select" ? "create" : "select",
                      }));
                    }}
                    className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                  >
                    {formData.sectionMode === "select"
                      ? "+ Buat Section Baru"
                      : "← Pilih Section Tersedia"}
                  </button>
                </div>
              )}
            </div>

            {/* Case 1: Input manual section baru */}
            {availableSections.length === 0 ||
            formData.sectionMode === "create" ? (
              <div>
                <input
                  type="text"
                  placeholder="Ketik nama Section baru (mis. Pekerjaan Struktur)..."
                  value={formData.sectionCustom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sectionCustom: e.target.value,
                    })
                  }
                  autoFocus
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490] focus:border-transparent"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Section ini akan otomatis tersimpan dan dapat digunakan
                  kembali untuk item BOQ lainnya.
                </p>
              </div>
            ) : (
              /* Case 2: Dropdown pilihan section */
              <div className="relative" ref={sectionDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSectionDropdownOpen((prev) => !prev)}
                  className="w-full min-h-10 text-left bg-slate-800 border border-slate-700 text-xs px-3 py-2 rounded-xl text-slate-100 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer"
                >
                  <span className="truncate font-medium">
                    {formData.sectionSelect || "Pilih Section / Kategori..."}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      isSectionDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isSectionDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-700 bg-slate-800/80">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Cari section..."
                          value={sectionFilterText}
                          onChange={(e) => setSectionFilterText(e.target.value)}
                          autoFocus
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0E7490]"
                        />
                      </div>
                    </div>

                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-700/50 py-1">
                      {filteredModalSections.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Section tidak ditemukan
                        </div>
                      ) : (
                        filteredModalSections.map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                sectionSelect: sec,
                              }));
                              setIsSectionDropdownOpen(false);
                              setSectionFilterText("");
                            }}
                            className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-700/50 transition cursor-pointer ${
                              formData.sectionSelect === sec
                                ? "bg-cyan-950/40 font-bold text-cyan-400"
                                : "text-slate-300"
                            }`}
                          >
                            <span>{sec}</span>
                            {formData.sectionSelect === sec && (
                              <Check className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {formErrors?.section && (
              <p className="text-xs text-rose-400 mt-1">{formErrors.section}</p>
            )}
          </div>

          {/* Item Code & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Item Code
              </label>
              <input
                type="text"
                placeholder="mis. STR-001"
                value={formData.itemCode}
                onChange={(e) =>
                  setFormData({ ...formData, itemCode: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E7490] cursor-pointer"
              >
                <option value="Draft" className="bg-slate-900 text-slate-100">
                  Draft
                </option>
                <option
                  value="Submitted"
                  className="bg-slate-900 text-slate-100"
                >
                  Submitted
                </option>
                <option
                  value="Approved"
                  className="bg-slate-900 text-slate-100"
                >
                  Approved
                </option>
                <option
                  value="Rejected"
                  className="bg-slate-900 text-slate-100"
                >
                  Rejected
                </option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Deskripsi Pekerjaan <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Rincian spesifikasi atau item pekerjaan..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
            {formErrors?.description && (
              <p className="text-xs text-rose-400 mt-1">
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Unit, Quantity, Unit Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Satuan (Unit) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="m2, unit, ls, kg"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              {formErrors?.unit && (
                <p className="text-xs text-rose-400 mt-1">{formErrors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              {formErrors?.quantity && (
                <p className="text-xs text-rose-400 mt-1">
                  {formErrors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Harga Satuan (Rp) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
              />
              {formErrors?.unitPrice && (
                <p className="text-xs text-rose-400 mt-1">
                  {formErrors.unitPrice}
                </p>
              )}
            </div>
          </div>

          {/* Real-time Calculated Total Price */}
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Harga (Otomatis)
              </span>
              <p className="text-[10px] text-slate-500">
                Quantity × Harga Satuan
              </p>
            </div>
            <div className="text-sm font-bold text-cyan-400 font-mono">
              {formatCurrency(modalCalculatedTotal)}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Catatan Tambahan
            </label>
            <input
              type="text"
              placeholder="Keterangan spesifikasi material / catatan teknis..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0E7490]"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0E7490] hover:bg-[#0c637a] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingItem ? "Simpan Perubahan" : "Tambah Item"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

//  Modal for confirming deletion of a BOQ Item
export const DeleteBOQModal = ({
  candidate,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 w-full max-w-md overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/50 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-900/50">
          <Trash2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-100 text-center">
          Hapus Item BOQ?
        </h4>
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 leading-relaxed">
          Item{" "}
          <strong className="text-slate-200">"{candidate.description}"</strong>{" "}
          akan dihapus secara permanen. Subtotal dan Grand Total akan dihitung
          ulang secara otomatis.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
};

//  Modal for Viewing details of a BOQ Item
export const DetailBOQModal = ({
  item,
  onClose,
  budgetByBOQItemIdMap = {},
  onOpenViewBudget,
  onOpenCreateBudget,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Detail BOQ Item</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Kode Item:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {item.itemCode || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Section/Category:</span>
              <span className="text-slate-200 font-medium">{item.section}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Deskripsi:</span>
              <span className="text-white font-medium text-right max-w-[260px]">
                {item.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volume & Satuan:</span>
              <span className="text-slate-200 font-mono">
                {item.quantity} {item.unit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Harga Satuan:</span>
              <span className="text-slate-200 font-mono">
                {formatCurrency(item.unitPrice)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/5 font-bold">
              <span className="text-cyan-400">Total Nilai BOQ:</span>
              <span className="text-cyan-300 font-mono text-sm">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          </div>

          {item.notes && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
              <span className="text-slate-400 font-semibold">Catatan:</span>
              <p className="text-slate-300">{item.notes}</p>
            </div>
          )}

          {/* Status Budget */}
          <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Status Alokasi Budget:</span>
            {budgetByBOQItemIdMap[item._id] ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tersedia ({budgetByBOQItemIdMap[item._id].budgetCode})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Belum Dibuat
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          {budgetByBOQItemIdMap[item._id] ? (
            <button
              type="button"
              onClick={() => {
                const b = budgetByBOQItemIdMap[item._id];
                onClose();
                onOpenViewBudget(b);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Lihat Budget Terkait</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateBudget(item);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Budget Sekarang</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

//  Modal for Contextual Create Budget from BOQ Item
export const CreateBudgetModal = ({
  item,
  onClose,
  budgetPlannedAmount,
  setBudgetPlannedAmount,
  budgetNotes,
  setBudgetNotes,
  budgetStatus,
  setBudgetStatus,
  onSubmit,
  isSubmitting,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Create Budget dari BOQ Item
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* BOQ Item (Otomatis terisi & readonly) */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>BOQ Item:</span>
              <span className="text-white font-semibold text-right">
                {item.description}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Section:</span>
              <span className="text-slate-200">{item.section}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-white/5 font-semibold">
              <span className="text-cyan-400">BOQ Value (Nilai Dasar):</span>
              <span className="text-cyan-300 font-mono text-sm">
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Planned Budget (IDR) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              placeholder="Misal: 500000000"
              value={budgetPlannedAmount}
              onChange={(e) => setBudgetPlannedAmount(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Catatan Alokasi (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Keterangan alokasi anggaran..."
              value={budgetNotes}
              onChange={(e) => setBudgetNotes(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              Status Awal
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="bStatus"
                  value="Draft"
                  checked={budgetStatus === "Draft"}
                  onChange={(e) => setBudgetStatus(e.target.value)}
                />
                <span>Save Draft</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="bStatus"
                  value="Submitted"
                  checked={budgetStatus === "Submitted"}
                  onChange={(e) => setBudgetStatus(e.target.value)}
                />
                <span>Submit untuk Approval</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Menyimpan..." : "Buat Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for Viewing related budget of a BOQ Item
export const ViewBudgetModal = ({ item, onClose, onNavigateToTab }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-base">
              Budget Terkait ({item.budgetCode})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">BOQ Item:</span>
            <span className="text-white font-medium text-right">
              {item.boqItem?.description}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">BOQ Value:</span>
            <span className="text-cyan-400 font-mono font-medium">
              {formatCurrency(item.boqValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Planned Budget:</span>
            <span className="text-purple-300 font-mono font-medium">
              {formatCurrency(item.plannedAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Approval Budget:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {formatCurrency(item.approvedAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Actual Cost (Approved):</span>
            <span className="text-amber-400 font-mono font-bold">
              {formatCurrency(item.actualCost)}
            </span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-white/5 font-bold">
            <span className="text-slate-300">Remaining Budget:</span>
            <span
              className={`font-mono text-sm ${
                item.remainingBudget < 0 ? "text-rose-400" : "text-blue-300"
              }`}
            >
              {formatCurrency(item.remainingBudget)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 text-xs">
          <span className="text-slate-400">Status:</span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {item.status}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTab("budget", {
                  focusBudgetId: item._id,
                });
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>Buka di Tab Budget</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
