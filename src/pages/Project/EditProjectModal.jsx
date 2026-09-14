import { useState, useEffect } from "react";
import { useProject } from "../../hook/useProject";
import { PROJECT_STATUS_OPTIONS } from "../../config/option";

const toDateInputValue = (date) =>
  date ? new Date(date).toISOString().split("T")[0] : "";

const EditProjectModal = ({ project, workspaceId, isOpen, onClose }) => {
  const { updateProjectMutation } = useProject();
  const [form, setForm] = useState({
    nama: "",
    description: "",
    startedAt: "",
    dueDate: "",
    status: "draft",
  });

  useEffect(() => {
    if (project) {
      setForm({
        nama: project.nama || "",
        description: project.description || "",
        startedAt: toDateInputValue(project.startedAt),
        dueDate: toDateInputValue(project.dueDate),
        status: project.status || "draft",
      });
    }
  }, [project]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama.trim()) return;

    updateProjectMutation.mutate(
      {
        projectId: project._id,
        data: {
          nama: form.nama.trim(),
          description: form.description,
          startedAt: form.startedAt || null,
          dueDate: form.dueDate || null,
          status: form.status,
          workspaceId,
        },
      },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <dialog open className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-box bg-white text-gray-800">
        <h3 className="font-bold text-lg mb-4">Edit Project</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Name Project</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full bg-gray-300 text-black"
              value={form.nama}
              onChange={handleChange("nama")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full bg-gray-300 text-black"
                value={form.startedAt}
                onChange={handleChange("startedAt")}
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Due Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full bg-gray-300 text-black"
                value={form.dueDate}
                onChange={handleChange("dueDate")}
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered w-full bg-gray-300 text-black capitalize"
              value={form.status}
              onChange={handleChange("status")}
            >
              {PROJECT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default EditProjectModal;
