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
          <span className="label-text">Nama Kuarter</span>
        </label>
        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="input input-bordered w-full"
          required
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-green-500 hover:bg-green-400 text-white shadow-2xl"
          disabled={createMutation.isPending}
        >
          Batalkan
        </button>
        <button
          type="submit"
          className="btn btn-primary shadow-2xl"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};
