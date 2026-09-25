import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderOpen,
  MapPin,
  Trash2,
  X,
} from "lucide-react";
import { PROJECT_STATUS_STYLES } from "../projectListConstants";
import { formatProjectDate } from "../projectListUtils";

const StatusBadge = ({ status }) => {
  const def = PROJECT_STATUS_STYLES[status?.toLowerCase()];
  if (!def)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status || "-"}
      </span>
    );
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border ${def.style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {def.label}
    </span>
  );
};

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
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-[#475569] hover:text-rose-600 shadow-md flex items-center justify-center transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full max-h-[80vh] object-contain rounded-xl  shadow-2xl "
        />
        {alt && (
          <p className="text-center text-white text-sm font-medium mt-3">
            {alt}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
};

const PmAvatar = ({ name, divisi, photo }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (!name)
    return (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#94A3B8] text-xs">-</span>
      </div>
    );

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const photoUrl = photo ? `${API_BASE_URL}/uploads/users/${photo}` : null;

  return (
    <div className="flex items-center gap-2.5">
      {photoUrl ? (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          title="Lihat Foto"
          className="shrink-0 rounded-full cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#06B6D4] focus:ring-offset-1"
        >
          <img
            src={photoUrl}
            alt={name}
            className="w-7 h-7 rounded-full object-cover border border-[#CFFAFE]"
          />
        </button>
      ) : (
        <div className="w-7 h-7 rounded-full bg-[#ECFEFF] text-[#0891B2] flex items-center justify-center text-[10px] font-bold shrink-0 border border-[#CFFAFE]">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-[#0F172A] truncate max-w-[110px]">
          {name}
        </div>
        <div className="text-[11px] text-[#94A3B8]"> {divisi}</div>
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

const ProjectParties = ({ parties }) => {
  const clients = parties?.filter((p) => p.role === "client") || [];
  const vendors = parties?.filter((p) => p.role === "vendor") || [];
  if (!clients.length && !vendors.length)
    return (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#94A3B8] text-xs">-</span>
      </div>
    );
  return (
    <div className="space-y-1.5">
      {clients.map((p) => (
        <div key={p._id} className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 shrink-0 text-[#06B6D4]" />
          <span className="text-[12px] text-[#475569] truncate max-w-[130px]">
            {p.party?.name || "-"}
          </span>
        </div>
      ))}
      {vendors.map((p) => (
        <div key={p._id} className="flex items-center gap-1.5">
          <Building2 className="w-3 h-3 shrink-0 text-[#94A3B8]" />
          <span className="text-[12px] text-[#475569] truncate max-w-[130px]">
            {p.party?.name || "-"}
          </span>
        </div>
      ))}
    </div>
  );
};

const ScopeTags = ({ sites }) => {
  if (!sites?.length)
    return (
      <div className="flex items-center justify-center w-full">
        <span className="text-[#94A3B8] text-xs">-</span>
      </div>
    );
  const visible = sites.slice(0, 2);
  const extra = sites.length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((site, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] font-medium capitalize"
        >
          <MapPin className="w-2.5 h-2.5 text-[#94A3B8]" />
          {site}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] font-medium">
          +{extra}
        </span>
      )}
    </div>
  );
};

const Timeline = ({ startedAt, dueDate }) => {
  const start = formatProjectDate(startedAt);
  const end = formatProjectDate(dueDate);
  // Calculate days
  let days = null;
  if (startedAt && dueDate) {
    const diff = new Date(dueDate) - new Date(startedAt);
    days = Math.round(diff / (1000 * 60 * 60 * 24));
  }

  const isEmpty = (v) => !v || v === "-";

  if (isEmpty(start) && isEmpty(end)) {
    return (
      <div style={{ width: "100%", textAlign: "center" }}>
        <span className="text-[#94A3B8] text-xs font-extrabold">--</span>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3. h-3.5 text-[#06B6D4] shrink-0" />
        <span className="text-[12px] text-[#475569] whitespace-nowrap">
          {start || "-"} – {end || "-"}
        </span>
      </div>
      {days !== null && days > 0 && (
        <div className="text-[11px] text-[#94A3B8] pl-5">{days} hari</div>
      )}
    </div>
  );
};

const ProjectRow = ({ project, onView, onEdit, onDelete }) => (
  <tr className="group border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC] transition-colors duration-100">
    {/* Nama Proyek */}
    <td className="py-5 px-5 align-middle">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] border border-[#CFFAFE] flex items-center justify-center shrink-0">
          <FolderOpen className="w-4 h-4 text-[#0891B2]" />
        </div>
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onView(project)}
            className="text-left text-[13px] font-semibold text-[#0F172A] hover:text-[#0891B2] transition-colors cursor-pointer leading-tight"
            title="Lihat Detail & BOQ"
          >
            <span className="block truncate max-w-[200px]">{project.nama}</span>
          </button>
          {project.kode && (
            <span className="text-[11px] text-[#94A3B8] font-normal">
              {project.kode}
            </span>
          )}
        </div>
      </div>
    </td>

    {/* Status */}
    <td className="py-5 px-4 align-middle">
      <StatusBadge status={project.status} />
    </td>

    {/* Project Manager */}
    <td className="py-5 px-4 align-middle">
      <PmAvatar
        name={project.projectManager?.username}
        divisi={project.projectManager?.divisi}
        photo={project.projectManager?.photo}
      />
    </td>

    {/* Klien & Vendor */}
    <td className="py-5 px-4 align-middle">
      <ProjectParties parties={project.parties} />
    </td>

    {/* Scope */}
    <td className="py-5 px-4 align-middle">
      <ScopeTags sites={project.sites} />
    </td>

    {/* Timeline */}
    <td className="py-5 px-4 align-middle">
      <Timeline startedAt={project.startedAt} dueDate={project.dueDate} />
    </td>

    {/* Aksi */}
    <td className="py-5 px-4 align-middle">
      <div className="flex items-center gap-1">
        {/* View */}
        <button
          type="button"
          title="Lihat Detail & BOQ"
          onClick={() => onView(project)}
          className="p-2 rounded-lg text-[#475569] hover:text-[#0891B2] hover:bg-[#ECFEFF] transition-colors cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Edit */}
        <button
          type="button"
          title="Edit Proyek"
          onClick={() => onEdit(project)}
          className="p-2 rounded-lg text-[#475569] hover:text-[#0891B2] hover:bg-[#ECFEFF] transition-colors cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          type="button"
          title="Hapus Proyek"
          onClick={() => onDelete(project)}
          className="p-2 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

const SkeletonRow = () => (
  <tr className="border-b border-[#F1F5F9]">
    <td className="py-5 px-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="w-36 h-3.5 bg-[#F1F5F9] rounded animate-pulse" />
          <div className="w-16 h-2.5 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="py-5 px-4">
      <div className="w-20 h-6 bg-[#F1F5F9] rounded-md animate-pulse" />
    </td>
    <td className="py-5 px-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#F1F5F9] animate-pulse shrink-0" />
        <div className="space-y-1.5">
          <div className="w-24 h-3 bg-[#F1F5F9] rounded animate-pulse" />
          <div className="w-16 h-2.5 bg-[#F1F5F9] rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="py-5 px-4">
      <div className="space-y-1.5">
        <div className="w-28 h-3 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="w-24 h-3 bg-[#F1F5F9] rounded animate-pulse" />
      </div>
    </td>
    <td className="py-5 px-4">
      <div className="flex gap-1">
        <div className="w-16 h-5 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="w-8 h-5 bg-[#F1F5F9] rounded animate-pulse" />
      </div>
    </td>
    <td className="py-5 px-4">
      <div className="space-y-1.5">
        <div className="w-32 h-3 bg-[#F1F5F9] rounded animate-pulse" />
        <div className="w-12 h-2.5 bg-[#F1F5F9] rounded animate-pulse" />
      </div>
    </td>
    <td className="py-5 px-4">
      <div className="flex gap-1">
        <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-[#F1F5F9] rounded-lg animate-pulse" />
      </div>
    </td>
  </tr>
);

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
    <div className="px-5 py-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-4 text-[12px] text-[#475569]">
        <span>
          Menampilkan{" "}
          <span className="text-[#0F172A] font-semibold">
            {from}–{to}
          </span>{" "}
          dari{" "}
          <span className="text-[#0F172A] font-semibold">{totalProjects}</span>{" "}
          proyek
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {/* Page numbers */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p;
          if (totalPages <= 5) {
            p = i + 1;
          } else if (page <= 3) {
            p = i + 1;
          } else if (page >= totalPages - 2) {
            p = totalPages - 4 + i;
          } else {
            p = page - 2 + i;
          }
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                p === page
                  ? "bg-[#06B6D4] text-white border border-[#06B6D4]"
                  : "border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9]"
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
          className="p-2 rounded-lg border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const TABLE_HEADERS = [
  { key: "nama", label: "NAMA PROYEK" },
  { key: "status", label: "STATUS" },
  { key: "pm", label: "PROJECT MANAGER" },
  { key: "parties", label: "KLIEN & VENDOR" },
  { key: "scope", label: "SCOPE" },
  { key: "timeline", label: "TIMELINE" },
  { key: "aksi", label: "AKSI", center: true },
];

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
  <section className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
    {query.isLoading ? (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              {TABLE_HEADERS.map((h) => (
                <th
                  key={h.key}
                  className={`py-3.5 px-4 md:px-5 text-[11px] font-semibold text-[#94A3B8] tracking-[0.06em] whitespace-nowrap ${h.center ? "text-center" : "text-left"}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((n) => (
              <SkeletonRow key={n} />
            ))}
          </tbody>
        </table>
      </div>
    ) : query.isError ? (
      <div className="p-16 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-[#0F172A] font-semibold text-base">
          Gagal memuat data proyek
        </h3>
        <p className="text-[13px] text-[#475569] max-w-sm mx-auto">
          {query.error?.response?.data?.message ||
            query.error?.message ||
            "Terjadi kesalahan tak terduga. Periksa koneksi internet Anda lalu coba lagi."}
        </p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 min-h-10 px-5 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-sm text-[#0F172A] font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    ) : projects.length === 0 ? (
      <div className="p-16 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#ECFEFF] flex items-center justify-center mx-auto">
          <FolderOpen className="w-7 h-7 text-[#0891B2]" />
        </div>
        <h3 className="text-[#0F172A] font-semibold text-lg">
          {hasActiveFilters ? "Proyek tidak ditemukan" : "Belum Ada Proyek"}
        </h3>
        <p className="text-[13px] text-[#475569] max-w-sm mx-auto">
          {hasActiveFilters
            ? "Coba hapus kata kunci pencarian atau reset filter."
            : "Mulai dengan membuat proyek pertama Anda."}
        </p>
        {hasActiveFilters ? (
          <button
            onClick={onResetFilters}
            className="mt-2 min-h-10 px-5 py-2 rounded-xl bg-[#F1F5F9] text-sm text-[#475569] hover:bg-[#E2E8F0] font-medium transition-colors"
          >
            Reset Filter
          </button>
        ) : (
          <button
            onClick={onCreateProject}
            className="mt-2 inline-flex items-center gap-2 min-h-10 px-5 py-2 rounded-xl bg-[#06B6D4] text-sm text-white hover:bg-[#0891B2] font-medium transition-colors"
          >
            + Buat Proyek Baru
          </button>
        )}
      </div>
    ) : (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h.key}
                    className={`py-3.5 px-4 md:px-5 text-[11px] font-semibold text-[#94A3B8] tracking-[0.06em] whitespace-nowrap ${h.center ? "text-center" : "text-left"}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
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
          totalProjects={totalProjects}
          limit={limit}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </>
    )}
  </section>
);

export default ProjectTable;
