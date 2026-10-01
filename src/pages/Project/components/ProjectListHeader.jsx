import React from "react";
import { Plus } from "lucide-react";

const ProjectListHeader = ({ onCreateProject }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 ">
      <div className="space-y-1">
        <h1
          className="text-[28px] font-bold tracking-tight text-white leading-tight"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Daftar Proyek
        </h1>
      </div>

      <button
        id="btn-create-project"
        onClick={onCreateProject}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#06B6D4] hover:bg-[#0891B2] text-white font-medium text-sm transition-all shadow-lg shadow-[#06B6D4]/25 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-2 focus:ring-offset-[#0B0E14] cursor-pointer shrink-0"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        <span>Buat Proyek Baru</span>
      </button>
    </header>
  );
};

export default ProjectListHeader;
