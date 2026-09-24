import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderKanban,
  MapPin,
  Receipt,
  Trash2,
  UserCheck,
} from "lucide-react";
import { PROJECT_STATUS_STYLES } from "../projectListConstants";
import { formatProjectDate } from "../projectListUtils";

const StatusBadge = ({ status }) => {
  const statusDefinition = PROJECT_STATUS_STYLES[status?.toLowerCase()];
  if (!statusDefinition)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-slate-100 text-slate-500 border-dashed border-slate-600">
        <AlertCircle className="w-3 h-3" />
        {status ? `Unknown: ${status}` : "Tanpa Status"}
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${statusDefinition.style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusDefinition.label}
    </span>
  );
};

const ProjectParties = ({ parties }) => {
  const clients = parties?.filter((party) => party.role === "client") || [];
  const vendors = parties?.filter((party) => party.role === "vendor") || [];
  if (!clients.length && !vendors.length)
    return <span className="text-slate-500">-</span>;
  const renderParty = (party, role, color) => (
    <div
      key={party._id}
      className="flex items-center gap-1.5 text-slate-600 truncate"
    >
      <Building2 className={`hidden md:block w-3 h-3 shrink-0 ${color}`} />
      <span className={`md:hidden ${color}`}>{role}:</span>
      <span className="truncate">{party.party?.name || "-"}</span>
    </div>
  );
  return (
    <div className="flex items-start gap-2 text-slate-500 md:block md:space-y-1">
      <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5 md:hidden" />
      <div className="space-y-1 min-w-0 md:space-y-1">
        {clients.map((party) =>
          renderParty(party, "Client", "text-emerald-400"),
        )}
        {vendors.map((party) => renderParty(party, "Vendor", "text-amber-400"))}
      </div>
    </div>
  );
};

const ProjectRow = ({ project, onView, onEdit, onDelete }) => (
  <tr className="block md:table-row p-4 md:p-0 space-y-3 md:space-y-0 hover:bg-slate-50 transition-colors group">
    <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4 font-semibold text-slate-900">
      <div className="flex items-start justify-between gap-2 md:block">
        <button
          type="button"
          onClick={() => onView(project)}
          className="text-left group-hover:text-[#0E7490] hover:underline transition-colors flex items-center gap-1.5 cursor-pointer min-w-0"
          title="Klik untuk melihat Detail & BOQ"
        >
          <span className="truncate md:max-w-[200px]">{project.nama}</span>
        </button>
        <div className="shrink-0 md:hidden">
          <StatusBadge status={project.status} />
        </div>
      </div>
    </td>
    <td className="hidden md:table-cell py-4 px-4">
      <StatusBadge status={project.status} />
    </td>
    {project.projectManager ? (
      <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4">
        <div className="flex items-center gap-1.5 text-slate-700">
          <UserCheck className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
          <span className="font-medium truncate md:max-w-[120px]">
            {project.projectManager.username}
          </span>
        </div>
      </td>
    ) : (
      <td className="hidden md:table-cell py-4 px-4">
        <span className="text-slate-500">-</span>
      </td>
    )}
    <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4 md:max-w-[180px]">
      <ProjectParties parties={project.parties} />
    </td>
    <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4">
      {project.sites?.length ? (
        <div className="flex flex-wrap items-center gap-1 md:gap-1.5 md:max-w-[200px]">
          {project.sites.map((site, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded text-[10px] md:text-[11px] text-slate-600 capitalize border border-slate-100 font-medium transition-colors"
            >
              <MapPin className="w-3 h-3 text-slate-500" />
              {site}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[10px] md:text-xs text-slate-500">-</span>
      )}
    </td>
    <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4 whitespace-nowrap md:text-slate-500">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Calendar className="w-3.5 h-3.5 text-[#0E7490] shrink-0" />
        <span>
          {formatProjectDate(project.startedAt)} –{" "}
          {formatProjectDate(project.dueDate)}
        </span>
      </div>
    </td>
    <td className="block md:table-cell py-0 md:py-4 px-0 md:px-4 md:text-center pt-2 md:pt-4 border-t border-slate-100 md:border-t-0">
      <div className="flex items-center justify-end md:justify-center gap-2 md:gap-1">
        <button
          type="button"
          title="Lihat Detail & BOQ"
          onClick={() => onView(project)}
          className="min-h-11 md:min-h-0 px-3 md:px-0 py-1.5 md:p-2 rounded-lg bg-[#0E7490]/20 md:bg-transparent text-cyan-300 hover:bg-[#0E7490]/30 md:hover:bg-[#0E7490]/20 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Receipt className="hidden md:block w-4 h-4" />
          <Eye className="w-3.5 h-3.5 md:hidden" />
          <span className="md:hidden">Detail & BOQ</span>
        </button>
        <button
          type="button"
          title="Edit Proyek"
          onClick={() => onEdit(project)}
          className="min-h-11 md:min-h-0 px-3 md:px-0 py-1.5 md:p-2 rounded-lg bg-slate-100 md:bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200 md:hover:bg-amber-500/10 md:hover:text-amber-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="md:hidden">Edit</span>
        </button>
        <button
          type="button"
          title="Hapus Proyek"
          onClick={() => onDelete(project)}
          className="min-h-11 md:min-h-0 px-3 md:px-0 py-1.5 md:p-2 rounded-lg bg-rose-50 md:bg-transparent text-rose-600 hover:bg-rose-100 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span className="md:hidden">Hapus</span>
        </button>
      </div>
    </td>
  </tr>
);

const Pagination = ({
  projectCount,
  totalProjects,
  limit,
  onLimitChange,
  page,
  totalPages,
  onPageChange,
}) => (
  <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
    <div className="flex items-center gap-3">
      <span>
        Menampilkan{" "}
        <span className="text-slate-900 font-medium">{projectCount}</span> dari{" "}
        <span className="text-slate-900 font-medium">{totalProjects}</span> total
        proyek.
      </span>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 pl-3 border-l border-slate-200">
        <span>Baris per hal:</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="bg-white text-slate-700 border border-slate-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-[#0E7490] cursor-pointer"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:text-slate-600 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        title="Halaman Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-slate-700 font-medium px-2">
        Hal {page} dari {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        className="p-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:text-slate-600 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors"
        title="Halaman Selanjutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const ProjectTable = ({
  query,
  projects,
  hasActiveFilters,
  onResetFilters,
  onCreateProject,
  onViewProject,
  onEditProject,
  onDeleteProject,
  totalProjects,
  limit,
  setLimit,
  page,
  setPage,
  totalPages,
}) => (
  <main className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/[0.04]">
    {query.isLoading ? (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="h-16 w-full bg-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    ) : query.isError ? (
      <div className="p-12 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-slate-900 font-medium text-base">
          Gagal memuat data proyek
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {query.error?.response?.data?.message ||
            query.error?.message ||
            "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda lalu coba lagi."}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-900 font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    ) : projects.length === 0 ? (
      <div className="p-12 text-center space-y-3">
        <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-slate-700 font-medium text-base">
          {hasActiveFilters ? "Proyek tidak ditemukan" : "Belum ada proyek"}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {hasActiveFilters
            ? "Coba hapus kata kunci pencarian atau reset filter."
            : "Buat proyek pertama untuk mulai memantau progres tim."}
        </p>
        {hasActiveFilters ? (
          <button
            onClick={onResetFilters}
            className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 font-medium transition-colors"
          >
            Reset Filter
          </button>
        ) : (
          <button
            onClick={onCreateProject}
            className="mt-2 min-h-10 px-4 py-2 rounded-lg bg-[#0E7490] text-xs text-white hover:bg-[#155e75] font-medium transition-colors"
          >
            + Buat Proyek
          </button>
        )}
      </div>
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 block md:table">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200">
              <tr className="md:table-row">
                {[
                  "Nama Proyek",
                  "Status",
                  "Project Manager",
                  "Klien & Vendor",
                  "Scope",
                  "Timeline",
                ].map((heading) => (
                  <th key={heading} className="py-3.5 px-4">
                    {heading}
                  </th>
                ))}
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group divide-y divide-slate-100 md:divide-y">
              {projects.map((project) => (
                <ProjectRow
                  key={project._id}
                  project={project}
                  onView={onViewProject}
                  onEdit={onEditProject}
                  onDelete={onDeleteProject}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          projectCount={projects.length}
          totalProjects={totalProjects}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    )}
  </main>
);

export default ProjectTable;