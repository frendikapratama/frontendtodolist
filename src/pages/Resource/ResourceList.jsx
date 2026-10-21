import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  Check,
  ChevronDown,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createResource,
  deleteResource,
  getResources,
  updateResource,
} from "../../services/resource";
import ActionDropdownPortal from "../../components/shared/ActionDropdownPortal";

const EMPTY_FORM = {
  name: "",
  code: "",
  category: "Material",
  unit: "",
  description: "",
  estimatedPrice: "",
  brand: "",
  technicalSpecs: "",
};
const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500";
const categories = ["Material", "Manpower", "Equipment"];

const ResourceList = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewing, setViewing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeStatusMenuId, setActiveStatusMenuId] = useState(null);

  // Debounce search input to reduce query frequency
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);



  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (
        !event.target.closest?.("[data-action-menu-portal]") &&
        !event.target.closest?.("[data-resource-status-trigger]")
      )
        setActiveStatusMenuId(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const resourceQuery = useQuery({
    queryKey: ["resources", debouncedSearch, category, status],
    queryFn: () => getResources({ search: debouncedSearch, category, status }),
  });
  const resources = resourceQuery.data || [];
  const summary = useMemo(
    () =>
      categories.reduce(
        (acc, key) => ({
          ...acc,
          [key]: resources.filter(
            (resource) =>
              resource.category === key && resource.status === "Active",
          ).length,
        }),
        {},
      ),
    [resources],
  );
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      const normalized = {
        ...payload,
        estimatedPrice:
          payload.estimatedPrice === "" ? null : Number(payload.estimatedPrice),
      };
      return editing
        ? updateResource(editing._id, normalized)
        : createResource(normalized);
    },
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      closeForm();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Gagal menyimpan resource"),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Resource tidak dapat dihapus",
      ),
  });
  const toggleMutation = useMutation({
    mutationFn: ({ id, nextStatus }) =>
      updateResource(id, { status: nextStatus }),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Gagal mengubah status resource",
      ),
  });
  const openEdit = (resource) => {
    setEditing(resource);
    setForm({
      name: resource.name || "",
      code: resource.code || "",
      category: resource.category || "Material",
      unit: resource.unit || "",
      description: resource.description || "",
      estimatedPrice: resource.estimatedPrice ?? "",
      brand: resource.brand || "",
      technicalSpecs: resource.technicalSpecs || "",
    });
    setShowForm(true);
  };
  const changeStatus = (resource, nextStatus) => {
    setActiveStatusMenuId(null);
    if (resource.status !== nextStatus) {
      toggleMutation.mutate({ id: resource._id, nextStatus });
    }
  };

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
            <Package />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resource List</h1>
            <p className="text-sm text-slate-400">
              Master data material, manpower, dan equipment.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500"
        >
          <Plus size={16} />
          Tambah Resource
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {categories.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {item} Aktif
            </p>
            <p className="mt-1 text-xl font-bold">{summary[item] || 0}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:items-center">
          {/* Kotak Pencarian */}
          <label className="relative block w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              className={`${inputClass} w-full pl-9`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, kode, deskripsi..."
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </label>

          {/* Filter Kategori */}
          <select
            className={`${inputClass} w-full`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Semua Kategori</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            className={`${inputClass} w-full`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/20">
          <table className="w-full min-w-[850px] table-fixed text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                {[
                  "Kode",
                  "Nama Resource",
                  "Kategori",
                  "Unit",
                  "Status",
                  "Aksi",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-5 py-4 font-semibold ${
                      heading === "Aksi" ? "text-center" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {resourceQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Memuat resource...
                  </td>
                </tr>
              ) : resourceQuery.isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-rose-300"
                  >
                    Gagal memuat daftar resource. Coba muat ulang halaman.
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400"
                  >
                    Belum ada resource yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr
                    key={resource._id}
                    className="transition-colors duration-150 hover:bg-white/4"
                  >
                    <td className="px-5 py-4 align-middle">
                      <span
                        className="block truncate font-mono text-xs font-medium text-cyan-300"
                        title={resource.code}
                      >
                        {resource.code || "-"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div
                        className="truncate font-semibold text-white"
                        title={resource.name}
                      >
                        {resource.name}
                      </div>
                      <div
                        className="mt-1 truncate text-xs text-slate-400"
                        title={
                          resource.description || resource.technicalSpecs || ""
                        }
                      >
                        {resource.description || resource.technicalSpecs || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex max-w-full truncate rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {resource.category}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle text-slate-300">
                      {resource.unit || "-"}
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="relative flex justify-start">
                        <button
                          type="button"
                          data-resource-status-trigger
                          id={`resource-status-${resource._id}`}
                          aria-expanded={activeStatusMenuId === resource._id}
                          onClick={() =>
                            setActiveStatusMenuId((current) =>
                              current === resource._id ? null : resource._id,
                            )
                          }
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition hover:brightness-110 ${
                            resource.status === "Active"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-slate-300 bg-slate-100 text-slate-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              resource.status === "Active"
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />

                          {resource.status}

                          <ChevronDown className="h-3 w-3 opacity-70" />
                        </button>
                        {activeStatusMenuId === resource._id && (
                          <ActionDropdownPortal
                            anchorId={`resource-status-${resource._id}`}
                            width={144}
                            className="w-36 rounded-xl border border-white/10 bg-slate-900 py-1 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                          >
                            {["Active", "Inactive"].map((nextStatus) => {
                              const selected = resource.status === nextStatus;

                              return (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  onClick={() =>
                                    changeStatus(resource, nextStatus)
                                  }
                                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs transition hover:bg-slate-800 ${
                                    selected
                                      ? "font-semibold text-white"
                                      : "text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${
                                      nextStatus === "Active"
                                        ? "bg-emerald-400"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  <span>{nextStatus}</span>
                                  {selected && (
                                    <Check className="ml-auto h-3.5 w-3.5 text-cyan-400" />
                                  )}
                                </button>
                              );
                            })}
                          </ActionDropdownPortal>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Detail"
                          aria-label={`Detail ${resource.name}`}
                          onClick={() => setViewing(resource)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${resource.name}`}
                          onClick={() => openEdit(resource)}
                          className="rounded-lg p-2 text-cyan-300 transition hover:bg-cyan-500/10"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Hapus"
                          aria-label={`Hapus ${resource.name}`}
                          onClick={() =>
                            window.confirm(
                              `Hapus resource ${resource.name}?`,
                            ) && deleteMutation.mutate(resource._id)
                          }
                          className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeForm()
          }
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveMutation.mutate(form);
            }}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Edit Resource" : "Resource Baru"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-slate-400">
                Nama Resource *
                <input
                  required
                  maxLength="160"
                  className={inputClass}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Kode Unik *
                <input
                  required
                  maxLength="40"
                  className={inputClass}
                  value={form.code}
                  onChange={(event) =>
                    setForm({ ...form, code: event.target.value.toUpperCase() })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Kategori *
                <select
                  className={inputClass}
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Unit *
                <input
                  required
                  maxLength="40"
                  className={inputClass}
                  placeholder="pcs, kg, m², jam, orang"
                  value={form.unit}
                  onChange={(event) =>
                    setForm({ ...form, unit: event.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Harga Estimasi
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.estimatedPrice}
                  onChange={(event) =>
                    setForm({ ...form, estimatedPrice: event.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400">
                Merek
                <input
                  className={inputClass}
                  value={form.brand}
                  onChange={(event) =>
                    setForm({ ...form, brand: event.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400 sm:col-span-2">
                Deskripsi
                <textarea
                  rows="2"
                  className={inputClass}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              <label className="space-y-1 text-xs text-slate-400 sm:col-span-2">
                Spesifikasi Teknis
                <textarea
                  rows="2"
                  className={inputClass}
                  value={form.technicalSpecs}
                  onChange={(event) =>
                    setForm({ ...form, technicalSpecs: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300"
              >
                Batal
              </button>
              <button
                disabled={saveMutation.isPending}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setViewing(null)
          }
        >
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Detail Resource</h2>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <p className="text-xl font-semibold">{viewing.name}</p>
              <p className="font-mono text-sm text-cyan-300">{viewing.code}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <p>
                <span className="block text-xs text-slate-400">Kategori</span>
                {viewing.category}
              </p>
              <p>
                <span className="block text-xs text-slate-400">Unit</span>
                {viewing.unit}
              </p>
              <p>
                <span className="block text-xs text-slate-400">Status</span>
                {viewing.status}
              </p>
              <p>
                <span className="block text-xs text-slate-400">Merek</span>
                {viewing.brand || "-"}
              </p>
              <p>
                <span className="block text-xs text-slate-400">
                  Harga estimasi
                </span>
                {viewing.estimatedPrice
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(viewing.estimatedPrice)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Deskripsi</p>
              <p className="text-sm">{viewing.description || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Spesifikasi Teknis</p>
              <p className="whitespace-pre-wrap text-sm">
                {viewing.technicalSpecs || "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceList;
