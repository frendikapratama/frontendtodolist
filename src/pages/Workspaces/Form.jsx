import { useWorkspace } from "../../hook/useWorkspace";

export const WorkspaceForm = ({ onClose, kuarterId = null }) => {
  const { formData, createMutation, handleChange } = useWorkspace(kuarterId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!kuarterId) {
      toast.error("Quarter ID's not found");
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
      <div className="form-control w-full flex flex-col">
        <label className="label">
          <span className="label-text text-black">Division Name</span>
        </label>
        <select
          name="nama"
          className="text-black p-2 bg-gray-300 rounded-sm mt-2"
          onChange={handleChange}
          value={formData.nama}
          required
        >
          <option value="">Select Division</option>
          <option value="IT">IT</option>
          <option value="Production">Production</option>
          <option value="Accounting">Accounting</option>
          <option value="Corporate Secretary">Corporate Secretary</option>
          <option value="Collector">Collector</option>
          <option value="Audit Internal">Audit Internal</option>
          <option value="Administration">Administration</option>
          <option value="PPIC - PT">PPIC - PT</option>
          <option value="PPIC - HPC">PPIC - HPC</option>
          <option value="PPIC - PBPG">PPIC - PBPBG</option>
          <option value="Designer">Designer</option>
          <option value="Costing">Costing</option>
          <option value="Marketing">Marketing</option>
          <option value="Purchasing">Purchasing</option>
          <option value="Invoicing">Invoicing</option>
          <option value="QC - RND">QC - RND</option>
          <option value="Purchasing">Purchasing</option>
          <option value="CSD">CSD</option>
          <option value="HRD">HRD</option>
          <option value="GA">GA</option>
          <option value="Finance">Finance</option>
          <option value="Management Trainee">Management Trainee</option>
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-400 hover:bg-red-300 text-white border-none shadow-2xl"
          disabled={createMutation.isPending}
        >
          Cancel
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
