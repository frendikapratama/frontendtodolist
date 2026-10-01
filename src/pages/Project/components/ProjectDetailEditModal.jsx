import React from "react";
import { X } from "lucide-react";
import FormProject from "../Form";

const ProjectDetailEditModal = ({ isOpen, project, onClose, onDirtyChange }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white text-[#0F172A] rounded-2xl shadow-2xl border border-[#E2E8F0] relative z-10 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#E2E8F0]">
          <h3
            className="font-bold text-lg text-[#0F172A]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Edit Proyek
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
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
