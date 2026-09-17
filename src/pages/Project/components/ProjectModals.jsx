import { AlertCircle, X } from "lucide-react";
import FormProject from "../Form";

export const ProjectFormModal = ({
  isOpen,
  project,
  onCloseRequest,
  onClose,
  onDirtyChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onCloseRequest}
        aria-hidden="true"
      />
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
          <h3 id="form-modal-title" className="font-bold text-lg">
            {project ? "Edit Proyek" : "Buat Proyek Baru"}
          </h3>
          <button
            onClick={onCloseRequest}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <FormProject
          project={project}
          onClose={onClose}
          onDirtyChange={onDirtyChange}
        />
      </div>
    </div>
  );
};

export const DeleteProjectModal = ({
  project,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 max-w-md w-full space-y-4">
        <div className="flex items-center gap-3 text-rose-400">
          <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 id="delete-modal-title" className="font-bold text-lg text-white">
            Konfirmasi Hapus
          </h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus
          proyek{" "}
          <strong className="text-white">&quot;{project.nama}&quot;</strong>?
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            autoFocus
            className="min-h-11 px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-white/10"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="min-h-11 px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 cursor-pointer"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              "Ya, Hapus Proyek"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
