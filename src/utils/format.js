/**
 * Shared formatting utilities for currency, numbers, and dates.
 * Eliminates duplication across BOQ, Budget, and Cost modules.
 */

export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatNumber = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID").format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
