import React from "react";
import { AlertCircle, X } from "lucide-react";

/**
 * Generic delete confirmation modal.
 * @param {{ isOpen, onClose, onConfirm, title, description, isLoading, confirmLabel }} props
 */
const ConfirmDeleteModal = React.memo(
  ({
    isOpen,
    onClose,
    onConfirm,
    title = "Hapus Item",
    description = "Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan.",
    isLoading = false,
    confirmLabel = "Ya, Hapus",
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">{title}</h3>
          </div>
          <p className="text-xs text-slate-300">{description}</p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Menghapus..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ConfirmDeleteModal.displayName = "ConfirmDeleteModal";

export default ConfirmDeleteModal;
