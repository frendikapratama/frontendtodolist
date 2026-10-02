import React from "react";
import { X } from "lucide-react";
import FormProject from "../Form";

const ProjectDetailEditModal = ({
  isOpen,
  project,
  onClose,
  onDirtyChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 relative z-10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800">
          <h3
            className="font-bold text-lg text-slate-100"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Edit Proyek
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup Form Edit"
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

export default ProjectDetailEditModal;
