import { Check, ChevronRight, Trash2 } from "lucide-react";
import { statusLabel } from "./BiddingUtils";

const currency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export function BiddingProgressIndicator({ bid }) {
  if (!bid) return null;
  const isFinished = bid.status === "FINISHED";
  const totalItems = bid.items?.length || 0;
  const selectedCount =
    bid.items?.filter((item) => item.selectedSupplier).length || 0;

  if (isFinished) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 px-3 py-1 text-xs font-semibold text-emerald-300">
        <Check size={14} className="text-emerald-400" />
        <span>Bidding Selesai</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300">
      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
      <span>
        {totalItems > 0
          ? `${selectedCount}/${totalItems} Item Sudah Dipilih Supplier`
          : "Item Belum Dipilih"}
      </span>
    </div>
  );
}

export function BiddingCard({ bid, onOpen, onDelete, currency: currencyFmt }) {
  const fmt = currencyFmt || currency;
  const isFinished = bid.status === "FINISHED";
  const quotationCount =
    bid.items?.reduce((sum, item) => sum + (item.quotations?.length || 0), 0) ||
    0;
  const selectedCount =
    bid.items?.filter((item) => item.selectedSupplier).length || 0;
  const total =
    bid.items?.reduce((sum, item) => {
      const selected = item.selectedSupplier?._id || item.selectedSupplier;
      const quote = item.quotations?.find(
        (entry) =>
          String(entry.supplier?._id || entry.supplier) === String(selected),
      );
      return sum + (item.boqItem?.quantity || 0) * (quote?.unitPrice || 0);
    }, 0) || 0;

  return (
    <article className="group relative rounded-xl border border-slate-700 bg-slate-900/70 p-5 transition-all duration-200 hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-950/30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                isFinished
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : bid.status === "IN_PROGRESS"
                    ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                    : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isFinished ? "bg-emerald-500" : bid.status === "IN_PROGRESS" ? "bg-cyan-500" : "bg-slate-400"}`} />
              {isFinished ? "✓ Selesai" : statusLabel(bid.status)}
            </span>
            <span className="text-xs text-slate-500">
              {bid.items?.length || 0} Item • {bid.suppliers?.length || 0}{" "}
              Supplier
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white group-hover:text-cyan-200 transition-colors">
            {bid.title}
          </h3>
          {bid.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">
              {bid.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onDelete && !isFinished && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(bid);
              }}
              title="Hapus Bidding"
              className="rounded-lg p-2 text-slate-500 hover:bg-rose-950/60 hover:text-rose-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onOpen}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-base transition ${
              isFinished
                ? "bg-emerald-700 text-white hover:bg-emerald-600 shadow-xs shadow-emerald-950/40"
                : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-xs shadow-cyan-950/40"
            }`}
          >
            {isFinished ? "Lihat Hasil" : "Lanjutkan"}
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2.5">
          <span className="text-[11px] text-slate-400">Total Penawaran</span>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {quotationCount}
          </p>
        </div>
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2.5">
          <span className="text-[11px] text-slate-400">Supplier Terpilih</span>
          <p className="mt-0.5 text-sm font-semibold text-white">
            {selectedCount} / {bid.items?.length || 0}
          </p>
        </div>
        <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2.5">
          <span className="text-[11px] text-slate-400">Total Bidding</span>
          <p className="mt-0.5 text-sm font-semibold text-cyan-300 truncate">
            {total > 0 ? fmt(total) : "-"}
          </p>
        </div>
      </div>
    </article>
  );
}
