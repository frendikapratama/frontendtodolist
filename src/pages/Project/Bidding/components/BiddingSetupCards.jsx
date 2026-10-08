import React from "react";
import { Layers, Plus, Search, Users } from "lucide-react";

export const BiddingSetupCards = ({
  items = [],
  activeSuppliers = [],
  onOpenItemPicker,
  partySearch = "",
  setPartySearch,
  loadingParties = false,
  partyMaster = [],
  onToggleSupplier,
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-12 animate-fadeIn">
      {/* BOQ Items Card (PRD §4) */}
      <div className="lg:col-span-6 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              1. Item BOQ Pengadaan
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenItemPicker}
            className="inline-flex items-center gap-1 rounded-lg bg-cyan-700/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-600 transition"
          >
            <Plus size={13} />
            {items.length ? "Atur Item BOQ" : "Pilih Item BOQ"}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Item BOQ dari project yang akan dibandingkan penawarannya. Quantity
          mengikuti data BOQ.
        </p>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center">
            <p className="text-xs text-slate-400">
              Belum ada item BOQ yang dipilih.
            </p>
            <button
              type="button"
              onClick={onOpenItemPicker}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:underline"
            >
              + Pilih item sekarang
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const boq = item.boqItem || {};
              return (
                <div
                  key={item._id || idx}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-white truncate block">
                      {idx + 1}. {boq.description || "Item BOQ"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {boq.quantity || 0} {boq.unit || "unit"}{" "}
                      {boq.itemCode ? `• Kode: ${boq.itemCode}` : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supplier Selection Card (PRD §5) */}
      <div className="lg:col-span-6 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              2. Supplier Peserta
            </h2>
          </div>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {activeSuppliers.length} Dipilih
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Cari supplier langsung dari Party Master. Supplier yang dipilih akan
          muncul sebagai peserta dan kolom penawaran.
        </p>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          <input
            type="search"
            placeholder="Cari nama, email, atau telepon supplier..."
            value={partySearch}
            onChange={(e) => setPartySearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        {loadingParties ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Memuat Party Master...
          </div>
        ) : partyMaster.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-center text-xs text-slate-400">
            Supplier tidak ditemukan di Party Master.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {partyMaster.map((vendor) => {
              const isSelected = activeSuppliers.some(
                (s) => String(s._id || s) === String(vendor._id),
              );
              return (
                <label
                  key={vendor._id}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs cursor-pointer transition ${
                    isSelected
                      ? "border-cyan-600 bg-cyan-950/40 text-cyan-200"
                      : "border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSupplier(vendor._id)}
                    className="mt-0.5 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-white block truncate">
                      {vendor.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {[vendor.email, vendor.phone]
                        .filter(Boolean)
                        .join(" · ") || "Party Master"}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingSetupCards;
