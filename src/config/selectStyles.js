export const selectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    minHeight: "42px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(59,130,246,0.3)"
      : "0 1px 2px rgba(0,0,0,0.05)",
    "&:hover": {
      borderColor: state.isFocused ? "#3b82f6" : "#9ca3af",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 12px",
    color: "#374151",
  }),
  placeholder: (base) => ({
    ...base,
    fontStyle: "italic",
    color: "#9ca3af",
  }),
  input: (base) => ({
    ...base,
    color: "#374151",
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#374151",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.5rem",
    marginTop: 4,
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  }),
};
