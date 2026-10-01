import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderOpen,
  Trash2,
  X,
} from "lucide-react";
import { PROJECT_STATUS_STYLES } from "../projectListConstants";
import { formatProjectDate } from "../projectListUtils";

// ── Status badge ────────────────────────────────────────────────────────────
const STATUS_DARK = {
  draft: {
    dot: "bg-[#06B6D4]",
    text: "text-[#0891B2]",
    bg: "bg-[#ECFEFF] border-[#CFFAFE]",
    label: "Draft",
  },
  planning: {
    dot: "bg-violet-500",
    text: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    label: "Planning",
  },
  "in progress": {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Aktif",
  },
  "in-progress": {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Aktif",
  },
  aktif: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Aktif",
  },
  hold: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Hold",
  },
  review: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Review",
  },
  completed: {
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100 border-slate-200",
    label: "Selesai",
  },
  selesai: {
    dot: "bg-slate-400",
    text: "text-slate-600",
    bg: "bg-slate-100 border-slate-200",
    label: "Selesai",
  },
  cancelled: {
    dot: "bg-rose-500",
    text: "text-rose-600",
    bg: "bg-rose-50 border-rose-200",
    label: "Cancelled",
  },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();
  const def = STATUS_DARK[key];
  const fallback = def ? null : PROJECT_STATUS_STYLES[key];

  if (!def && !fallback) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-500 border border-[#E2E8F0]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {status || "-"}
      </span>
    );
  }

  // Fallback dari PROJECT_STATUS_STYLES (bisa berupa string class atau object)
  if (!def) {
    const isString = typeof fallback === "string";
    const cls = isString
      ? fallback
      : `${fallback.bg || "bg-slate-100 border-slate-200"} ${fallback.text || "text-slate-600"}`;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${cls}`}
      >
        {!isString && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${fallback.dot || "bg-slate-400"}`}
          />
        )}
        {(!isString && fallback.label) || status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border ${def.bg} ${def.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${def.dot}`} />
      {def.label}
    </span>
  );
};

// ── Photo preview modal ─────────────────────────────────────────────────────
const PhotoPreviewModal = ({ src, alt, onClose }) => {
  if (!src) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-[#E2E8F0] text-slate-500 hover:text-rose-500 shadow-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />
        {alt && (
          <p className="text-center text-white/90 text-sm font-medium mt-3">
            {alt}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
};

// ── Project letter avatar ───────────────────────────────────────────────────
const ProjectAvatar = ({ name }) => {
  const letter = name?.charAt(0)?.toUpperCase() || "P";
  const palettes = [
    "bg-[#ECFEFF] text-[#0891B2]",
    "bg-blue-50 text-blue-600",
    "bg-violet-50 text-violet-600",
    "bg-emerald-50 text-emerald-600",
    "bg-amber-50 text-amber-600",
    "bg-pink-50 text-pink-600",
  ];
  const idx = (name?.charCodeAt(0) || 0) % palettes.length;
  return (
    <div
      className={`w-10 h-10 rounded-xl ${palettes[idx]} flex items-center justify-center text-[15px] font-bold shrink-0 shadow-sm`}
    >
      {letter}
    </div>
  );
};

// ── PM Avatar ───────────────────────────────────────────────────────────────
const PmAvatar = ({ name, divisi, photo }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  if (!name) return <span className="text-slate-400 text-xs">-</span>;

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
  const photoUrl = photo ? `${API_BASE_URL}/uploads/users/${photo}` : null;

  return (
    <div className="flex items-center gap-2">
      {photoUrl ? (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="shrink-0 rounded-full cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/50"
        >
          <img
            src={photoUrl}
            alt={name}
            className="w-7 h-7 rounded-full object-cover border-2 border-[#E2E8F0]"
          />
        </button>
      ) : (
        <div className="w-7 h-7 rounded-full bg-[#ECFEFF] border border-[#CFFAFE] text-[#0891B2] flex items-center justify-center text-[10px] font-bold shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[12px] font-medium text-black truncate max-w-[100px]">
          {name}
        </div>
        {divisi && (
          <div className="text-[10px] text-gray-600 truncate max-w-[100px]">
            {divisi}
          </div>
        )}
      </div>
      {previewOpen && (
        <PhotoPreviewModal
          src={photoUrl}
          alt={name}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
};

// ── Klien & Vendor ──────────────────────────────────────────────────────────
const ProjectParties = ({ parties }) => {
  const clients = parties?.filter((p) => p.role === "client") || [];
  const vendors = parties?.filter((p) => p.role === "vendor") || [];
  if (!clients.length && !vendors.length)
    return (
      <span className="flex text-white text-xs justify-center ">Empty</span>
    );
  return (
    <div className="space-y-0.5">
      {[...clients, ...vendors].slice(0, 2).map((p) => (
        <div key={p._id} className="flex items-center gap-1.5">
          <Building2
            className={`w-3 h-3 shrink-0 ${p.role === "client" ? "text-[#0891B2]" : "text-slate-400"}`}
          />
          <span className="text-[12px] text-black truncate max-w-[110px]">
            {p.party?.name || "Empty"}
          </span>
        </div>
      ))}
      {parties?.length > 2 && (
        <div className="text-[11px] text-gray-600">
          +{parties.length - 2} lainnya
        </div>
      )}
    </div>
  );
};

// ── Sites ───────────────────────────────────────────────────────────────────
const SitesTags = ({ sites }) => {
  if (!sites?.length)
    return (
      <span className="flex text-white text-xs justify-center ">Empty</span>
    );
  const visible = sites.slice(0, 3);
  const extra = sites.length - 3;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((site, i) => (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-[#475569] bg-slate-100 border border-[#E2E8F0] uppercase tracking-widest"
        >
          {site}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] text-slate-500 bg-slate-50 border border-[#E2E8F0]">
          +{extra}
        </span>
      )}
    </div>
  );
};

// ── Timeline ────────────────────────────────────────────────────────────────
const Timeline = ({ startedAt, dueDate }) => {
  const start = formatProjectDate(startedAt);
  const end = formatProjectDate(dueDate);
  const isEmpty = (v) => !v || v === "-";
  if (isEmpty(start) && isEmpty(end))
    return (
      <span className="flex text-white text-xs justify-center ">Empty</span>
    );
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 text-[#0891B2] shrink-0" />
        <span className="text-[12px] text-black whitespace-nowrap">
          {start || "-"} – {end || "-"}
        </span>
      </div>
    </div>
  );
};

// ── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({
  project,
  onView,
  onOpenProject,
  onPrefetchDetail,
  onEdit,
  onDelete,
}) => (
  <div
    className="group relative flex items-center gap-4 px-5 py-4 text-black bg-white/40 shadow-xl rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    onMouseEnter={() => onPrefetchDetail?.(project)}
  >
    {/* Avatar */}
    <Calendar />
    {/* Nama Proyek — flex-1 agar menyerap ruang */}
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[13px] font-semibold text-black/90 leading-snug line-clamp-2 max-w-[220px]">
        {project.nama}
      </span>
      {project.kode && (
        <span className="text-[11px] text-slate-500 mt-0.5">
          ID: {project.kode}
        </span>
      )}
    </div>

    {/* Divider kolom — hidden di mobile, flex di ≥ lg */}
    <div className="hidden lg:flex items-center gap-6 shrink-0">
      {/* Status */}
      <div className="w-[100px] min-w-0">
        <StatusBadge status={project.status} />
      </div>

      {/* Project Manager */}
      <div className="w-[140px] min-w-0">
        <PmAvatar
          name={project.projectManager?.username}
          divisi={project.projectManager?.divisi}
          photo={project.projectManager?.photo}
        />
      </div>

      {/* Klien & Vendor */}
      <div className="w-[130px] min-w-0">
        <ProjectParties parties={project.parties} />
      </div>

      {/* Sites */}
      <div className="w-[90px] min-w-0">
        <SitesTags sites={project.sites} />
      </div>

      {/* Timeline */}
      <div className="w-40 min-w-0">
        <Timeline startedAt={project.startedAt} dueDate={project.dueDate} />
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-0.5 shrink-0 ml-auto pl-2">
      <button
        type="button"
        title="Buka Halaman Task Proyek"
        onClick={() =>
          onOpenProject ? onOpenProject(project) : onView(project)
        }
        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-white/50 transition-colors cursor-pointer"
      >
        <ArrowUpRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Lihat Detail & BOQ"
        onClick={() => onView(project)}
        className="p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-white/50 transition-colors cursor-pointer"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Edit Proyek"
        onClick={() => onEdit(project)}
        className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-white/50 transition-colors cursor-pointer"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Hapus Proyek"
        onClick={() => onDelete(project)}
        className="p-2 rounded-lg text-gray-700 hover:text-red-600 hover:bg-white/50 transition-colors cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// ── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex items-center gap-4 px-5 py-4 bg-white/40 shadow-xl rounded-2xl">
    <div className="w-10 h-10 rounded-xl bg-white/50 animate-pulse shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="w-48 h-3.5 bg-white/50 rounded animate-pulse" />
      <div className="w-24 h-2.5 bg-white/30 rounded animate-pulse" />
    </div>
    <div className="hidden lg:flex items-center gap-6">
      <div className="w-20 h-6 bg-white/50 rounded-lg animate-pulse" />
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/50 animate-pulse" />
        <div className="space-y-1.5">
          <div className="w-20 h-2.5 bg-white/50 rounded animate-pulse" />
          <div className="w-14 h-2 bg-white/30 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="w-24 h-2.5 bg-white/50 rounded animate-pulse" />
        <div className="w-18 h-2 bg-white/30 rounded animate-pulse" />
      </div>
      <div className="flex gap-1">
        <div className="w-10 h-5 bg-white/50 rounded animate-pulse" />
        <div className="w-10 h-5 bg-white/50 rounded animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="w-32 h-2.5 bg-white/50 rounded animate-pulse" />
        <div className="w-20 h-2 bg-white/30 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex items-center gap-1 ml-auto pl-2">
      <div className="w-8 h-8 bg-white/50 rounded-lg animate-pulse" />
      <div className="w-8 h-8 bg-white/50 rounded-lg animate-pulse" />
      <div className="w-8 h-8 bg-white/50 rounded-lg animate-pulse" />
    </div>
  </div>
);

export const ColumnHeaderBar = () => (
  <div className="hidden lg:flex items-center gap-4 px-5 pb-2 pt-2">
    {/* spacer avatar */}
    <div className="w-10 shrink-0" />
    {/* nama */}
    <div className="flex-1 text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
      Nama Proyek
    </div>
    {/* right cols */}
    <div className="flex items-center gap-6 shrink-0">
      <div className="w-[100px] text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
        Status
      </div>
      <div className="w-[140px] text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
        Project Manager
      </div>
      <div className="w-[130px] text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
        Klien & Vendor
      </div>
      <div className="w-[90px] text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
        Sites
      </div>
      <div className="w-40 text-[10px] font-semibold text-white uppercase tracking-[0.08em]">
        Timeline
      </div>
    </div>
    {/* spacer aksi */}
    <div className="w-[120px] text-[10px] font-semibold text-white uppercase tracking-[0.08em] pl-10">
      Aksi
    </div>
  </div>
);

// ── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({
  totalProjects,
  limit,
  page,
  totalPages,
  onPageChange,
}) => {
  const from = totalProjects === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalProjects);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <span className="text-[12px] text-gray-300">
        Menampilkan{" "}
        <span className="text-white font-semibold">
          {from}–{to}
        </span>{" "}
        dari <span className="text-white font-semibold">{totalProjects}</span>{" "}
        proyek
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="p-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p;
          if (totalPages <= 5) p = i + 1;
          else if (page <= 3) p = i + 1;
          else if (page >= totalPages - 2) p = totalPages - 4 + i;
          else p = page - 2 + i;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                p === page
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 border border-blue-400"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/30"
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(page + 1, totalPages))}
          className="p-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ── Main ProjectTable ────────────────────────────────────────────────────────
const ProjectTable = ({
  query,
  projects,
  hasActiveFilters,
  onResetFilters,
  onCreateProject,
  onViewProject,
  onOpenProject,
  onPrefetchDetail,
  onEditProject,
  onDeleteProject,
  totalProjects,
  limit,
  page,
  setPage,
  totalPages,
}) => {
  if (query.isLoading) {
    return (
      <section className="space-y-2">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="py-20 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-white font-semibold text-base">
          Gagal memuat data proyek
        </h3>
        <p className="text-[13px] text-gray-300 max-w-sm mx-auto">
          {query.error?.response?.data?.message ||
            query.error?.message ||
            "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda lalu coba lagi."}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm text-white font-medium border border-white/30 transition-colors shadow-sm"
        >
          Coba Lagi
        </button>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-20 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 shadow-md flex items-center justify-center mx-auto">
          <FolderOpen className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg">
          {hasActiveFilters ? "Proyek tidak ditemukan" : "Belum Ada Proyek"}
        </h3>
        <p className="text-[13px] text-gray-300 max-w-sm mx-auto">
          {hasActiveFilters
            ? "Coba hapus kata kunci pencarian atau reset filter."
            : "Mulai dengan membuat proyek pertama Anda."}
        </p>
        {hasActiveFilters ? (
          <button
            onClick={onResetFilters}
            className="px-5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm text-white font-medium border border-white/30 transition-colors shadow-sm"
          >
            Reset Filter
          </button>
        ) : (
          <button
            onClick={onCreateProject}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 text-sm text-white hover:bg-blue-600 font-medium shadow-lg shadow-blue-500/30 border border-blue-400 transition-colors"
          >
            + Buat Proyek Baru
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-2">
      {/* Card list */}
      <div className="space-y-2">
        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onView={onViewProject}
            onOpenProject={onOpenProject}
            onPrefetchDetail={onPrefetchDetail}
            onEdit={onEditProject}
            onDelete={onDeleteProject}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="pt-3">
        <Pagination
          totalProjects={totalProjects}
          limit={limit}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
};

export default ProjectTable;
