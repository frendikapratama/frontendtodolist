import { useEffect, useRef, useState } from "react";
import { useFacilitiesSelect } from "../../../hook/BookingMeeting/useFacilitiesSelect";
import Select from "react-select";

const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderColor: state.isFocused ? "#3b82f6" : "rgba(255, 255, 255, 0.2)",
    borderWidth: "2px",
    borderRadius: "0.75rem",
    padding: "2px 4px",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1e293b",
    borderRadius: "0.75rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": {
      background: "#475569",
      borderRadius: "3px",
    },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? "rgba(59, 130, 246, 0.2)"
      : state.isSelected
        ? "#3b82f6"
        : "transparent",
    color: state.isSelected ? "white" : "#e2e8f0",
    borderRadius: "0.5rem",
    padding: "10px 12px",
    cursor: "pointer",
    "&:active": { backgroundColor: "#3b82f6" },
  }),
  input: (base) => ({ ...base, color: "#e2e8f0" }),
  placeholder: (base) => ({ ...base, color: "#94a3b8" }),
  singleValue: (base) => ({ ...base, color: "#e2e8f0" }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { color: "#e2e8f0" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { color: "#ef4444" },
  }),
  noOptionsMessage: (base) => ({ ...base, color: "#94a3b8", padding: "20px" }),
  loadingMessage: (base) => ({ ...base, color: "#94a3b8", padding: "20px" }),
};

const selectTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    ...theme.colors,
    primary: "#3b82f6",
    primary75: "#60a5fa",
    primary50: "rgba(59, 130, 246, 0.5)",
    primary25: "rgba(59, 130, 246, 0.2)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.2)",
    neutral0: "#1e293b",
    neutral5: "rgba(255, 255, 255, 0.05)",
    neutral10: "rgba(255, 255, 255, 0.1)",
    neutral20: "rgba(255, 255, 255, 0.2)",
    neutral30: "rgba(255, 255, 255, 0.3)",
    neutral40: "#94a3b8",
    neutral50: "#94a3b8",
    neutral60: "#cbd5e1",
    neutral70: "#e2e8f0",
    neutral80: "#f1f5f9",
    neutral90: "#f8fafc",
  },
});

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getInitialFormData = () => ({
  nama: "",
  lokasi: "",
  kapasitas: 0,
  facilities: [{ facilityId: "", total: 0 }],
  photo: null,
});

export const RoomForm = ({ onClose, onSubmit, initialData, isPending }) => {
  const { query: facilitiesQuery, setSearch } = useFacilitiesSelect();

  const [formData, setFormData] = useState(getInitialFormData());
  const [selectedOptions, setSelectedOptions] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const opts = {};
      initialData.facilities?.forEach((fac, i) => {
        if (fac.facilityId?._id) {
          opts[i] = { value: fac.facilityId._id, label: fac.facilityId.nama };
        } else if (fac.facilityId) {
          opts[i] = { value: fac.facilityId, label: fac.facilityId };
        }
      });
      setSelectedOptions(opts);
      setFormData({
        nama: initialData.nama || "",
        lokasi: initialData.lokasi || "",
        kapasitas: initialData.kapasitas || 0,
        facilities:
          initialData.facilities?.length > 0
            ? initialData.facilities
            : [{ facilityId: "", total: 0 }],
        photo: null,
      });
      setPhotoPreview(
        initialData.photo
          ? `${BASE_URL}/uploads/rooms/${initialData.photo}`
          : null,
      );
    } else {
      setFormData(getInitialFormData());
      setSelectedOptions({});
      setPhotoPreview(null);
    }
  }, [initialData]);

  const facilities = facilitiesQuery.data?.data || [];
  const isLoadingFacilities = facilitiesQuery.isLoading;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "kapasitas" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleFacilityChange = (index, field, value) => {
    const updatedFacilities = [...formData.facilities];
    updatedFacilities[index] = {
      ...updatedFacilities[index],
      [field]: field === "total" ? (value === "" ? 0 : Number(value)) : value,
    };
    setFormData((prev) => ({ ...prev, facilities: updatedFacilities }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addFacility = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [...prev.facilities, { facilityId: "", total: 0 }],
    }));
  };

  const removeFacility = (index) => {
    if (formData.facilities.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
    setSelectedOptions((prev) => {
      const updated = {};
      Object.entries(prev).forEach(([key, val]) => {
        const k = Number(key);
        if (k < index) updated[k] = val;
        else if (k > index) updated[k - 1] = val;
      });
      return updated;
    });
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setSelectedOptions({});
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Room Name */}
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text text-white">Room Name</span>
        </label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="input input-bordered w-full bg-black/60 text-white"
          required
        />
      </div>

      {/* Location */}
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text text-white">Location</span>
        </label>
        <input
          type="text"
          name="lokasi"
          value={formData.lokasi}
          onChange={handleChange}
          className="input input-bordered w-full bg-black/60 text-white"
          required
        />
      </div>

      {/* Capacity */}
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text text-white">Capacity</span>
        </label>
        <input
          type="number"
          name="kapasitas"
          value={formData.kapasitas === 0 ? "" : formData.kapasitas}
          onChange={handleChange}
          placeholder="0"
          className="input input-bordered w-full bg-black/60 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          min="1"
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text text-white">Room Photo</span>
          <span className="label-text-alt text-slate-400">
            Optional · max 5MB
          </span>
        </label>

        {photoPreview ? (
          <div className="relative w-full rounded-xl overflow-hidden border border-white/20 mb-2 group">
            <img
              src={photoPreview}
              alt="Room preview"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                  />
                </svg>
                Change Photo
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                Remove
              </button>
            </div>
            <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-slate-300 px-2 py-0.5 rounded-md pointer-events-none">
              Hover to edit
            </span>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-44 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-9 h-9 text-slate-500 group-hover:text-blue-400 mb-2 transition-colors"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="text-slate-300 text-sm font-medium group-hover:text-blue-300 transition-colors">
              Click to upload photo
            </span>
            <span className="text-slate-500 text-xs mt-1">
              PNG, JPG up to 5MB
            </span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Facilities */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-white">Facilities</h4>
          <button
            type="button"
            onClick={addFacility}
            className="btn btn-sm btn-primary"
          >
            + Add Facility
          </button>
        </div>

        {formData.facilities.map((facility, index) => (
          <div key={index} className="flex gap-2 mb-3 items-center">
            <div className="flex-1">
              <Select
                options={facilities.map((fac) => ({
                  value: fac._id,
                  label: fac.nama,
                }))}
                value={selectedOptions[index] || null}
                onChange={(selected) => {
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [index]: selected || null,
                  }));
                  handleFacilityChange(
                    index,
                    "facilityId",
                    selected?.value || "",
                  );
                }}
                onInputChange={(inputValue) => setSearch(inputValue)}
                filterOption={() => true}
                isLoading={isLoadingFacilities}
                placeholder="Search facility..."
                isClearable
                styles={customSelectStyles}
                theme={selectTheme}
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                placeholder="0"
                value={facility.total === 0 ? "" : facility.total}
                onChange={(e) =>
                  handleFacilityChange(index, "total", e.target.value)
                }
                className="input input-bordered w-full bg-black/60 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => removeFacility(index)}
              className="btn btn-error btn-sm px-3"
              disabled={formData.facilities.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-500 hover:bg-red-400 border-none text-white"
          disabled={isPending}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};
