import { useEffect, useState } from "react";

export const FacilitiesForm = ({
  onClose,
  onSubmit,
  initialData,
  isPending,
}) => {
  const [formData, setFormData] = useState({
    nama: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
      });
    } else {
      setFormData({
        nama: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await onSubmit(formData);

      setFormData({
        nama: "",
      });

      onClose();
    } catch (error) {
      console.log(error);
    }
  };
  const handleCancel = () => {
    onClose();
    setFormData({
      nama: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-white">Facilities Name</span>
        </label>

        <input
          type="text"
          name="nama"
          value={formData.nama}
          onChange={handleChange}
          className="input input-bordered w-full bg-black/60 text-white uppercase"
          required
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-400  hover:bg-red-300 border-none text-white"
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
