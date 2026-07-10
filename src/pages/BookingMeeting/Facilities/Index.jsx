import { useState } from "react";
import { FacilitiesForm } from "./Form";
import { useFacilities } from "../../../hook/BookingMeeting/useFacilities";
import { Edit, Trash2, Boxes, Search } from "lucide-react";
const IndexFacilities = () => {
  const {
    facilitesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    page,
    goToPage,
    nextPage,
    prevPage,
    limit,
    search,
    setSearch,
    debouncedSearch,
  } = useFacilities();

  const [selectedFacility, setSelectedFacility] = useState(null);

  const openCreateModal = () => {
    setSelectedFacility(null);
    document.getElementById("facilityModal").showModal();
  };

  const openEditModal = (facility) => {
    setSelectedFacility(facility);
    document.getElementById("facilityModal").showModal();
  };

  const closeModal = () => {
    setSelectedFacility(null);
    document.getElementById("facilityModal").close();
  };

  const openDeleteModal = (facility) => {
    setSelectedFacility(facility);
    document.getElementById("deleteFacilityModal").showModal();
  };

  const closeDeleteModal = () => {
    document.getElementById("deleteFacilityModal").close();
    setTimeout(() => {
      setSelectedFacility(null);
    }, 150);
  };

  const handleSubmit = async (data) => {
    if (selectedFacility) {
      return updateMutation.mutateAsync({
        id: selectedFacility._id,
        data,
      });
    }

    return createMutation.mutateAsync(data);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this facility?",
    );
    if (!confirmDelete) return;
    deleteMutation.mutate(id);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const getPageNumbers = () => {
    const totalPages = facilitesQuery.data?.pagination?.totalPages || 1;
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = page - 2; i <= page + 2; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (facilitesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  const facilities = facilitesQuery.data?.data || [];
  const totalItems = facilitesQuery.data?.pagination?.total || 0;
  const hasData = facilities.length > 0;

  return (
    <div className="space-y-6">
      {/* Header - Disamakan Temanya dengan TableMeeting */}
      <div className="sticky top-0 z-10 bg-linear-to-b from-slate-900/80 to-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 p-5 transition-all duration-300 shadow-xl shadow-black/20 overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <Boxes />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Facilities Management
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                  {totalItems || 0} Total
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage and organize company meeting room facilities.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Search & Actions Panel */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search facilities..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all pl-10 text-sm"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

              {facilitesQuery.isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="loading loading-spinner loading-sm text-slate-400"></span>
                </div>
              )}
            </div>

            <button
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-500/50 font-semibold text-sm text-white transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={openCreateModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Facility
            </button>
          </div>
        </div>
      </div>

      {/* Main Dialog Modal */}
      <dialog id="facilityModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="font-bold text-xl">
              {selectedFacility ? "Edit Facility" : "Add Facility"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <FacilitiesForm
            onClose={closeModal}
            onSubmit={handleSubmit}
            initialData={selectedFacility}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      <dialog id="deleteFacilityModal" className="modal">
        <div className="modal-box w-11/12 max-w-md bg-slate-900 text-white rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-5">
            <div>
              <h3 className="text-lg font-bold">Delete Facility</h3>
              <p className="text-xs text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 ">
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete this facility?
            </p>

            <p className="mt-3 text-lg font-semibold text-white uppercase">
              {selectedFacility?.nama}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button className="btn btn-ghost" onClick={closeDeleteModal}>
              Cancel
            </button>

            <button
              className="btn btn-error"
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(selectedFacility._id, {
                  onSuccess: () => {
                    closeDeleteModal();
                  },
                });
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeDeleteModal}>close</button>
        </form>
      </dialog>

      {/* Table Container - Tema Clean & Hover (Tanpa Zebra) */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr className="bg-white/2 border-b border-white/10 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                <th className="px-6 py-4 w-24">No</th>
                <th className="px-6 py-4">Facilities Name</th>
                <th className="px-6 py-4 text-center w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {hasData ? (
                facilities.map((facility, index) => {
                  const number = (page - 1) * limit + index + 1;
                  return (
                    <tr
                      key={facility._id}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white/60">
                        {number}
                      </td>
                      <td className="px-6 py-4 font-medium text-white uppercase">
                        {facility.nama}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(facility)}
                            className="btn btn-sm btn-square btn-ghost text-blue-400 hover:bg-blue-500/10 disabled:opacity-30"
                            title="Edit Facility"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(facility)}
                            disabled={deleteMutation.isPending}
                            className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10 disabled:opacity-30"
                            title="Delete Facility"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-slate-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          stroke
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <p className="text-slate-400 text-base">
                        {search
                          ? `No facilities found matching "${search}"`
                          : "No facilities found"}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-blue-400 hover:text-blue-300 text-xs underline mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-white/10 bg-white/1">
            <span className="text-xs text-slate-400">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, totalItems)} of {totalItems} facilities
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={
                  !facilitesQuery.data?.pagination?.hasPrev ||
                  facilitesQuery.isFetching
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                « Prev
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    disabled={facilitesQuery.isFetching}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === pageNumber
                        ? "bg-blue-600 text-white"
                        : "hover:bg-white/10 text-slate-400"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={
                  !facilitesQuery.data?.pagination?.hasNext ||
                  facilitesQuery.isFetching
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                Next »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexFacilities;
