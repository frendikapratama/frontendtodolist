import { createElement } from "react";
import { AlertCircle, Briefcase, Clock, Plus } from "lucide-react";

const metricDefinitions = [
  {
    label: "Total Proyek",
    description: "Semua portofolio",
    icon: Briefcase,
    colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    getValue: (summary) => summary.total || 0,
  },
  {
    label: "Proyek Aktif",
    description: "In Progress & Planning",
    icon: Clock,
    colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    getValue: (summary) =>
      (summary["in progress"] || 0) + (summary.planning || 0),
  },
  {
    label: "Perlu Perhatian",
    description: "Hold & Status Draft",
    icon: AlertCircle,
    colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    getValue: (summary) => (summary.hold || 0) + (summary.draft || 0),
  },
];

const ProjectListHeader = ({ summary, onCreateProject }) => (
  <>
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/10">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Daftar Proyek
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Pantau progres, alokasi tim, dan tenggat waktu seluruh proyek aktif.
        </p>
      </div>
      <button
        className="min-h-11 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          className="bg-slate-900/80 border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-sm"
        >
          <div className={`p-3 rounded-xl border ${metric.colorClass}`}>
            {createElement(Icon, { className: "w-5 h-5" })}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{metric.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-white">
                {getValue(summary)}
              </p>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
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
