import React from "react";
import { Plus, AlertCircle, X, Coins, ListTree } from "lucide-react";
import { formatCurrency, STATUS_CONFIG } from "../budgetConstants";

export const BudgetModals = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleCreateSubmit,
  formBOQItemId,
  setFormBOQItemId,
  availableBOQForCreation,
  selectedBOQItem,
  formPlannedAmount,
  setFormPlannedAmount,
  formNotes,
  setFormNotes,
  formStatus,
  setFormStatus,
  createMutation,
  isEditModalOpen,
  setIsEditModalOpen,
  selectedBudget,
  handleEditSubmit,
  updateMutation,
  isDetailModalOpen,
  setIsDetailModalOpen,
  handleAddCostFromBudget,
  breakdownCosts,
  isBreakdownLoading,
  handleOpenCostBreakdown,
  handleOpenApproveModal,
  isApproveModalOpen,
  setIsApproveModalOpen,
  approvalAmount,
  setApprovalAmount,
  approvalNote,
  setApprovalNote,
  handleApproveStatus,
  updateStatusMutation,
  isCostBreakdownOpen,
  setIsCostBreakdownOpen,
  deleteCandidate,
  setDeleteCandidate,
  handleDeleteConfirm,
  deleteMutation,
}) => (
  <>
    {/* MODAL 1: CREATE BUDGET */}
    {isCreateModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsCreateModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Tambah Alokasi Budget
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
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>
                  -- Pilih item pekerjaan BOQ --
                </option>
                {availableBOQForCreation.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.itemCode ? `[${b.itemCode}] ` : ""}
                    {b.description} ({formatCurrency(b.totalPrice)})
                  </option>
                ))}
              </select>
              {availableBOQForCreation.length === 0 && (
                <p className="text-[11px] text-amber-400">
                  Semua BOQ Item saat ini sudah memiliki alokasi Budget.
                </p>
              )}
            </div>

            {/* Readonly BOQ Value Info Box (Sesuai PRD: Jangan diinput manual) */}
            {selectedBOQItem && (
              <div className="p-3 bg-slate-950/80 border border-white/5 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Section:</span>
                  <span className="text-slate-200">
                    {selectedBOQItem.section}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Satuan & Volume:</span>
                  <span className="text-slate-200">
                    {selectedBOQItem.quantity} {selectedBOQItem.unit} @{" "}
                    {formatCurrency(selectedBOQItem.unitPrice)}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5 font-semibold">
                  <span className="text-cyan-400">
                    BOQ Value (Dasar Nilai):
                  </span>
                  <span className="text-cyan-300 font-mono text-sm">
                    {formatCurrency(selectedBOQItem.totalPrice)}
                  </span>
                </div>
              </div>
            )}

            {/* Planned Budget Input */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Planned Budget (IDR) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                placeholder="Misal: 510000000"
                value={formPlannedAmount}
                onChange={(e) => setFormPlannedAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Perkiraan batas anggaran yang diajukan untuk item pekerjaan ini.
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Catatan (Opsional)
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Keterangan pengajuan budget..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                    name="status"
                    value="Draft"
                    checked={formStatus === "Draft"}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <span>Save Draft</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="Submitted"
                    checked={formStatus === "Submitted"}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <span>Submit untuk Approval</span>
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
                {createMutation.isPending ? "Menyimpan..." : "Simpan Budget"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL 2: EDIT BUDGET */}
    {isEditModalOpen && selectedBudget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsEditModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Edit Budget ({selectedBudget.budgetCode})
            </h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-white">
                {selectedBudget.boqItem?.description}
              </p>
              <p className="text-slate-400">
                BOQ Value: {formatCurrency(selectedBudget.boqValue)}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Planned Budget (IDR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={formPlannedAmount}
                onChange={(e) => setFormPlannedAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
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
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white disabled:opacity-50"
              >
                {updateMutation.isPending ? "Menyimpan..." : "Update Budget"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL: BUDGET DETAIL (Sesuai PRD CTA 2 & CTA 3) */}
    {isDetailModalOpen && selectedBudget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div
          className="fixed inset-0"
          onClick={() => setIsDetailModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative z-10 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header with Title and Primary CTA [+ Add Cost] */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    Detail Budget {selectedBudget.budgetCode}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      STATUS_CONFIG[selectedBudget.status]?.style ||
                      STATUS_CONFIG.Draft.style
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        STATUS_CONFIG[selectedBudget.status]?.dot ||
                        STATUS_CONFIG.Draft.dot
                      }`}
                    />
                    {selectedBudget.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rincian alokasi anggaran dan riwayat realisasi biaya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* PRIMARY CTA: [+ Add Cost] */}
              <button
                type="button"
                onClick={() => handleAddCostFromBudget(selectedBudget)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Cost</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overview Info Cards */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-white/5 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-white/5">
              <div>
                <span className="text-slate-500 text-[11px] block">
                  BOQ Item:
                </span>
                <span className="text-white font-semibold text-sm">
                  {selectedBudget.boqItem?.description || "-"}
                </span>
                {selectedBudget.boqItem?.section && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Section: {selectedBudget.boqItem.section}
                  </span>
                )}
              </div>
              <div className="sm:text-right">
                <span className="text-slate-500 text-[11px] block">
                  BOQ Value (Dasar Kontrak):
                </span>
                <span className="text-cyan-400 font-mono font-bold text-sm">
                  {formatCurrency(selectedBudget.boqValue)}
                </span>
              </div>
            </div>

            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-white/2 border border-white/5">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Planned Budget
                </span>
                <p className="font-mono font-semibold text-purple-300 text-xs mt-0.5">
                  {formatCurrency(selectedBudget.plannedAmount)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Approval Budget
                </span>
                <p className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                  {formatCurrency(selectedBudget.approvedAmount)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Actual Cost
                </span>
                <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                  {formatCurrency(selectedBudget.actualCost)}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">
                  Remaining Budget
                </span>
                <p
                  className={`font-mono font-bold text-xs mt-0.5 ${
                    selectedBudget.remainingBudget < 0
                      ? "text-rose-400"
                      : "text-blue-300"
                  }`}
                >
                  {formatCurrency(selectedBudget.remainingBudget)}
                </p>
              </div>
            </div>

            {selectedBudget.notes && (
              <div className="pt-2 text-slate-400 text-[11px] italic">
                Catatan: {selectedBudget.notes}
              </div>
            )}
          </div>

          {/* Section Cost / Actual Usage Breakdown */}
          <div className="flex-1 overflow-y-auto space-y-2 min-h-[140px] max-h-56">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ListTree className="w-3.5 h-3.5 text-amber-400" />
                <span>Cost / Actual Usage ({breakdownCosts.length})</span>
              </p>
              <button
                type="button"
                onClick={() => handleAddCostFromBudget(selectedBudget)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Cost Baru</span>
              </button>
            </div>

            {isBreakdownLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Memuat data riwayat Cost...
              </div>
            ) : breakdownCosts.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-dashed border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  Belum ada pengeluaran/cost tercatat untuk budget ini.
                </p>
                <button
                  type="button"
                  onClick={() => handleAddCostFromBudget(selectedBudget)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Entri Cost Pertama</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-slate-950/60">
                {breakdownCosts.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-white/2 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">
                          {c.costCode}
                        </span>
                        <span className="text-white font-medium">
                          {c.description}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {c.costDate
                          ? new Date(c.costDate).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">
                        {formatCurrency(c.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          c.status === "Approved"
                            ? "text-emerald-400"
                            : c.status === "Rejected"
                              ? "text-rose-400"
                              : "text-amber-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenCostBreakdown(selectedBudget);
                }}
                className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                View Costs List
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenApproveModal(selectedBudget);
                }}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Approval
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

    {/* MODAL 3: APPROVAL WORKFLOW (Sesuai PRD section 3) */}
    {isApproveModalOpen && selectedBudget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsApproveModalOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-lg w-full relative z-10 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-bold text-white text-base">
              Approval Budget ({selectedBudget.budgetCode})
            </h3>
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">BOQ Item:</span>
                <span className="text-white font-medium">
                  {selectedBudget.boqItem?.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BOQ Value:</span>
                <span className="text-cyan-400 font-mono font-medium">
                  {formatCurrency(selectedBudget.boqValue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Planned Budget:</span>
                <span className="text-purple-300 font-mono font-medium">
                  {formatCurrency(selectedBudget.plannedAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Approval Budget (Nilai Disetujui)
              </label>
              <input
                type="number"
                min="0"
                value={approvalAmount}
                onChange={(e) => setApprovalAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">
                Approval Note
              </label>
              <textarea
                rows={2}
                placeholder="Catatan persetujuan / alasan revisi..."
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleApproveStatus("Rejected")}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-xl"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleApproveStatus("Approved")}
                disabled={updateStatusMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white shadow-md shadow-emerald-600/20"
              >
                Approve Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* MODAL 4: BREAKDOWN COST PER BUDGET (Sesuai PRD Section 10) */}
    {isCostBreakdownOpen && selectedBudget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsCostBreakdownOpen(false)}
        />
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative z-10 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-white text-base">
                Realisasi Cost untuk {selectedBudget.budgetCode}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                BOQ Item: {selectedBudget.boqItem?.description}
              </p>
            </div>
            <button
              onClick={() => setIsCostBreakdownOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick summary header */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 rounded-xl border border-white/5 text-xs">
            <div>
              <span className="text-slate-500 text-[11px]">
                Approval Budget
              </span>
              <p className="font-bold font-mono text-emerald-400 mt-0.5">
                {formatCurrency(selectedBudget.approvedAmount)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">
                Actual Cost (Approved)
              </span>
              <p className="font-bold font-mono text-amber-400 mt-0.5">
                {formatCurrency(selectedBudget.actualCost)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 text-[11px]">Sisa Budget</span>
              <p
                className={`font-bold font-mono mt-0.5 ${selectedBudget.remainingBudget < 0 ? "text-rose-400" : "text-blue-300"}`}
              >
                {formatCurrency(selectedBudget.remainingBudget)}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-60">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Daftar Entri Biaya Terkait ({breakdownCosts.length}):
            </p>
            {isBreakdownLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Memuat data Cost...
              </div>
            ) : breakdownCosts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 text-center">
                Belum ada entri Cost yang dicatat untuk Budget ini. Catat
                pengeluaran di tab <strong>"Cost"</strong>.
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-slate-950/50">
                {breakdownCosts.map((c) => (
                  <div
                    key={c._id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-white/2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">
                          {c.costCode}
                        </span>
                        <span className="text-white font-medium">
                          {c.description}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {c.costDate
                          ? new Date(c.costDate).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white block">
                        {formatCurrency(c.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          c.status === "Approved"
                            ? "text-emerald-400"
                            : c.status === "Rejected"
                              ? "text-rose-400"
                              : "text-amber-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleAddCostFromBudget(selectedBudget)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Cost</span>
            </button>
            <button
              onClick={() => setIsCostBreakdownOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )}

    {/* MODAL 5: DELETE CONFIRMATION */}
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
            <h3 className="font-bold text-white text-base">Hapus Budget</h3>
          </div>
          <p className="text-xs text-slate-300">
            Yakin ingin menghapus budget{" "}
            <strong className="text-white">{deleteCandidate.budgetCode}</strong>
            ? Tindakan ini tidak dapat dibatalkan.
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
