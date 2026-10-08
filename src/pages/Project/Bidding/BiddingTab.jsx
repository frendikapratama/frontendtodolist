import React from "react";
import { ArrowLeft, Check, Gavel, Plus, RefreshCw } from "lucide-react";
import { useBiddingTab } from "./hooks/useBiddingTab";
import { BiddingOverviewCards } from "./components/BiddingOverviewCards";
import { BiddingToolbar } from "./components/BiddingToolbar";
import { BiddingTable } from "./components/BiddingTable";
import { BiddingSetupCards } from "./components/BiddingSetupCards";
import {
  BiddingCard,
  BiddingProgressIndicator,
} from "./components/BiddingViews";
import {
  CreateBiddingModal,
  DeleteBiddingModal,
  FinishBiddingModal,
  BOQItemPickerModal,
  QuoteDetailModal,
} from "./components/BiddingModals";
import { statusLabel, currency } from "./biddingUtils";

export default function BiddingTab({
  projectId,
  project,
  tabContext,
  onClearTabContext,
  onNavigateToTab,
}) {
  const biddingData = useBiddingTab(
    projectId,
    project,
    tabContext,
    onClearTabContext,
    onNavigateToTab,
  );

  const {
    activeBidding,
    activeTotal,
    handleBackToList,
    saveSuccessMsg,
    hasUnsavedChanges,
    savingQuotes,
    handleSaveAllChanges,
    setShowFinishModal,
    finishValidation,
    showAuditMatrix,
    setShowAuditMatrix,
    handleUnitPriceChange,
    handleUpdateQuoteMeta,
    handleSelectWinner,
    handleSelectionReasonChange,
    quoteDetailModal,
    setQuoteDetailModal,
    showItemPickerModal,
    setShowItemPickerModal,
    boqItems,
    boqSections,
    selectedBoqIds,
    setSelectedBoqIds,
    boqSearch,
    setBoqSearch,
    boqSection,
    setBoqSection,
    updatingItems,
    handleSaveBOQItems,
    partySearch,
    setPartySearch,
    loadingParties,
    partyMaster,
    handleToggleSupplier,
    showFinishModal,
    finishing,
    handleFinishBidding,
    setShowCreateModal,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    loading,
    filteredBiddings,
    setActiveId,
    setBiddingToDelete,
    showCreateModal,
    createTitle,
    setCreateTitle,
    createDesc,
    setCreateDesc,
    handleCreateBidding,
    creating,
    biddingToDelete,
    deleting,
    handleDeleteBidding,
  } = biddingData;

  if (activeBidding) {
    const isFinished = activeBidding.status === "FINISHED";
    const activeSuppliers = activeBidding.suppliers || [];
    const items = activeBidding.items || [];

    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900/90 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <ArrowLeft size={14} />
              Daftar Bidding
            </button>
            <div className="h-4 w-px bg-slate-700" />
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isFinished
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-700/60"
                  : activeBidding.status === "IN_PROGRESS"
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {isFinished
                ? "✓ Bidding Selesai"
                : statusLabel(activeBidding.status)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <>
                {saveSuccessMsg && (
                  <span className="text-xs font-medium text-emerald-400 animate-fadeIn">
                    ✓ {saveSuccessMsg}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleSaveAllChanges}
                    disabled={savingQuotes}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-cyan-500/50 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-950 transition"
                  >
                    <RefreshCw
                      size={13}
                      className={savingQuotes ? "animate-spin" : ""}
                    />
                    {savingQuotes ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFinishModal(true)}
                  disabled={!finishValidation.isReady}
                  title={
                    !finishValidation.isReady
                      ? finishValidation.issues.join("\n")
                      : "Selesaikan pengadaan dan kunci hasil penawaran"
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    finishValidation.isReady
                      ? "bg-linear-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-950/50"
                      : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  }`}
                >
                  <Check size={14} />
                  Selesaikan Bidding
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header Information */}
        <div className="rounded-xl border border-slate-800 bg-linear-to-r from-slate-900 via-slate-900 to-slate-800/80 p-6 shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {activeBidding.title}
              </h1>
              {activeBidding.description && (
                <p className="text-sm text-slate-400">
                  {activeBidding.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                <span>
                  Project:{" "}
                  <strong className="text-slate-200">
                    {project?.name || "Planify"}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Jumlah Item:{" "}
                  <strong className="text-cyan-300">{items.length} BOQ</strong>
                </span>
                <span>•</span>
                <span>
                  Supplier Peserta:{" "}
                  <strong className="text-cyan-300">
                    {activeSuppliers.length} Vendor
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <BiddingProgressIndicator bid={activeBidding} />
              {activeTotal > 0 && (
                <div className="text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    {isFinished
                      ? "TOTAL HASIL BIDDING"
                      : "ESTIMASI TOTAL TERPILIH"}
                  </span>
                  <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400">
                    {currency(activeTotal)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Finished vs In-Progress Views */}
        {isFinished ? (
          <div className="space-y-6">
            <BiddingOverviewCards
              activeBidding={activeBidding}
              activeTotal={activeTotal}
            />
            <BiddingTable
              activeBidding={activeBidding}
              activeTotal={activeTotal}
              showAuditMatrix={showAuditMatrix}
              setShowAuditMatrix={setShowAuditMatrix}
              hasUnsavedChanges={hasUnsavedChanges}
              savingQuotes={savingQuotes}
              handleSaveAllChanges={handleSaveAllChanges}
              handleUnitPriceChange={handleUnitPriceChange}
              handleUpdateQuoteMeta={handleUpdateQuoteMeta}
              handleSelectWinner={handleSelectWinner}
              handleSelectionReasonChange={handleSelectionReasonChange}
              setQuoteDetailModal={setQuoteDetailModal}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <BiddingSetupCards
              items={items}
              activeSuppliers={activeSuppliers}
              onOpenItemPicker={() => setShowItemPickerModal(true)}
              partySearch={partySearch}
              setPartySearch={setPartySearch}
              loadingParties={loadingParties}
              partyMaster={partyMaster}
              onToggleSupplier={handleToggleSupplier}
            />

            <BiddingTable
              activeBidding={activeBidding}
              activeTotal={activeTotal}
              showAuditMatrix={showAuditMatrix}
              setShowAuditMatrix={setShowAuditMatrix}
              hasUnsavedChanges={hasUnsavedChanges}
              savingQuotes={savingQuotes}
              handleSaveAllChanges={handleSaveAllChanges}
              handleUnitPriceChange={handleUnitPriceChange}
              handleUpdateQuoteMeta={handleUpdateQuoteMeta}
              handleSelectWinner={handleSelectWinner}
              handleSelectionReasonChange={handleSelectionReasonChange}
              setQuoteDetailModal={setQuoteDetailModal}
            />

            {/* SECTION 4: SELESAIKAN BIDDING CHECKLIST & ACTION (PRD §11) */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Check className="text-cyan-400" size={18} />
                    Selesaikan Bidding
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Pastikan seluruh item BOQ sudah memiliki penawaran harga dan
                    supplier terpilih telah ditentukan sebelum menyelesaikan
                    pengadaan.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div
                      className={`flex items-center gap-1.5 ${
                        items.length ? "text-emerald-400" : "text-slate-500"
                      }`}
                    >
                      <Check size={14} />
                      <span>{items.length} Item BOQ</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        activeSuppliers.length
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      <Check size={14} />
                      <span>{activeSuppliers.length} Supplier Peserta</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        items.length && items.every((i) => i.quotations?.length)
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      <Check size={14} />
                      <span>Penawaran Lengkap</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        items.length && items.every((i) => i.selectedSupplier)
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      <Check size={14} />
                      <span>Supplier Terpilih</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFinishModal(true)}
                    disabled={!finishValidation.isReady}
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition shadow-lg ${
                      finishValidation.isReady
                        ? "bg-linear-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-950/60"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    <Check size={18} />
                    Selesaikan Bidding
                  </button>
                  {!finishValidation.isReady && (
                    <span className="text-[11px] text-amber-400/90 max-w-xs text-right">
                      {finishValidation.issues[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALS FOR ACTIVE BIDDING */}
        <QuoteDetailModal
          modalData={quoteDetailModal}
          onClose={() => setQuoteDetailModal(null)}
          onSave={handleUpdateQuoteMeta}
        />

        <BOQItemPickerModal
          isOpen={showItemPickerModal}
          onClose={() => setShowItemPickerModal(false)}
          boqItems={boqItems}
          boqSections={boqSections}
          selectedBoqIds={selectedBoqIds}
          setSelectedBoqIds={setSelectedBoqIds}
          boqSearch={boqSearch}
          setBoqSearch={setBoqSearch}
          boqSection={boqSection}
          setBoqSection={setBoqSection}
          onSave={handleSaveBOQItems}
          isUpdating={updatingItems}
        />

        <FinishBiddingModal
          isOpen={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          onConfirm={handleFinishBidding}
          isFinishing={finishing}
          itemCount={items.length}
          total={activeTotal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Bidding & Pengadaan Supplier
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Bandingkan penawaran harga dari supplier untuk setiap item BOQ dan
            tentukan supplier terpilih secara objektif dalam satu workflow
            sederhana.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-600 to-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950/50 hover:from-cyan-500 hover:to-cyan-400 transition"
        >
          <Plus size={16} />
          Buat Bidding Baru
        </button>
      </div>

      {/* Filter and Search Bar */}
      <BiddingToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Bidding Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400 gap-2">
          <RefreshCw className="animate-spin text-cyan-400" size={18} />
          <span className="text-xs">Memuat daftar bidding...</span>
        </div>
      ) : filteredBiddings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/50 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 text-cyan-400">
            <Gavel size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Belum Ada Bidding Pengadaan
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Mulai bandingkan penawaran harga supplier dengan membuat bidding
              pertama untuk project ini.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-md"
          >
            <Plus size={15} />
            Buat Bidding Sekarang
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBiddings.map((bid) => (
            <BiddingCard
              key={bid._id}
              bid={bid}
              onOpen={() => setActiveId(bid._id)}
              onDelete={(b) => setBiddingToDelete(b)}
            />
          ))}
        </div>
      )}

      {/* MODALS FOR LIST VIEW */}
      <CreateBiddingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={createTitle}
        setTitle={setCreateTitle}
        desc={createDesc}
        setDesc={setCreateDesc}
        onSubmit={handleCreateBidding}
        isSubmitting={creating}
      />

      <DeleteBiddingModal
        candidate={biddingToDelete}
        onClose={() => setBiddingToDelete(null)}
        onConfirm={handleDeleteBidding}
        isDeleting={deleting}
      />
    </div>
  );
}
