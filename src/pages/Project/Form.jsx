import { useState, useEffect, useCallback, useRef } from "react";
import { useProject } from "../../hook/useProject";
import { useParty } from "../../hook/useParty";
import { useDivision } from "../../hook/useDivision";
import { getUsers } from "../../services/userServices";
import UserSearchSelect from "../../components/Usersearchselect";
import { X, Check, ChevronDown, Search } from "lucide-react";

const INITIAL_FORM_STATE = {
  nama: "",
  startedAt: "",
  dueDate: "",
  status: "draft",
  projectManager: "",
  divisionId: [],
  parties: [{ party: "", role: "client" }],
  sites: [],
};

const STATUS_OPTIONS = [
  "draft",
  "planning",
  "in progress",
  "hold",
  "completed",
  "cancelled",
];
const SITES_OPTIONS = ["PT", "HPC", "PBPG"];

const ROLE_OPTIONS = ["client", "vendor"];

const toDateInputValue = (isoString) =>
  isoString ? isoString.slice(0, 10) : "";
const toISODate = (dateStr) =>
  dateStr ? new Date(dateStr).toISOString() : null;

const FormProject = ({ project, onClose }) => {
  const { createProjectMutation, updateProjectMutation } = useProject();
  const { partyQuery } = useParty();
  const { divisionQuery } = useDivision();

  const isEditMode = Boolean(project);
  const mutation = isEditMode ? updateProjectMutation : createProjectMutation;

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [selectedManager, setSelectedManager] = useState(null);

  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [divisionSearch, setDivisionSearch] = useState("");
  const divisionDropdownRef = useRef(null);

  useEffect(() => {
    if (project) {
      const pmId = project.projectManager?._id || project.projectManager || "";
      setFormData({
        nama: project.nama || "",
        startedAt: toDateInputValue(project.startedAt),
        dueDate: toDateInputValue(project.dueDate),
        status: project.status || "planning",
        projectManager: pmId,
        divisionId: (project.divisionId || []).map((d) => d._id || d),
        parties: project.parties?.length
          ? project.parties.map((p) => ({
              party: p.party?._id || p.party,
              role: p.role,
            }))
          : [{ party: "", role: "client" }],
        sites: Array.isArray(project.sites) ? project.sites : [],
      });

      if (
        project.projectManager &&
        typeof project.projectManager === "object"
      ) {
        setSelectedManager({
          _id: project.projectManager._id,
          username:
            project.projectManager.username ||
            project.projectManager.nama ||
            project.projectManager.name,
          email: project.projectManager.email,
          photo: project.projectManager.photo
            ? `${import.meta.env.VITE_API_URL}/uploads/users/${project.projectManager.photo}`
            : undefined,
        });
      } else {
        setSelectedManager(null);
      }
    } else {
      setFormData(INITIAL_FORM_STATE);
      setSelectedManager(null);
    }
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        divisionDropdownRef.current &&
        !divisionDropdownRef.current.contains(event.target)
      ) {
        setIsDivisionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = useCallback(async (query) => {
    if (!query) return [];
    const res = await getUsers({
      search: query,
      limit: 20,
      canAccess: "planify",
    });
    const list = res?.data ?? [];
    return list.map((u) => ({
      _id: u._id,
      username: u.username || u.nama || u.name,
      email: u.email,
      photo: u.photo
        ? `${import.meta.env.VITE_API_URL}/uploads/users/${u.photo}`
        : undefined,
    }));
  }, []);

  const handleProjectManagerSelect = (selectedIds, allOptions) => {
    const newId = selectedIds.find((id) => id !== formData.projectManager);
    const chosenId = newId ?? selectedIds[selectedIds.length - 1] ?? "";

    if (!chosenId) {
      setFormData((prev) => ({ ...prev, projectManager: "" }));
      setSelectedManager(null);
      return;
    }

    const chosenUser = allOptions?.find((u) => u._id === chosenId) || null;
    setFormData((prev) => ({ ...prev, projectManager: chosenId }));
    setSelectedManager(chosenUser);
  };

  const clearProjectManager = () => {
    setFormData((prev) => ({ ...prev, projectManager: "" }));
    setSelectedManager(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, multiple, selectedOptions } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const currentArray = Array.isArray(prev[name]) ? prev[name] : [];
        return {
          ...prev,
          [name]: checked
            ? [...currentArray, value]
            : currentArray.filter((item) => item !== value),
        };
      });
    } else if (multiple) {
      setFormData((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toggleDivision = (id) => {
    setFormData((prev) => ({
      ...prev,
      divisionId: prev.divisionId.includes(id)
        ? prev.divisionId.filter((d) => d !== id)
        : [...prev.divisionId, id],
    }));
  };

  const handlePartyChange = (index, field, value) => {
    setFormData((prev) => {
      const parties = [...prev.parties];
      parties[index] = { ...parties[index], [field]: value };
      return { ...prev, parties };
    });
  };

  const addPartyRow = () =>
    setFormData((prev) => ({
      ...prev,
      parties: [...prev.parties, { party: "", role: "client" }],
    }));

  const removePartyRow = (index) =>
    setFormData((prev) => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      nama: formData.nama,
      startedAt: toISODate(formData.startedAt),
      dueDate: toISODate(formData.dueDate),
      status: formData.status,
      projectManager: formData.projectManager || null,
      divisionId: formData.divisionId,
      parties: formData.parties.filter((p) => p.party),
      sites: formData.sites,
    };

    const mutationPayload = isEditMode
      ? { projectId: project._id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: () => {
        setFormData(INITIAL_FORM_STATE);
        setSelectedManager(null);
        onClose();
      },
    });
  };

  const handleCancel = () => onClose();

  const partyList = partyQuery?.data || [];
  const divisionList = divisionQuery?.data || [];

  const filteredDivisions = divisionList.filter((d) =>
    d.name.toLowerCase().includes(divisionSearch.toLowerCase()),
  );

  const selectedDivisions = divisionList.filter((d) =>
    formData.divisionId.includes(d._id),
  );

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Project Name */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Project Name
            </span>
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="input input-bordered w-full bg-black/60 text-white focus:border-blue-500 focus:outline-none"
            placeholder="Enter project name"
            required
            disabled={mutation.isPending}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-sm font-medium text-gray-200">
                Start Date
              </span>
            </label>
            <input
              type="date"
              name="startedAt"
              value={formData.startedAt}
              onChange={handleChange}
              className="input input-bordered w-full bg-black/60 text-white focus:border-blue-500 focus:outline-none"
              disabled={mutation.isPending}
            />
          </div>
          <div className="form-control w-full">
            <label className="label pb-1">
              <span className="label-text text-sm font-medium text-gray-200">
                Due Date
              </span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="input input-bordered w-full bg-black/60 text-white focus:border-blue-500 focus:outline-none"
              disabled={mutation.isPending}
            />
          </div>
        </div>

        {/* Status */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Status
            </span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select select-bordered w-full bg-black/60 text-white capitalize focus:border-blue-500 focus:outline-none"
            disabled={mutation.isPending}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace(/\b\w/g, (char) => char.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* PROJECT MANAGER — single select */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Project Manager
            </span>
          </label>

          {selectedManager ? (
            <div className="flex items-center justify-between gap-3 bg-black/60 border border-white/10 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {selectedManager.photo ? (
                  <img
                    src={selectedManager.photo}
                    alt={selectedManager.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center text-xs font-semibold shrink-0">
                    {selectedManager.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {selectedManager.username}
                  </p>
                  {selectedManager.email && (
                    <p className="text-xs text-gray-400 truncate">
                      {selectedManager.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearProjectManager}
                disabled={mutation.isPending}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Ganti project manager"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <UserSearchSelect
              selectedIds={[]}
              onChange={handleProjectManagerSelect}
              fetchUsers={fetchUsers}
              initialUsers={[]}
              placeholder="Search project manager by name or email…"
            />
          )}
        </div>

        {/* DIVISIONS — Dropdown Multi-Select */}
        <div className="form-control w-full" ref={divisionDropdownRef}>
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Divisions
            </span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDivisionDropdownOpen((prev) => !prev)}
              disabled={mutation.isPending}
              className="w-full flex items-center justify-between input input-bordered bg-black/60 text-white text-left font-normal focus:border-blue-500"
            >
              <span className="text-sm text-gray-300 truncate">
                {formData.divisionId.length === 0
                  ? "Pilih divisi..."
                  : `${formData.divisionId.length} divisi dipilih`}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isDivisionDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden p-2 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={divisionSearch}
                    onChange={(e) => setDivisionSearch(e.target.value)}
                    placeholder="Cari divisi..."
                    className="w-full bg-black/50 text-white text-xs pl-9 pr-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredDivisions.length === 0 ? (
                    <p className="text-xs text-gray-500 p-2 text-center">
                      Divisi tidak ditemukan.
                    </p>
                  ) : (
                    filteredDivisions.map((d) => {
                      const isSelected = formData.divisionId.includes(d._id);
                      return (
                        <div
                          key={d._id}
                          onClick={() => toggleDivision(d._id)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-600/20 text-blue-200"
                              : "text-gray-300 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-medium">{d.name}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-blue-600 border-blue-500"
                                : "border-white/20"
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedDivisions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {selectedDivisions.map((d) => (
                <span
                  key={d._id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-600/20 text-blue-200 border border-blue-500/30"
                >
                  {d.name}
                  <button
                    type="button"
                    onClick={() => toggleDivision(d._id)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* SITES — Checkbox Card Grid */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Sites
            </span>
          </label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-1">
            {SITES_OPTIONS.map((s) => {
              const isChecked = formData.sites.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-blue-600/15 border-blue-500/50 text-white"
                      : "bg-black/40 border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="sites"
                    value={s}
                    checked={isChecked}
                    onChange={handleChange}
                    className="checkbox checkbox-xs checkbox-primary rounded"
                    disabled={mutation.isPending}
                  />
                  <span className="text-xs font-medium capitalize">
                    {s.replace(/\b\w/g, (char) => char.toUpperCase())}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* PARTIES */}
        <div className="form-control w-full">
          <label className="label pb-1">
            <span className="label-text text-sm font-medium text-gray-200">
              Parties
            </span>
          </label>
          <div className="space-y-2 mt-1">
            {formData.parties.map((p, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-black/40 p-2 rounded-lg border border-white/5"
              >
                <select
                  value={p.party}
                  onChange={(e) =>
                    handlePartyChange(index, "party", e.target.value)
                  }
                  className="select select-bordered select-sm flex-1 bg-black/60 text-white text-xs focus:border-blue-500 focus:outline-none"
                  disabled={mutation.isPending}
                >
                  <option value="" disabled>
                    Select party
                  </option>
                  {partyList.map((party) => (
                    <option key={party._id} value={party._id}>
                      {party.name}
                    </option>
                  ))}
                </select>

                <select
                  value={p.role}
                  onChange={(e) =>
                    handlePartyChange(index, "role", e.target.value)
                  }
                  className="select select-bordered select-sm w-full sm:w-36 bg-black/60 text-white text-xs capitalize focus:border-blue-500 focus:outline-none"
                  disabled={mutation.isPending}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removePartyRow(index)}
                  className="btn btn-xs sm:btn-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30 self-end sm:self-auto"
                  disabled={mutation.isPending || formData.parties.length === 1}
                  title="Remove Party"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addPartyRow}
              className="btn btn-xs sm:btn-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/30 w-full sm:w-auto mt-1"
              disabled={mutation.isPending}
            >
              + Add Party
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            className="btn btn-sm sm:btn-md bg-transparent hover:bg-white/10 border-white/20 text-gray-300"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-sm sm:btn-md btn-primary px-6"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : isEditMode ? (
              "Update"
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProject;
