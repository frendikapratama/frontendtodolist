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
