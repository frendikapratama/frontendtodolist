import { BIDDING_STATUS_CONFIG } from "./biddingConstants";

export const statusLabel = (status) =>
  BIDDING_STATUS_CONFIG[status]?.label ?? "Draft";

export const currency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatCurrency = currency;

export const calculateBiddingTotal = (bidding) => {
  if (!bidding?.items?.length) return 0;
  return bidding.items.reduce((sum, item) => {
    const selectedSupplierId =
      item.selectedSupplier?._id || item.selectedSupplier;
    if (!selectedSupplierId) return sum;
    const quote = item.quotations?.find(
      (q) =>
        String(q.supplier?._id || q.supplier) === String(selectedSupplierId),
    );
    const unitPrice = quote?.unitPrice || 0;
    const qty = item.boqItem?.quantity || 0;
    return sum + qty * unitPrice;
  }, 0);
};

export const checkBiddingFinishReady = (bidding) => {
  const issues = [];
  if (!bidding?.items?.length) {
    issues.push("Minimal harus memiliki 1 item BOQ");
  }
  if (!bidding?.suppliers?.length) {
    issues.push("Minimal harus memiliki 1 supplier peserta");
  }
  if (bidding?.items?.length) {
    bidding.items.forEach((item, idx) => {
      const name = item.boqItem?.description || `Item #${idx + 1}`;
      if (!item.quotations?.length) {
        issues.push(`${name}: belum ada harga penawaran supplier`);
      }
      if (!item.selectedSupplier) {
        issues.push(`${name}: supplier terpilih belum ditentukan`);
      }
    });
  }
  return {
    isReady: issues.length === 0,
    issues,
  };
};

// Legacy exports for backwards compatibility
export const stepLabels = ["Draft", "In Progress", "Selesai"];
export const getStep = (bid) =>
  bid?.status === "FINISHED" ? 3 : bid?.items?.length ? 2 : 1;
export const phaseLabels = stepLabels;
export const getPhase = getStep;
export const phaseName = (bid) => statusLabel(bid?.status);
