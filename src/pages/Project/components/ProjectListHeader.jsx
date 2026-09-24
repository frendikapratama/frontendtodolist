import { createElement } from "react";
import { AlertCircle, Briefcase, Clock, Plus } from "lucide-react";

const metricDefinitions = [
  {
    label: "Total Proyek",
    description: "Semua portofolio",
    icon: Briefcase,
    colorClass: "bg-cyan-50 text-[#0E7490] border-cyan-100",
    getValue: (summary) => summary.total || 0,
  },
  {
    label: "Proyek Aktif",
    description: "In Progress & Planning",
    icon: Clock,
    colorClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    getValue: (summary) =>
      (summary["in progress"] || 0) + (summary.planning || 0),
  },
  {
    label: "Perlu Perhatian",
    description: "Hold & Status Draft",
    icon: AlertCircle,
    colorClass: "bg-amber-50 text-amber-700 border-amber-100",
    getValue: (summary) => (summary.hold || 0) + (summary.draft || 0),
  },
];

const ProjectListHeader = ({ summary, onCreateProject }) => (
  <>
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Daftar Proyek
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pantau progres, alokasi tim, dan tenggat waktu seluruh proyek aktif.
        </p>
      </div>
      <button
        className="min-h-11 px-5 py-2.5 rounded-xl bg-[#0E7490] hover:bg-[#155e75] font-medium text-sm text-white transition-all shadow-md shadow-cyan-900/10 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
        onClick={onCreateProject}
      >
        <Plus className="w-4 h-4" />
        <span>Buat Proyek Baru</span>
      </button>
    </header>
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {metricDefinitions.map(({ icon: Icon, getValue, ...metric }) => (
        <div
          key={metric.label}
          className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm shadow-slate-900/[0.03]"
        >
          <div className={`p-3 rounded-xl border ${metric.colorClass}`}>
            {createElement(Icon, { className: "w-5 h-5" })}
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-900">
                {getValue(summary)}
              </p>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {metric.description}
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  </>
);

export default ProjectListHeader;
