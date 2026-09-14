import { useState, useEffect } from "react";
import { useParty } from "../../hook/useParty";

const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const FormParty = ({ party, onClose }) => {
  const { createPartyMutation, updatePartyMutation } = useParty();
  const isEditMode = Boolean(party);
  const mutation = isEditMode ? updatePartyMutation : createPartyMutation;

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    setFormData(
      party
        ? {
            name: party.name || "",
            email: party.email || "",
            phone: party.phone || "",
            address: party.address || "",
          }
        : INITIAL_FORM_STATE,
    );
  }, [party]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = isEditMode ? { id: party._id, data: formData } : formData;

    mutation.mutate(payload, {
      onSuccess: () => {
        setFormData(INITIAL_FORM_STATE);
        onClose();
      },
    });
  };

  const handleCancel = () => onClose();

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* NAME */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white">Name of Party</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full bg-black/60 text-white capitalize"
            placeholder="Enter party name"
            required
            disabled={mutation.isPending}
          />
        </div>

        {/* EMAIL */}
        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text mb-2 text-white">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full bg-black/60 text-white"
            placeholder="Enter email"
            disabled={mutation.isPending}
          />
        </div>

        {/* PHONE */}
        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text mb-2 text-white">Phone</span>
          </label>

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 15);

              handleChange({
                target: {
                  name: "phone",
                  value,
                },
              });
            }}
            inputMode="numeric"
            maxLength={15}
            className="input input-bordered w-full bg-black/60 text-white"
            placeholder="Enter phone number"
            autoComplete="tel"
            disabled={mutation.isPending}
          />
        </div>

        {/* ADDRESS */}
        <div className="form-control w-full mt-4">
          <label className="label">
            <span className="label-text mb-2 text-white">Address</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-black/60 text-white"
            placeholder="Enter address"
            rows={3}
            disabled={mutation.isPending}
          />
        </div>

        {/* BUTTON */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="btn bg-red-400 hover:bg-red-300 border-none text-white"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
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

export default FormParty;
