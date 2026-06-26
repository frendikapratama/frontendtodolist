import React, { useState, useEffect, useRef } from "react";
import { Search, X, Check, Users } from "lucide-react";

const UserSearchSelect = ({
  selectedIds = [],
  onChange,
  fetchUsers,
  placeholder = "Search users…",
  maxHeight = "200px",
  initialUsers = [],
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (initialUsers.length > 0) {
      setAllUsers((prev) => {
        const map = new Map(prev.map((u) => [u._id, u]));
        initialUsers.forEach((u) => map.set(u._id, u));
        return Array.from(map.values());
      });
    }
  }, [initialUsers]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!fetchUsers) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchUsers(query);
        setResults(data);
        setAllUsers((prev) => {
          const map = new Map(prev.map((u) => [u._id, u]));
          data.forEach((u) => map.set(u._id, u));
          return Array.from(map.values());
        });
      } catch (_) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, fetchUsers]);

  const toggle = (user) => {
    const next = selectedIds.includes(user._id)
      ? selectedIds.filter((id) => id !== user._id)
      : [...selectedIds, user._id];

    const nextUsers = next
      .map((id) => allUsers.find((u) => u._id === id))
      .filter(Boolean);

    onChange(next, nextUsers);
  };

  const remove = (id) => onChange(selectedIds.filter((s) => s !== id));

  const resolveUser = (id) => allUsers.find((u) => u._id === id);

  return (
    <div className="relative" ref={containerRef}>
      {/* Search input */}
      <div
        className="input input-bordered w-full bg-black/60 text-white flex items-center gap-2 cursor-text"
        onClick={() => setOpen(true)}
      >
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-500"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {loading && (
          <span className="loading loading-spinner loading-xs text-slate-400" />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full mt-1 left-0 right-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          style={{ maxHeight, overflowY: "auto" }}
        >
          {results.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              {loading
                ? "Searching…"
                : query
                  ? "No users found"
                  : "Type to search users"}
            </p>
          ) : (
            results.map((user) => {
              const isSelected = selectedIds.includes(user._id);
              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => toggle(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${
                    isSelected ? "bg-blue-500/10" : ""
                  }`}
                >
                  {/* Avatar */}
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.username}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Check icon */}
                  {isSelected && (
                    <Check size={14} className="text-blue-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Selected chips */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedIds.map((id) => {
            const u = resolveUser(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]"
              >
                {u ? u.username : id}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="text-blue-300 hover:text-white"
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserSearchSelect;
