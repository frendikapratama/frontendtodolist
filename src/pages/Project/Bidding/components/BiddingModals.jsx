import React, { useState, useEffect } from "react";
import { Gavel, Search, Trash2, X } from "lucide-react";
import { currency } from "../biddingUtils";

/**
 * MODAL: CREATE BIDDING
 */
export function CreateBiddingModal({
  isOpen,
  onClose,
  title,
  setTitle,
  desc,
  setDesc,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Buat Bidding Baru
            </h3>
            <p className="text-xs text-slate-400">
              Mulai pengadaan dan perbandingan harga supplier
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Pengadaan / Paket Pekerjaan{" "}
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengadaan Material Struktur Besi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deskripsi / Lingkup Pekerjaan (Opsional)
            </label>
            <textarea
              rows={3}
              placeholder="Tuliskan catatan kebutuhan pengadaan..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Membuat..." : "Buat Bidding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * MODAL: DELETE CONFIRMATION
 */
export function DeleteBiddingModal({
  candidate,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="rounded-full bg-rose-950/60 p-2.5 border border-rose-800/60">
            <Trash2 size={20} />
          </div>
          <h3 className="text-base font-bold text-white">Hapus Bidding?</h3>
        </div>
        <p className="text-xs text-slate-400">
          Apakah Anda yakin ingin menghapus bidding{" "}
          <strong>"{candidate.title}"</strong>? Tindakan ini tidak dapat
          dibatalkan.
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MODAL: CONFIRM FINISH BIDDING
 */
export function FinishBiddingModal({
  isOpen,
  onClose,
  onConfirm,
  isFinishing,
  itemCount,
  total,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cyan-950 p-2.5 text-cyan-400 border border-cyan-800/60">
            <Gavel size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Selesaikan Bidding?
            </h3>
            <p className="text-xs text-slate-400">
              Konfirmasi finalisasi pengadaan
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs text-amber-200/90 leading-relaxed">
          Setelah bidding selesai, data quotation dan supplier terpilih tidak
          dapat diubah kembali.
        </div>

        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Item:</span>
            <span className="font-semibold text-white">
              {itemCount} Item BOQ
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Bidding:</span>
            <span className="font-bold text-cyan-400">{currency(total)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isFinishing}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isFinishing}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
          >
            {isFinishing ? "Menyelesaikan..." : "Selesaikan Bidding"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * MODAL: BOQ ITEM PICKER
 */
export function BOQItemPickerModal({
  isOpen,
  onClose,
  boqItems = [],
  boqSections = [],
  selectedBoqIds = [],
  setSelectedBoqIds,
  boqSearch = "",
  setBoqSearch,
  boqSection = "",
  setBoqSection,
  onSave,
  isUpdating,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">
              Pilih Item BOQ Pengadaan
            </h3>
            <p className="text-xs text-slate-400">
              Centang item BOQ yang ingin dimasukkan ke dalam Bidding ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari deskripsi atau kode item BOQ..."
            value={boqSearch}
            onChange={(e) => setBoqSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="bidding-boq-section"
            className="text-xs text-slate-300"
          >
            Pilih section BOQ:
          </label>
          <select
            id="bidding-boq-section"
            value={boqSection}
            onChange={(e) => setBoqSection(e.target.value)}
            className="min-w-48 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="">Pilih satu section...</option>
            {boqSections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!boqSection}
            onClick={() => {
              setSelectedBoqIds(
                boqItems
                  .filter((item) => item.section === boqSection)
                  .map((item) => String(item._id)),
              );
              setBoqSearch("");
            }}
            className="rounded-lg border border-cyan-700/70 bg-cyan-950/50 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Pilih seluruh section
          </button>
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800">
          {boqItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Tidak ada item BOQ tersedia di project ini.
            </div>
          ) : (
            boqItems
              .filter((item) => {
                if (boqSection && item.section !== boqSection) return false;
                if (!boqSearch) return true;
                const text =
                  `${item.itemCode || ""} ${item.description || ""} ${
                    item.specification || ""
                  }`.toLowerCase();
                return text.includes(boqSearch.toLowerCase());
              })
              .map((item) => {
                const isChecked = selectedBoqIds.includes(String(item._id));
                return (
                  <label
                    key={item._id}
                    className={`flex items-start gap-3 p-3 text-xs cursor-pointer transition ${
                      isChecked
                        ? "bg-cyan-950/30 text-white"
                        : "hover:bg-slate-800/40 text-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedBoqIds((prev) => {
                          const idStr = String(item._id);
                          return prev.includes(idStr)
                            ? prev.filter((id) => id !== idStr)
                            : [...prev, idStr];
                        });
                      }}
                      className="mt-1 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          {item.description}
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      {item.specification && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {item.specification}
                        </p>
                      )}
                      {item.itemCode && (
                        <span className="inline-block mt-1 text-[10px] text-slate-500 font-mono">
                          Kode: {item.itemCode}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            {selectedBoqIds.length} item dipilih
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isUpdating || !selectedBoqIds.length}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {isUpdating ? "Menyimpan..." : "Terapkan Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MODAL: DETAIL QUOTATION (LeadTime, PaymentTerm, Notes)
 */
export function QuoteDetailModal({ modalData, onClose, onSave }) {
  const [localData, setLocalData] = useState({
    leadTime: "",
    paymentTerm: "",
    notes: "",
  });

  useEffect(() => {
    if (modalData) {
      setLocalData({
        leadTime: modalData.leadTime || "",
        paymentTerm: modalData.paymentTerm || "",
        notes: modalData.notes || "",
      });
    }
  }, [modalData]);

  if (!modalData) return null;

  const handleSave = () => {
    onSave(modalData.itemIndex, modalData.supplierId, localData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Detail Penawaran</h3>
            <p className="text-xs text-slate-400">
              Supplier: {modalData.supplierName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Lead Time (Waktu Pengiriman)
            </label>
            <input
              type="text"
              placeholder="Contoh: 7 hari kerja"
              value={localData.leadTime}
              onChange={(e) =>
                setLocalData((prev) => ({ ...prev, leadTime: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Syarat Pembayaran (Payment Term)
            </label>
            <input
              type="text"
              placeholder="Contoh: DP 30%, Pelunasan 30 hari"
              value={localData.paymentTerm}
              onChange={(e) =>
                setLocalData((prev) => ({
                  ...prev,
                  paymentTerm: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              rows={3}
              placeholder="Catatan spesifikasi, garansi, atau diskon..."
              value={localData.notes}
              onChange={(e) =>
                setLocalData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
          >
            Simpan Detail
          </button>
        </div>
      </div>
    </div>
  );
}
