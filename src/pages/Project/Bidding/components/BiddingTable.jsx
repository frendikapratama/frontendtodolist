import React from "react";
import {
  Award,
  Check,
  DollarSign,
  FileText,
  Gavel,
  RefreshCw,
} from "lucide-react";
import { currency } from "../biddingUtils";

export const BiddingTable = ({
  activeBidding,
  activeTotal,
  showAuditMatrix,
  setShowAuditMatrix,
  hasUnsavedChanges,
  savingQuotes,
  handleSaveAllChanges,
  handleUnitPriceChange,
  handleSelectWinner,
  handleSelectionReasonChange,
  setQuoteDetailModal,
}) => {
  if (!activeBidding) return null;

  const isFinished = activeBidding.status === "FINISHED";
  const activeSuppliers = activeBidding.suppliers || [];
  const items = activeBidding.items || [];

  if (isFinished) {
    return (
      <div className="space-y-6 animate-fadeIn">
        {/* TABEL HASIL BIDDING */}
        <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-md overflow-hidden">
          <div className="border-b border-slate-700/80 bg-slate-800/80 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Check className="text-emerald-400" size={18} />
                Tabel Hasil Bidding
              </h2>
              <p className="text-xs text-slate-400">
                Daftar item BOQ dengan supplier terpilih beserta harga dan
                totalnya.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAuditMatrix(!showAuditMatrix)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition"
            >
              <FileText size={14} />
              {showAuditMatrix
                ? "Sembunyikan Matriks Lengkap"
                : "Lihat Semua Penawaran"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-700 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Item BOQ</th>
                  <th className="py-3.5 px-4 text-right">Volume (Qty)</th>
                  <th className="py-3.5 px-4">Supplier Terpilih</th>
                  <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4">Syarat / Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {items.map((item, idx) => {
                  const boq = item.boqItem || {};
                  const selectedSupplierId =
                    item.selectedSupplier?._id || item.selectedSupplier;
                  const selectedQuote = item.quotations?.find(
                    (q) =>
                      String(q.supplier?._id || q.supplier) ===
                      String(selectedSupplierId),
                  );
                  const unitPrice = selectedQuote?.unitPrice || 0;
                  const qty = boq.quantity || 0;
                  const itemTotal = qty * unitPrice;
                  const supplierName =
                    item.selectedSupplier?.name ||
                    activeSuppliers.find(
                      (s) => String(s._id || s) === String(selectedSupplierId),
                    )?.name ||
                    "Supplier Terpilih";

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 text-center font-medium text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">
                          {boq.description || "-"}
                        </div>
                        {boq.specification && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {boq.specification}
                          </div>
                        )}
                        {boq.itemCode && (
                          <span className="inline-block mt-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-400">
                            {boq.itemCode}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-white">{qty}</span>{" "}
                        <span className="text-xs text-slate-400">
                          {boq.unit || "unit"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                          <Award size={13} className="text-cyan-400" />
                          {supplierName}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-slate-200">
                        {currency(unitPrice)}
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-cyan-300">
                        {currency(itemTotal)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-300">
                          {item.selectionReason ? (
                            <p className="italic text-slate-300">
                              "{item.selectionReason}"
                            </p>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                          {(selectedQuote?.leadTime ||
                            selectedQuote?.paymentTerm) && (
                            <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-400">
                              {selectedQuote?.leadTime && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5">
                                  LT: {selectedQuote.leadTime}
                                </span>
                              )}
                              {selectedQuote?.paymentTerm && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5">
                                  TOP: {selectedQuote.paymentTerm}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-700 bg-slate-950/90 font-bold">
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-6 text-right text-sm text-slate-300 uppercase"
                  >
                    TOTAL KESELURUHAN BIDDING:
                  </td>
                  <td className="py-4 px-4 text-right text-lg text-emerald-400">
                    {currency(activeTotal)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* AUDIT / FULL COMPARISON MATRIX */}
        {showAuditMatrix && (
          <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-md overflow-hidden animate-fadeIn">
            <div className="border-b border-slate-700 bg-slate-800/80 px-6 py-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-cyan-400" />
                Matriks Perbandingan Lengkap Semua Supplier
              </h3>
              <p className="text-xs text-slate-400">
                Arsip harga, waktu pengiriman, syarat pembayaran, dan catatan
                dari setiap supplier peserta.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-700 bg-slate-950/70 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Item BOQ</th>
                    <th className="py-3.5 px-4 text-right">Qty</th>
                    {activeSuppliers.map((supp) => (
                      <th
                        key={supp._id || supp}
                        className="py-3.5 px-4 text-center"
                      >
                        {supp.name}
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-center">Pemenang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item, idx) => {
                    const boq = item.boqItem || {};
                    const selectedId = String(
                      item.selectedSupplier?._id || item.selectedSupplier,
                    );
                    return (
                      <tr
                        key={item._id || idx}
                        className="hover:bg-slate-800/40"
                      >
                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          {boq.description || "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">
                          {boq.quantity} {boq.unit}
                        </td>
                        {activeSuppliers.map((supp) => {
                          const suppId = String(supp._id || supp);
                          const q = item.quotations?.find(
                            (entry) =>
                              String(entry.supplier?._id || entry.supplier) ===
                              suppId,
                          );
                          const isSelected = selectedId === suppId;
                          return (
                            <td
                              key={suppId}
                              className={`py-3.5 px-4 text-center ${
                                isSelected
                                  ? "bg-cyan-950/40 font-bold text-cyan-300"
                                  : "text-slate-300"
                              }`}
                            >
                              {q ? (
                                <div>
                                  <div>{currency(q.unitPrice)}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">
                                    Total:{" "}
                                    {currency(
                                      (boq.quantity || 0) * q.unitPrice,
                                    )}
                                  </div>
                                  {(q.leadTime || q.paymentTerm || q.notes) && (
                                    <div className="mt-2 space-y-1 border-t border-slate-700/70 pt-2 text-left text-[10px] font-normal leading-relaxed text-slate-300">
                                      {q.leadTime && (
                                        <div>
                                          <span className="font-semibold text-slate-400">
                                            Waktu pengiriman:{" "}
                                          </span>
                                          {q.leadTime}
                                        </div>
                                      )}
                                      {q.paymentTerm && (
                                        <div>
                                          <span className="font-semibold text-slate-400">
                                            Syarat pembayaran:{" "}
                                          </span>
                                          {q.paymentTerm}
                                        </div>
                                      )}
                                      {q.notes && (
                                        <div className="whitespace-pre-wrap wrap-break-word">
                                          <span className="font-semibold text-slate-400">
                                            Catatan:{" "}
                                          </span>
                                          {q.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="py-3.5 px-4 text-center">
                          <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                            {item.selectedSupplier?.name || "Terpilih"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-lg overflow-hidden">
      <div className="border-b border-slate-700 bg-slate-800/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="text-cyan-400" size={18} />
            3. Tabel Penawaran & Perbandingan Harga
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Masukkan harga satuan supplier, bandingkan total otomatis (Qty ×
            Harga), dan tentukan supplier terpilih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={handleSaveAllChanges}
              disabled={savingQuotes}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-sm"
            >
              <RefreshCw
                size={13}
                className={savingQuotes ? "animate-spin" : ""}
              />
              {savingQuotes ? "Menyimpan..." : "Simpan Penawaran"}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 || activeSuppliers.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Gavel size={24} />
          </div>
          <h3 className="text-sm font-semibold text-white">
            Tabel Belum Siap Ditampilkan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Pilih minimal <strong>1 Item BOQ</strong> dan{" "}
            <strong>1 Supplier Peserta</strong> pada bagian di atas untuk mulai
            memasukkan dan membandingkan harga.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-sm">
          <table className="w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
            <thead className="bg-slate-950">
              <tr>
                {/* No */}
                <th
                  className="
            sticky left-0 z-40
            w-12 border-b border-slate-800
            bg-slate-950 px-4 py-3.5
            text-center text-[11px] font-semibold
            uppercase tracking-wider text-slate-500
          "
                >
                  No
                </th>

                {/* Item BOQ */}
                <th
                  className="
            sticky left-12 z-40
            min-w-[220px] border-b border-r border-slate-800
            bg-slate-950 px-4 py-3.5
            text-[11px] font-semibold
            uppercase tracking-wider text-slate-500
          "
                >
                  Item BOQ
                </th>

                {/* Quantity */}
                <th
                  className="
            sticky left-[268px] z-40
            w-24 border-b border-r-2 border-slate-700
            bg-slate-950 px-3 py-3.5
            text-right text-[11px] font-semibold
            uppercase tracking-wider text-slate-500
            shadow-[2px_0_6px_rgba(0,0,0,0.35)]
          "
                >
                  Qty
                </th>

                {/* Supplier Columns */}
                {activeSuppliers.map((supplier) => (
                  <th
                    key={supplier._id || supplier}
                    className="
              min-w-[190px]
              border-b border-l border-slate-800
              bg-slate-950 px-4 py-3.5
              text-center
            "
                  >
                    <div className="truncate text-xs font-semibold text-slate-200">
                      {supplier.name}
                    </div>

                    <div className="mt-0.5 truncate text-[10px] font-normal text-slate-500">
                      {supplier.phone || supplier.email || "Peserta"}
                    </div>
                  </th>
                ))}

                {/* Selected Supplier */}
                <th
                  className="
            min-w-[260px]
            border-b border-l border-slate-800
            bg-slate-900/80 px-4 py-3.5
            text-left
          "
                >
                  <div className="text-xs font-semibold text-cyan-400">
                    Supplier Terpilih
                  </div>
                  <div className="mt-0.5 text-[10px] font-normal text-slate-500">
                    Supplier & alasan pemilihan
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {items.map((item, idx) => {
                const boq = item.boqItem || {};
                const qty = boq.quantity || 0;

                const currentWinnerId = String(
                  item.selectedSupplier?._id || item.selectedSupplier || "",
                );

                const validQuotes = (item.quotations || []).filter(
                  (quotation) =>
                    quotation.unitPrice && Number(quotation.unitPrice) > 0,
                );

                const minPrice = validQuotes.length
                  ? Math.min(
                      ...validQuotes.map((quotation) =>
                        Number(quotation.unitPrice),
                      ),
                    )
                  : null;

                return (
                  <tr
                    key={item._id || idx}
                    className="
              group
              transition-colors
              hover:bg-slate-900/40
            "
                  >
                    {/* No */}
                    <td
                      className="
                sticky left-0 z-30
                border-b border-slate-800
                bg-slate-950
                px-4 py-4
                text-center text-xs font-medium text-slate-500
                transition-colors
                group-hover:bg-slate-900
              "
                    >
                      {idx + 1}
                    </td>

                    {/* Item BOQ */}
                    <td
                      className="
                sticky left-12 z-30
                border-b border-r border-slate-800
                bg-slate-950
                px-4 py-4
                transition-colors
                group-hover:bg-slate-900
              "
                    >
                      <div className="font-medium leading-5 text-slate-100">
                        {boq.description || "-"}
                      </div>

                      {boq.specification && (
                        <div className="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                          {boq.specification}
                        </div>
                      )}

                      {boq.itemCode && (
                        <span
                          className="
                    mt-2 inline-flex
                    rounded-md
                    border border-slate-700
                    bg-slate-900
                    px-1.5 py-0.5
                    font-mono text-[10px]
                    text-cyan-400
                  "
                        >
                          {boq.itemCode}
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td
                      className="
                sticky left-[268px] z-30
                border-b border-r-2 border-slate-700
                bg-slate-950
                px-3 py-4
                text-right
                transition-colors
                group-hover:bg-slate-900
                shadow-[2px_0_6px_rgba(0,0,0,0.35)]
              "
                    >
                      <div className="font-semibold text-slate-100">{qty}</div>

                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {boq.unit || "unit"}
                      </div>
                    </td>

                    {/* =====================================================
                SUPPLIER QUOTATIONS
            ===================================================== */}
                    {activeSuppliers.map((supplier) => {
                      const supplierId = String(supplier._id || supplier);

                      const quotation = item.quotations?.find(
                        (entry) =>
                          String(entry.supplier?._id || entry.supplier) ===
                          supplierId,
                      );

                      const unitPrice = quotation?.unitPrice || 0;
                      const subtotal = qty * unitPrice;

                      const isLowest =
                        minPrice &&
                        unitPrice === minPrice &&
                        validQuotes.length > 1;

                      const isSelectedWinner = currentWinnerId === supplierId;

                      return (
                        <td
                          key={supplierId}
                          className={`
                    border-b border-l border-slate-800
                    px-4 py-3.5
                    align-top
                    transition-colors
                    ${isSelectedWinner ? "bg-cyan-950/20" : "bg-transparent"}
                  `}
                        >
                          <div className="space-y-2">
                            {/* Price Input */}
                            <div className="relative">
                              <span
                                className="
                          pointer-events-none
                          absolute left-2.5 top-1/2
                          -translate-y-1/2
                          text-[11px] font-medium
                          text-slate-500
                        "
                              >
                                Rp
                              </span>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                value={unitPrice || ""}
                                onChange={(e) =>
                                  handleUnitPriceChange(
                                    idx,
                                    supplierId,
                                    e.target.value,
                                  )
                                }
                                className="
                          w-full rounded-lg
                          border border-slate-700
                          bg-slate-900
                          py-2 pl-8 pr-2
                          text-xs font-semibold
                          text-slate-100
                          placeholder:text-slate-600
                          outline-none
                          transition
                          focus:border-cyan-500
                          focus:ring-1
                          focus:ring-cyan-500/20
                        "
                              />
                            </div>

                            {/* Subtotal */}
                            <div
                              className="
                        flex items-center
                        justify-between
                        border-b border-slate-800/80
                        pb-1.5
                        text-[11px]
                      "
                            >
                              <span className="text-slate-500">Total</span>

                              <span className="font-semibold text-slate-300">
                                {currency(subtotal)}
                              </span>
                            </div>

                            {/* Status + Detail */}
                            <div className="flex items-center justify-between gap-2">
                              {isLowest ? (
                                <span
                                  className="
                            inline-flex items-center
                            rounded-md
                            border border-emerald-800/60
                            bg-emerald-950/50
                            px-1.5 py-0.5
                            text-[10px] font-medium
                            text-emerald-400
                          "
                                >
                                  Harga Terendah
                                </span>
                              ) : (
                                <span />
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setQuoteDetailModal({
                                    itemIndex: idx,
                                    supplierId,
                                    supplierName: supplier.name,
                                    leadTime: quotation?.leadTime || "",
                                    paymentTerm: quotation?.paymentTerm || "",
                                    notes: quotation?.notes || "",
                                  })
                                }
                                className="
                          text-[10px] font-medium
                          text-cyan-400
                          transition-colors
                          hover:text-cyan-300
                          hover:underline
                        "
                              >
                                {quotation?.leadTime ||
                                quotation?.paymentTerm ||
                                quotation?.notes
                                  ? "Detail ✓"
                                  : "+ Tambah Detail"}
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td
                      className="
                border-b border-l border-slate-800
                bg-slate-900/60
                px-4 py-3.5
                align-top
              "
                    >
                      <div className="space-y-2">
                        {/* Supplier Selection */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Supplier
                          </label>

                          <select
                            value={currentWinnerId}
                            onChange={(e) =>
                              handleSelectWinner(idx, e.target.value)
                            }
                            className="
                      w-full rounded-lg
                      border border-slate-700
                      bg-slate-900
                      px-2.5 py-2
                      text-xs font-medium
                      text-slate-200
                      outline-none
                      transition
                      focus:border-cyan-500
                      focus:ring-1
                      focus:ring-cyan-500/20
                    "
                          >
                            <option value="">Pilih supplier</option>

                            {activeSuppliers.map((supplier) => {
                              const supplierId = String(
                                supplier._id || supplier,
                              );

                              const quotation = item.quotations?.find(
                                (entry) =>
                                  String(
                                    entry.supplier?._id || entry.supplier,
                                  ) === supplierId,
                              );

                              return (
                                <option key={supplierId} value={supplierId}>
                                  {supplier.name}
                                  {quotation?.unitPrice
                                    ? ` (${currency(quotation.unitPrice)})`
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Selection Reason */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-slate-500">
                            Alasan Pemilihan
                          </label>

                          <input
                            type="text"
                            placeholder="Masukkan alasan pemilihan..."
                            value={item.selectionReason || ""}
                            onChange={(e) =>
                              handleSelectionReasonChange(idx, e.target.value)
                            }
                            className="
                      w-full rounded-lg
                      border border-slate-700
                      bg-slate-900
                      px-2.5 py-2
                      text-xs text-slate-200
                      placeholder:text-slate-600
                      outline-none
                      transition
                      focus:border-cyan-500
                      focus:ring-1
                      focus:ring-cyan-500/20
                    "
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="bg-slate-950">
                <td
                  colSpan={3}
                  className="
            sticky left-0 z-30
            border-r-2 border-t-2 border-slate-700
            bg-slate-950
            px-4 py-4
            text-right
            shadow-[2px_0_6px_rgba(0,0,0,0.35)]
          "
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Per Supplier
                  </span>
                </td>

                {activeSuppliers.map((supplier) => {
                  const supplierId = String(supplier._id || supplier);

                  const supplierTotal = items.reduce((sum, item) => {
                    const quotation = item.quotations?.find(
                      (entry) =>
                        String(entry.supplier?._id || entry.supplier) ===
                        supplierId,
                    );

                    const unitPrice = quotation?.unitPrice || 0;

                    const quantity = item.boqItem?.quantity || 0;

                    return sum + quantity * unitPrice;
                  }, 0);

                  return (
                    <td
                      key={supplierId}
                      className="
                border-l border-t-2 border-slate-800
                px-4 py-4
                text-center
              "
                    >
                      <span className="text-xs font-semibold text-slate-300">
                        {currency(supplierTotal)}
                      </span>
                    </td>
                  );
                })}

                {/* Selected Supplier Total */}
                <td
                  className="
            border-l border-t-2 border-slate-700
            bg-slate-900
            px-4 py-4
          "
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Total Supplier Terpilih
                  </div>

                  <div className="mt-1 text-lg font-bold text-cyan-400">
                    {currency(activeTotal)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default BiddingTable;
