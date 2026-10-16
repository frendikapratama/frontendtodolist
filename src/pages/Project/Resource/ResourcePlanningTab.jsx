import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { getBOQByProject } from "../../../services/boq";
import {
  createResourcePlanning,
  deleteResourcePlanning,
  getResources,
  getResourcePlanning,
  updateResourcePlanning,
} from "../../../services/resource";
import ActionDropdownPortal from "../../../components/shared/ActionDropdownPortal";

const EMPTY_FORM = {
  resource: "",
  boqItem: "",
  plannedQuantity: "",
  plannedStartDate: "",
  plannedEndDate: "",
  notes: "",
};
const inputClass =
  "w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500";
const dateValue = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const ResourcePlanningTab = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [activeStatusMenuId, setActiveStatusMenuId] = useState(null);
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
  const planningQuery = useQuery({
    queryKey: ["resource-planning", projectId],
    queryFn: () => getResourcePlanning(projectId),
    enabled: !!projectId,
  });
  const resourcesQuery = useQuery({
    queryKey: ["resources", "active"],
    queryFn: () => getResources({ status: "Active" }),
  });
  const boqQuery = useQuery({
    queryKey: ["resource-planning-boq", projectId],
    queryFn: () => getBOQByProject(projectId, { limit: 200 }),
    enabled: !!projectId,
  });
  const plans = planningQuery.data?.data || [];
  const resources = resourcesQuery.data || [];
  const boqItems = useMemo(
    () =>
      boqQuery.data?.sections?.flatMap((section) => section.items || []) || [],
    [boqQuery.data],
  );
  const summaries = planningQuery.data?.summary || {};
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };
  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateResourcePlanning(projectId, editing._id, form)
        : createResourcePlanning(projectId, form),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["resource-planning", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      closeForm();
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Gagal menyimpan perencanaan resource",
      ),
  });
  const deleteMutation = useMutation({
    mutationFn: (planId) => deleteResourcePlanning(projectId, planId),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["resource-planning", projectId],
      });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Gagal menghapus perencanaan",
      ),
  });
  const statusMutation = useMutation({
    mutationFn: ({ planId, status }) =>
      updateResourcePlanning(projectId, planId, { status }),
    onSuccess: (result) => {
      toast.success(result.message);
      queryClient.invalidateQueries({
        queryKey: ["resource-planning", projectId],
      });
      setActiveStatusMenuId(null);
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Gagal mengubah status perencanaan",
      ),
  });
  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      resource: plan.resource?._id || "",
      boqItem: plan.boqItem?._id || "",
      plannedQuantity: plan.plannedQuantity,
      plannedStartDate: dateValue(plan.plannedStartDate),
      plannedEndDate: dateValue(plan.plannedEndDate),
      notes: plan.notes || "",
    });
    setShowForm(true);
  };
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  return (
    <div className="space-y-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
            <ClipboardList />
          </div>
          <div>
            <h2 className="text-xl font-bold">Resource Planning</h2>
            <p className="text-sm text-slate-400">
              Rencanakan kebutuhan resource untuk proyek ini, dengan BOQ jika
              relevan.
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold hover:bg-cyan-500"
        >
          <Plus size={16} />
          Tambah Perencanaan
        </button>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["Material", "Manpower", "Equipment"].map((category) => (
          <div
            key={category}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {category}
            </p>
            <p className="mt-1 text-xl font-bold">
              {summaries[category] || 0}
              <span className="ml-2 text-xs font-normal text-slate-400">
                perencanaan
              </span>
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                {[
                  "Resource",
                  "BOQ Item / Alokasi",
                  "Kuantitas",
                  "Periode",
                  "Catatan",
                  "Status",
                  "Aksi",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {planningQuery.isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Memuat perencanaan...
                  </td>
                </tr>
              ) : planningQuery.isError ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-rose-300">
                    Gagal memuat perencanaan resource.
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-slate-400">
                    Belum ada resource yang direncanakan untuk proyek ini.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-white/3">
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {plan.resource?.name || "Resource dihapus"}
                      </div>
                      <div className="text-xs text-cyan-300">
                        {plan.resource?.code || "-"} ·{" "}
                        {plan.resource?.category || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {plan.boqItem ? (
                        <>
                          <div className="max-w-xs truncate">
                            {plan.boqItem.description}
                          </div>
                          <div className="text-xs text-slate-400">
                            {plan.boqItem.itemCode ||
                              plan.boqItem.section ||
                              "BOQ"}
                          </div>
                        </>
                      ) : (
                        <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
                          Alokasi tingkat proyek
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {new Intl.NumberFormat("id-ID", {
                        maximumFractionDigits: 3,
                      }).format(plan.plannedQuantity)}{" "}
                      {plan.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      {plan.plannedStartDate || plan.plannedEndDate ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={13} />
                          {dateValue(plan.plannedStartDate) || "-"} –{" "}
                          {dateValue(plan.plannedEndDate) || "-"}
                        </span>
                      ) : (
                        "Tidak dijadwalkan"
                      )}
                    </td>
                    <td className="max-w-48 truncate px-4 py-3 text-slate-400">
                      {plan.notes || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        data-resource-status-trigger
                        id={`resource-planning-status-${plan._id}`}
                        aria-expanded={activeStatusMenuId === plan._id}
                        onClick={() =>
                          setActiveStatusMenuId((current) =>
                            current === plan._id ? null : plan._id,
                          )
                        }
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition hover:brightness-110 ${plan.status === "Confirmed" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : plan.status === "Cancelled" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-amber-300 bg-amber-50 text-amber-700"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${plan.status === "Confirmed" ? "bg-emerald-500" : plan.status === "Cancelled" ? "bg-slate-400" : "bg-amber-500"}`}
                        />
                        {plan.status}
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </button>
                      {activeStatusMenuId === plan._id && (
                        <ActionDropdownPortal
                          anchorId={`resource-planning-status-${plan._id}`}
                          width={160}
                          className="w-40 rounded-xl border border-white/10 bg-slate-900 py-1 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                        >
                          {["Planned", "Confirmed", "Cancelled"].map(
                            (nextStatus) => {
                              const selected = plan.status === nextStatus;
                              return (
                                <button
                                  key={nextStatus}
                                  type="button"
                                  onClick={() => {
                                    setActiveStatusMenuId(null);
                                    if (!selected)
                                      statusMutation.mutate({
                                        planId: plan._id,
                                        status: nextStatus,
                                      });
                                  }}
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-xs transition hover:bg-slate-800 ${selected ? "font-semibold text-white" : "text-slate-300"}`}
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${nextStatus === "Confirmed" ? "bg-emerald-400" : nextStatus === "Cancelled" ? "bg-slate-400" : "bg-amber-400"}`}
                                  />
                                  <span>{nextStatus}</span>
                                  {selected && (
                                    <Check className="ml-auto h-3 w-3 text-cyan-400" />
                                  )}
                                </button>
                              );
                            },
                          )}
                        </ActionDropdownPortal>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          title="Edit"
                          onClick={() => openEdit(plan)}
                          className="rounded-lg p-2 text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          title="Hapus"
                          onClick={() =>
                            window.confirm("Hapus perencanaan resource ini?") &&
                            deleteMutation.mutate(plan._id)
                          }
                          className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"
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
              saveMutation.mutate();
            }}
            className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editing ? "Edit Perencanaan" : "Perencanaan Resource Baru"}
                </h3>
                <p className="text-xs text-slate-400">
                  Resource harus aktif dan kuantitas harus lebih dari nol.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block space-y-1 text-xs text-slate-400">
                Resource *
                <select
                  required
                  className={inputClass}
                  value={form.resource}
                  onChange={(event) =>
                    setForm({ ...form, resource: event.target.value })
                  }
                >
                  <option value="">Pilih resource aktif</option>
                  {editing?.resource?.status === "Inactive" &&
                    !resources.some(
                      (resource) => resource._id === editing.resource._id,
                    ) && (
                      <option value={editing.resource._id}>
                        {editing.resource.code} — {editing.resource.name}{" "}
                        (Inactive: rencana berjalan)
                      </option>
                    )}
                  {resources.map((resource) => (
                    <option key={resource._id} value={resource._id}>
                      {resource.code} — {resource.name} ({resource.category})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-xs text-slate-400">
                Item BOQ{" "}
                <span className="text-slate-500">
                  (opsional untuk alokasi proyek umum)
                </span>
                <select
                  className={inputClass}
                  value={form.boqItem}
                  onChange={(event) =>
                    setForm({ ...form, boqItem: event.target.value })
                  }
                >
                  <option value="">Alokasi langsung ke proyek</option>
                  {boqItems.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.itemCode ? `${item.itemCode} — ` : ""}
                      {item.description}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-xs text-slate-400">
                Kuantitas Rencana *
                <input
                  required
                  type="number"
                  min="0.000001"
                  step="any"
                  className={inputClass}
                  value={form.plannedQuantity}
                  onChange={(event) =>
                    setForm({ ...form, plannedQuantity: event.target.value })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs text-slate-400">
                  Mulai (opsional)
                  <input
                    type="date"
                    className={inputClass}
                    value={form.plannedStartDate}
                    onChange={(event) =>
                      setForm({ ...form, plannedStartDate: event.target.value })
                    }
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-400">
                  Selesai (opsional)
                  <input
                    type="date"
                    className={inputClass}
                    value={form.plannedEndDate}
                    min={form.plannedStartDate || undefined}
                    onChange={(event) =>
                      setForm({ ...form, plannedEndDate: event.target.value })
                    }
                  />
                </label>
              </div>
              <label className="block space-y-1 text-xs text-slate-400">
                Catatan
                <textarea
                  rows="2"
                  className={inputClass}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
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
                // disabled={saveMutation.isPending || resources.length === 0}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saveMutation.isPending ? "Menyimpan..." : "Simpan Perencanaan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanningTab;
