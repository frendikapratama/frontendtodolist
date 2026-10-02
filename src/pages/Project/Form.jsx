import { useState, useEffect, useCallback, useRef } from "react";
import { useProject } from "../../hook/useProject";
import { useParty } from "../../hook/useParty";
import { useDivision } from "../../hook/useDivision";
import { getUsers } from "../../services/userServices";
import UserSearchSelect from "../../components/Usersearchselect";
import { X, Check, ChevronDown, Search, Plus } from "lucide-react";

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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 placeholder-slate-500 transition-colors focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-900 disabled:text-slate-600"
            placeholder="Enter project name"
            required
            disabled={mutation.isPending}
          />
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">
              Start Date
            </label>
            <input
              type="date"
              name="startedAt"
              value={formData.startedAt}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 transition-colors focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-900 disabled:text-slate-600 scheme-dark"
              disabled={mutation.isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-200">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 transition-colors focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-900 disabled:text-slate-600 scheme-dark"
              disabled={mutation.isPending}
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 capitalize transition-colors focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:bg-slate-900 disabled:text-slate-600"
            disabled={mutation.isPending}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-slate-800 text-slate-100">
                {s.replace(/\b\w/g, (char) => char.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Project Manager */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">
            Project Manager
          </label>
          {selectedManager ? (
            <div className="flex items-center justify-between gap-3 bg-slate-800/60 border border-slate-700 rounded-lg p-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {selectedManager.photo ? (
                  <img
                    src={selectedManager.photo}
                    alt={selectedManager.username}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 flex items-center justify-center text-xs font-semibold shrink-0">
                    {selectedManager.username?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {selectedManager.username}
                  </p>
                  {selectedManager.email && (
                    <p className="text-xs text-slate-400 truncate">
                      {selectedManager.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearProjectManager}
                disabled={mutation.isPending}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors shrink-0"
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

        {/* Divisions Multi-Select Dropdown */}
        <div className="space-y-1.5" ref={divisionDropdownRef}>
          <label className="block text-sm font-medium text-slate-200">
            Divisions
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDivisionDropdownOpen((prev) => !prev)}
              disabled={mutation.isPending}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 text-left transition-colors focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            >
              <span
                className={
                  formData.divisionId.length === 0
                    ? "text-slate-500"
                    : "text-slate-100"
                }
              >
                {formData.divisionId.length === 0
                  ? "Pilih divisi..."
                  : `${formData.divisionId.length} divisi dipilih`}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isDivisionDropdownOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden p-2 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={divisionSearch}
                    onChange={(e) => setDivisionSearch(e.target.value)}
                    placeholder="Cari divisi..."
                    className="w-full bg-slate-900 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredDivisions.length === 0 ? (
                    <p className="text-xs text-slate-500 p-2 text-center">
                      Divisi tidak ditemukan.
                    </p>
                  ) : (
                    filteredDivisions.map((d) => {
                      const isSelected = formData.divisionId.includes(d._id);
                      return (
                        <div
                          key={d._id}
                          onClick={() => toggleDivision(d._id)}
                          className={`flex items-center justify-between p-2 rounded-md text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800/40"
                              : "text-slate-300 hover:bg-slate-700/60"
                          }`}
                        >
                          <span className="font-medium">{d.name}</span>
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-cyan-600 border-cyan-500"
                                : "border-slate-600 bg-slate-900"
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

          {/* Selected Badges */}
          {selectedDivisions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedDivisions.map((d) => (
                <span
                  key={d._id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-950/70 text-cyan-400 border border-cyan-800/60"
                >
                  {d.name}
                  <button
                    type="button"
                    onClick={() => toggleDivision(d._id)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sites - Checkboxes */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-200">
            Sites
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {SITES_OPTIONS.map((s) => {
              const isChecked = formData.sites.includes(s);
              return (
                <label
                  key={s}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-cyan-950/60 border-cyan-800/60 text-cyan-400"
                      : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="sites"
                    value={s}
                    checked={isChecked}
                    onChange={handleChange}
                    className="w-4 h-4 rounded accent-cyan-600 cursor-pointer bg-slate-900 border-slate-700"
                    disabled={mutation.isPending}
                  />
                  <span className="text-xs font-medium uppercase">{s}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Parties */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            Parties
          </label>
          <div className="space-y-2">
            {formData.parties.map((p, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700"
              >
                <select
                  value={p.party}
                  onChange={(e) =>
                    handlePartyChange(index, "party", e.target.value)
                  }
                  className="flex-1 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
                  disabled={mutation.isPending}
                >
                  <option value="" disabled className="text-slate-500">
                    Select party
                  </option>
                  {partyList.map((party) => (
                    <option
                      key={party._id}
                      value={party._id}
                      className="bg-slate-800 text-slate-100"
                    >
                      {party.name}
                    </option>
                  ))}
                </select>

                <select
                  value={p.role}
                  onChange={(e) =>
                    handlePartyChange(index, "role", e.target.value)
                  }
                  className="w-full sm:w-32 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs rounded-md border border-slate-700 capitalize focus:outline-none focus:border-cyan-500"
                  disabled={mutation.isPending}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option
                      key={r}
                      value={r}
                      className="bg-slate-800 text-slate-100"
                    >
                      {r}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => removePartyRow(index)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors self-end sm:self-auto"
                  disabled={mutation.isPending || formData.parties.length === 1}
                  title="Remove Party"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPartyRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-md transition-colors"
              disabled={mutation.isPending}
            >
              <Plus className="w-3.5 h-3.5" /> Add Party
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-800">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : isEditMode ? (
              "Update Project"
            ) : (
              "Save Project"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProject;
