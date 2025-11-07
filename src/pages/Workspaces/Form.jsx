import { useWorkspace } from "../../hook/useWorkspace";

export const WorkspaceForm = ({ onClose, kuarterId = null }) => {
  const { formData, createMutation, handleChange } = useWorkspace(kuarterId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!kuarterId) {
      toast.error("Kuarter ID tidak ditemukan");
      return;
    }
    createMutation.mutate(
      {
        kuarterId,
        data: formData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Nama Workspace</span>
        </label>
        <input
          name="nama"
          type="text"
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
