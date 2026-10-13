import React from "react";
import { Layers, Plus, Users, X, UserPlus } from "lucide-react";

export const BiddingSetupCards = ({
  items = [],
  activeSuppliers = [],
  onOpenItemPicker,
  onOpenSupplierPicker,
  onRemoveSupplier,
  isFinished = false,
}) => {
  return (
    <div className="grid gap-6 lg:grid-cols-12 animate-fadeIn">
      {/* BOQ Items Card */}
      <div className="lg:col-span-6 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              1. Item BOQ Pengadaan
            </h2>
          </div>
          {!isFinished && (
            <button
              type="button"
              onClick={onOpenItemPicker}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-700/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-600 transition"
            >
              <Plus size={13} />
              {items.length ? "Atur Item BOQ" : "Pilih Item BOQ"}
            </button>
          )}
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
            {!isFinished && (
              <button
                type="button"
                onClick={onOpenItemPicker}
                className="mt-2 text-xs font-semibold text-cyan-400 hover:underline"
              >
                + Pilih item sekarang
              </button>
            )}
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

      {/* Supplier Peserta Card */}
      <div className="lg:col-span-6 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="text-cyan-400" size={18} />
            <h2 className="text-base font-bold text-white">
              2. Supplier Peserta
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {activeSuppliers.length} Dipilih
            </span>
            {!isFinished && (
              <button
                type="button"
                onClick={onOpenSupplierPicker}
                className="inline-flex items-center gap-1 rounded-lg bg-cyan-700/80 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-cyan-600 transition"
              >
                <UserPlus size={13} />
                Tambah Supplier
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400">
          Supplier yang dipilih akan menjadi peserta bidding dan memiliki kolom
          penawaran harga pada tabel perbandingan.
        </p>

        {activeSuppliers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center space-y-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-slate-500">
              <Users size={20} />
            </div>
            <p className="text-xs text-slate-400">
              Belum ada supplier yang ditambahkan.
            </p>
            {!isFinished && (
              <button
                type="button"
                onClick={onOpenSupplierPicker}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-600 transition"
              >
                <UserPlus size={13} />
                Tambah Supplier Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeSuppliers.map((vendor) => (
              <div
                key={vendor._id || String(vendor)}
                className="flex items-center justify-between rounded-lg border border-cyan-800/40 bg-cyan-950/20 px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white block truncate">
                    {vendor.name || "Supplier"}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {[vendor.email, vendor.phone]
                      .filter(Boolean)
                      .join(" · ") || "Party Master"}
                  </span>
                </div>
                {!isFinished && (
                  <button
                    type="button"
                    onClick={() => onRemoveSupplier(vendor._id || String(vendor))}
                    title="Keluarkan supplier"
                    className="ml-2 rounded-md p-1 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiddingSetupCards;
