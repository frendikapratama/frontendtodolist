import React from "react";
import { useKuarter } from "../../hook/useKuarter";

export const KuarterForm = ({ onClose }) => {
  const { formData, handleChange, createMutation } = useKuarter();

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-gray-800">Quarter's Name</span>
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
      <div className="form-control w-full flex flex-col">
        <label className="label">
          <span className="label-text mb-2 text-gray-800">Department</span>
        </label>
        <select
          className="bg-black/60 rounded-sm p-2 pl-4 text-white text-[0.8em]"
          name="departemen"
          value={formData.departemen}
          onChange={handleChange}
          required
          >
          <option value="">Select Department</option>
          <option value="PBPG">PBPG</option>
          <option value="HPC">HPC</option>
          <option value="PT">PT</option>
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-400 hover:bg-red-300 border-none text-white shadow-2xl"
          disabled={createMutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary shadow-2xl"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};
