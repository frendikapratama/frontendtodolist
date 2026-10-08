import React from "react";
import { Award } from "lucide-react";
import { currency } from "../biddingUtils";

export const BiddingOverviewCards = ({ activeBidding, activeTotal }) => {
  if (!activeBidding || activeBidding.status !== "FINISHED") return null;

  const items = activeBidding.items || [];

  return (
    <div className="grid gap-4 sm:grid-cols-3 animate-fadeIn">
      <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
          Status Pengadaan
        </span>
        <div className="mt-2 flex items-center gap-2">
          <Award className="h-6 w-6 text-emerald-400" />
          <span className="text-lg font-bold text-white">
            Selesai & Terkunci
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Data penawaran dan supplier pemenang telah final.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Item Selesai
        </span>
        <div className="mt-2 text-2xl font-bold text-white">
          {items.length}{" "}
          <span className="text-sm font-normal text-slate-400">Item BOQ</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          100% item telah dialokasikan ke supplier.
        </p>
      </div>

      <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-5">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
          TOTAL NILAI BIDDING
        </span>
        <div className="mt-2 text-2xl font-extrabold text-cyan-300">
          {currency(activeTotal)}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Total kalkulasi volume BOQ × harga satuan supplier.
        </p>
      </div>
    </div>
  );
};

export default BiddingOverviewCards;
