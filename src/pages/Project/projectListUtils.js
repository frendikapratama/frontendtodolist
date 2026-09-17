export const formatProjectDate = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const getUserDisplayName = (user) =>
  user?.username || user?.name || user?.nama || user?.email || "";

export const getDivisionDisplayName = (division) =>
  division?.nama || division?.name || "";

export const filterUsers = (users, query) => {
  if (!query.trim()) return users;

  const normalizedQuery = query.toLowerCase();
  return users.filter((user) => {
    const name = getUserDisplayName(user).toLowerCase();
    const email = (user.email || "").toLowerCase();
    return name.includes(normalizedQuery) || email.includes(normalizedQuery);
  });
};

export const filterDivisions = (divisions, query) => {
  if (!query.trim()) return divisions;

  const normalizedQuery = query.toLowerCase();
  return divisions.filter((division) =>
    getDivisionDisplayName(division).toLowerCase().includes(normalizedQuery),
  );
};
