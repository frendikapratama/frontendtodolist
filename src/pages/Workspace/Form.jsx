import { useWorkspace } from "../../hook/useWorkspace";
export const WorkspaceForm = ({ onClose }) => {
  const { formData, createMutation, handleChange } = useWorkspace(onClose);

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
    onClose();
  };
  const handleCancel = (e) => {
    onClose();
  };
  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="nama">nama workspace</label>
      <input
        name="nama"
        type="text"
        id="nama"
        value={formData.nama}
        onChange={handleChange}
        required
      />

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-green-500 hover:bg-green-400 text-white shadow-2xl mt-4"
          disabled={createMutation.isLoading}
        >
          Batalkan
        </button>
        <button
          type="submit"
          className="btn btn-primary mt-4 shadow-2xl"
          disabled={createMutation.isLoading}
        >
          {createMutation.isLoading ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
};
