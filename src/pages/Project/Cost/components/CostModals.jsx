import React from "react";
import { AlertCircle, X, Coins, AlertTriangle, Receipt } from "lucide-react";
import { formatCurrency, formatDate, STATUS_CONFIG } from "../costConstants";

export const CostModals = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleCreateSubmit,
  formBOQItemId,
  setFormBOQItemId,
  allBudgets,
  linkedBudgetForCreation,
  formCostDate,
  setFormCostDate,
  formAmount,
  setFormAmount,
  isOverBudget,
  overBudgetAmount,
  formDescription,
  setFormDescription,
  formNotes,
  setFormNotes,
  formStatus,
  setFormStatus,
  createMutation,
  isDetailModalOpen,
  setIsDetailModalOpen,
  selectedCost,
  onNavigateToTab,
  handleOpenStatusModal,
  isEditModalOpen,
  setIsEditModalOpen,
  handleEditSubmit,
  updateMutation,
  isStatusModalOpen,
  setIsStatusModalOpen,
  handleUpdateStatus,
  updateStatusMutation,
  deleteCandidate,
  setDeleteCandidate,
  handleDeleteConfirm,
  deleteMutation,
}) => (
  <>
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsCreateModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Catat Realisasi Biaya (Cost)
            </h3>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {/* Select BOQ Item */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Pilih BOQ Item <span className="text-rose-400">*</span>
              </label>
              <select
                value={formBOQItemId}
                onChange={(e) => setFormBOQItemId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="" disabled>
                  -- Pilih item pekerjaan yang telah memiliki Budget --
                </option>
                {allBudgets.map((b) => (
                  <option key={b.boqItem?._id} value={b.boqItem?._id}>
                    [{b.budgetCode}] {b.boqItem?.description} (Sisa Budget:{" "}
                    {formatCurrency(b.remainingBudget)})
                  </option>
                ))}
              </select>
              {allBudgets.length === 0 && (
                <p className="text-[11px] text-rose-400">
                  Belum ada Budget yang dibuat untuk proyek ini. Harap buat
                  Budget terlebih dahulu di tab Budget.
                </p>
              )}
            </div>

            {/* Linked Budget Overview Box (Sesuai PRD Section 7: User tidak perlu mengetik Budget Code manual) */}
            {linkedBudgetForCreation && (
              <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Budget Code Terkait:</span>
                  <span className="text-purple-300 font-mono font-semibold">
                    {linkedBudgetForCreation.budgetCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Approval Budget:</span>
                  <span className="text-emerald-400 font-mono">
                    {formatCurrency(linkedBudgetForCreation.approvedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">
                    Actual Cost (Berjalan):
                  </span>
                  <span className="text-amber-400 font-mono">
                    {formatCurrency(linkedBudgetForCreation.actualCost)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5 font-bold">
                  <span className="text-cyan-400">Remaining Budget:</span>
                  <span
                    className={`font-mono ${linkedBudgetForCreation.remainingBudget < 0 ? "text-rose-400" : "text-cyan-300"}`}
                  >
                    {formatCurrency(linkedBudgetForCreation.remainingBudget)}
                  </span>
                </div>
              </div>
            )}

            {/* Tanggal & Nilai Biaya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Tanggal Cost <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formCostDate}
                  onChange={(e) => setFormCostDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Nilai Biaya (Amount) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Misal: 120000000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Over Budget Warning (PRD Section 8) */}
            {isOverBudget && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Peringatan Over-Budget:</span>
                  <p className="text-[11px] mt-0.5 text-amber-200/90">
                    Nilai Cost melebihi sisa Remaining Budget sebesar{" "}
                    {formatCurrency(overBudgetAmount)}.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Deskripsi Biaya <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Pengadaan beton tahap 1"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                placeholder="Keterangan rincian cost..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Status Action */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Status Awal
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="costStatus"
                    value="Draft"
                    checked={formStatus === "Draft"}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <span>Save Draft</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="costStatus"
                    value="Submitted"
                    checked={formStatus === "Submitted"}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <span>Submit Approval</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !formBOQItemId}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
              >
                {createMutation.isPending ? "Menyimpan..." : "Simpan Cost"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL: DETAIL COST */}
    {isDetailModalOpen && selectedCost && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div
          className="fixed inset-0"
          onClick={() => setIsDetailModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Detail Cost ({selectedCost.costCode})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rincian realisasi pengeluaran proyek
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-2.5 text-xs">
            <div className="flex justify-between items-start">
              <span className="text-slate-500">Deskripsi:</span>
              <span className="text-white font-semibold text-right max-w-[280px]">
                {selectedCost.description}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tanggal Transaksi:</span>
              <span className="text-slate-200">
                {formatDate(selectedCost.costDate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Nominal Biaya:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                {formatCurrency(selectedCost.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status Persetujuan:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  STATUS_CONFIG[selectedCost.status]?.style ||
                  STATUS_CONFIG.Draft.style
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    STATUS_CONFIG[selectedCost.status]?.dot ||
                    STATUS_CONFIG.Draft.dot
                  }`}
                />
                {selectedCost.status}
              </span>
            </div>

            {/* Linked BOQ & Budget Info */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">BOQ Item Terkait:</span>
                <span className="text-slate-300 font-medium text-right truncate max-w-[220px]">
                  {selectedCost.boqItem?.description || "-"}
                </span>
              </div>
              {selectedCost.budget && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Budget Code:</span>
                  <span className="text-purple-300 font-mono font-semibold">
                    {selectedCost.budget.budgetCode}
                  </span>
                </div>
              )}
              {/* Traceability for bidding-sourced costs (PRD §39) */}
              {selectedCost.sourceType === "bidding" && (
                <>
                  {selectedCost.supplier && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Supplier:</span>
                      <span className="text-cyan-300 font-semibold">
                        {selectedCost.supplier?.name || "-"}
                      </span>
                    </div>
                  )}
                  {selectedCost.unitPrice != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Unit Price:</span>
                      <span className="text-slate-200 font-mono">
                        {formatCurrency(selectedCost.unitPrice)}
                      </span>
                    </div>
                  )}
                  {selectedCost.quantity != null && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Quantity:</span>
                      <span className="text-slate-200 font-mono">
                        {selectedCost.quantity} × {formatCurrency(selectedCost.unitPrice)} = {formatCurrency(selectedCost.amount)}
                      </span>
                    </div>
                  )}
                  {selectedCost.sourceId && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Bidding:</span>
                      <span className="text-slate-300 text-right truncate max-w-[180px]">
                        {selectedCost.sourceId?.title || "-"}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedCost.notes && (
              <div className="pt-1.5 border-t border-white/5 text-slate-400 text-[11px] italic">
                Catatan: {selectedCost.notes}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              {selectedCost.budget && onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onNavigateToTab("budget", {
                      focusBudgetId: selectedCost.budget._id,
                    });
                  }}
                  className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>View Budget</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenStatusModal(selectedCost);
                }}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Ubah Status
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}

    {/* EDIT COST MODAL */}
    {isEditModalOpen && selectedCost && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsEditModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Edit Cost ({selectedCost.costCode})
            </h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Tanggal Cost
                </label>
                <input
                  type="date"
                  required
                  value={formCostDate}
                  onChange={(e) => setFormCostDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Deskripsi Biaya
              </label>
              <input
                type="text"
                required
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Catatan
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Update Cost"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* APPROVAL STATUS WORKFLOW MODAL */}
    {isStatusModalOpen && selectedCost && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsStatusModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Approval Cost ({selectedCost.costCode})
            </h3>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1.5 text-xs">
            <p className="font-medium text-white">{selectedCost.description}</p>
            <p className="text-cyan-400 font-mono font-bold">
              {formatCurrency(selectedCost.amount)}
            </p>
            <p className="text-[11px] text-slate-500">
              Status Saat Ini: {selectedCost.status}
            </p>
          </div>

          <p className="text-xs text-slate-400">
            Ubah status persetujuan cost. Cost dengan status{" "}
            <strong>Approved</strong> akan dihitung sebagai <em>Actual Cost</em>{" "}
            pada alokasi budget terkait.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleUpdateStatus("Approved")}
              disabled={updateStatusMutation.isPending}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition"
            >
              Approve Cost
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("Rejected")}
              disabled={updateStatusMutation.isPending}
              className="w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl transition"
            >
              Reject Cost
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("Submitted")}
              disabled={updateStatusMutation.isPending}
              className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-xl transition"
            >
              Set to Submitted
            </button>
          </div>
        </div>
      </div>
    )}

    {/* DELETE CONFIRMATION */}
    {deleteCandidate && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setDeleteCandidate(null)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Hapus Cost</h3>
          </div>
          <p className="text-xs text-slate-300">
            Yakin ingin menghapus entri cost{" "}
            <strong className="text-white">{deleteCandidate.costCode}</strong> (
            {formatCurrency(deleteCandidate.amount)})?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteCandidate(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-semibold rounded-xl text-white"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
