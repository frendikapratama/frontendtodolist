import { useState } from "react";
import FormParty from "./Form";
import { useParty } from "../../hook/useParty";
import { Trash2, Edit } from "lucide-react";

import { Search, Plus, X } from "lucide-react";

const IndexParty = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { partyQuery, deletePartyMutation } = useParty();
  const [selectedParty, setSelectedParty] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState(null);

  const partyList = partyQuery.data || [];

  // Filtering data berdasarkan pencarian nama
  const filteredPartyList = partyList.filter((party) =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const openCreateModal = () => {
    setSelectedParty(null);
    setIsFormOpen(true);
  };

  const openEditModal = (party) => {
    setSelectedParty(party);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedParty(null);
  };

  const openDeleteModal = (party) => setPartyToDelete(party);
  const closeDeleteModal = () => setPartyToDelete(null);

  const handleConfirmDelete = () => {
    if (!partyToDelete) return;
    deletePartyMutation.mutate(partyToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  return (
    <div className=" max-w-7xl mx-auto space-y-6">
      {/* STICKY HEADER & SEARCH BAR */}
      <div className="sticky top-2 z-30 py-4 px-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Party Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Manage and organize your party database efficiently.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* SEARCH INPUT */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full bg-black/40 text-white text-sm pl-9 pr-8 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/80 transition-all placeholder:text-gray-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* ADD BUTTON */}
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-medium text-sm text-white transition-all shadow-md shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              onClick={openCreateModal}
            >
              <Plus className="w-4 h-4" />
              Add Party
            </button>
          </div>
        </div>
      </div>

      {/* TABLE DATA SECTION */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {partyQuery.isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-blue-500"></span>
          </div>
        ) : filteredPartyList.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-gray-300 font-medium">
              {searchTerm ? "Party not found" : "No parties available"}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {searchTerm
                ? `No results found for "${searchTerm}". Try different keywords.`
                : "Add a new party to see it listed here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2 text-gray-400 text-xs font-semibold tracking-wider uppercase">
                  <th className="py-3.5 px-5 w-14">No</th>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">Phone</th>
                  <th className="py-3.5 px-5">Address</th>
                  <th className="py-3.5 px-5 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300 text-sm">
                {filteredPartyList.map((party, index) => (
                  <tr
                    key={party._id}
                    className="hover:bg-white/3 transition-colors group"
                  >
                    <td className="py-4 px-5 text-xs font-medium text-gray-500">
                      {index + 1}
                    </td>
                    <td className="py-4 px-5 font-medium text-white capitalize">
                      {party.name}
                    </td>
                    <td className="py-4 px-5 text-gray-400 text-xs">
                      {party.email || "-"}
                    </td>
                    <td className="py-4 px-5 text-gray-400 text-xs">
                      {party.phone || "-"}
                    </td>
                    <td className="py-4 px-5 text-gray-400 text-xs max-w-xs truncate">
                      {party.address || "-"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Edit Party"
                          className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors border border-transparent hover:border-amber-400/20 cursor-pointer"
                          onClick={() => openEditModal(party)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title="Delete Party"
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors border border-transparent hover:border-rose-400/20 cursor-pointer"
                          onClick={() => openDeleteModal(party)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeFormModal}
          />
          <div className="w-full max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h3 className="font-semibold text-lg">
                {selectedParty ? "Edit Party" : "Add Party"}
              </h3>
              <button
                onClick={closeFormModal}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <FormParty party={selectedParty} onClose={closeFormModal} />
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {partyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeDeleteModal}
          />
          <div className="w-full max-w-md bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 relative z-10 p-6 space-y-4">
            <h3 className="font-semibold text-lg text-rose-400">
              Delete Party
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{partyToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                onClick={closeDeleteModal}
                disabled={deletePartyMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-2 cursor-pointer"
                onClick={handleConfirmDelete}
                disabled={deletePartyMutation.isPending}
              >
                {deletePartyMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexParty;
