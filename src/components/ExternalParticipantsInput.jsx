import React, { useState } from "react";
import { X, Mail, Phone, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const ExternalParticipantsInput = ({ value = [], onChange, placeholder }) => {
  const [draft, setDraft] = useState({ name: "", email: "", noHp: "" });

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAdd = () => {
    const email = draft.email.trim();
    if (!email) {
      toast.error("Email is required for external participant");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    const alreadyExists = value.some(
      (p) => p.email.toLowerCase() === email.toLowerCase(),
    );
    if (alreadyExists) {
      toast.error("This email has already been added");
      return;
    }

    onChange([
      ...value,
      {
        name: draft.name.trim() || email,
        email,
        noHp: draft.noHp.trim() || "",
      },
    ]);
    setDraft({ name: "", email: "", noHp: "" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (email) => {
    onChange(value.filter((p) => p.email !== email));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Name (optional)"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          onKeyDown={handleKeyDown}
          className="input input-bordered input-sm w-full bg-black/60 text-white"
        />
        <input
          type="email"
          placeholder={placeholder || "email@example.com"}
          value={draft.email}
          onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
          onKeyDown={handleKeyDown}
          className="input input-bordered input-sm w-full bg-black/60 text-white"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="No. HP (optional)"
            value={draft.noHp}
            onChange={(e) => setDraft((d) => ({ ...d, noHp: e.target.value }))}
            onKeyDown={handleKeyDown}
            className="input input-bordered input-sm w-full bg-black/60 text-white"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="btn btn-sm btn-primary shrink-0"
          >
            <UserPlus size={14} />
          </button>
        </div>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((p) => (
            <div
              key={p.email}
              className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-full px-3 py-1"
            >
              <span className="text-xs text-white font-medium">{p.name}</span>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Mail size={10} /> {p.email}
              </span>
              {p.noHp && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Phone size={10} /> {p.noHp}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(p.email)}
                className="text-gray-400 hover:text-red-400"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExternalParticipantsInput;
