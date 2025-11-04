import { DEPARTEMEN_DIVISI } from "../config/departemenDivisi.js";

export function getDepartemenOptions() {
  return DEPARTEMEN_DIVISI.map((dept) => ({
    value: dept.departemenId,
    label: dept.departemenName,
  }));
}

export function getDivisiOptions(departemenId) {
  const selectedDepartemen = DEPARTEMEN_DIVISI.find(
    (dept) => dept.departemenId === departemenId
  );

  return (
    selectedDepartemen?.divisi.map((div) => ({
      value: div,
      label: div,
    })) || []
  );
}
