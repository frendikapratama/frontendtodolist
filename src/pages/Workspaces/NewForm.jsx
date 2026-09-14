import { useWorkspace } from "../../hook/useWorkspace";
import { useDivision } from "../../hook/useDivision";

export const NewWorkspaceForm = ({ onClose }) => {
  const { formData, newcreateMutation, handleChange } = useWorkspace();
  const { divisionQuery } = useDivision();
  const { data: divisions, isLoading, isError } = divisionQuery;

  const handleSubmit = (e) => {
    e.preventDefault();

    newcreateMutation.mutate(
      { data: formData },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control w-full flex flex-col">
        <label className="label">
          <span className="label-text text-black">new Division Name</span>
        </label>
        <select
          name="nama"
          className="text-black p-2 bg-gray-300 rounded-sm mt-2"
          onChange={handleChange}
          value={formData.nama}
          required
          disabled={isLoading}
        >
          <option value="">
            {isLoading ? "Memuat..." : "Select Division"}
          </option>
          {isError && <option value="">Gagal memuat data</option>}
          {divisions?.map((division) => (
            <option key={division.id} value={division.name}>
              {division.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-400 hover:bg-red-300 text-white border-none shadow-2xl"
          disabled={newcreateMutation.isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary shadow-2xl"
          disabled={newcreateMutation.isPending}
        >
          {newcreateMutation.isPending ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};
