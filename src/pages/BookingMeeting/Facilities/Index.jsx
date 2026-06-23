import { useState } from "react";
import { FacilitiesForm } from "./Form";
import { useFacilities } from "../../../hook/BookingMeeting/useFacilities";

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
    <div>
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 -mx-4 px-4 py-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Facilities Management
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage and organize company meeting facilities.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search facilities..."
                value={search}
                onChange={handleSearchChange}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              {facilitesQuery.isFetching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              )}
            </div>

            <button
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 whitespace-nowrap"
              onClick={openCreateModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
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

      <dialog id="facilityModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-slate-900 opacity-70 text-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-xl">
              {selectedFacility ? "Edit Facility" : "Add Facility"}
            </h3>
          </div>

          <FacilitiesForm
            onClose={closeModal}
            onSubmit={handleSubmit}
            initialData={selectedFacility}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Table Data - Selalu ditampilkan dengan header */}
      <div className="bg-white/5 backdrop-blur-xs border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative">
          <table className="w-full text-left border-collapse">
            {/* TABLE HEAD STICKY - Selalu tampil */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-800/95 backdrop-blur-sm border-b border-white/10 text-xs font-bold text-white/60 uppercase tracking-wider">
                <th className="px-6 py-4 w-20">No</th>
                <th className="px-6 py-4">Facility Name</th>
                <th className="px-6 py-4 text-center w-48">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-white/80">
              {hasData ? (
                // Render data jika ada
                facilities.map((facility, index) => {
                  const number = (page - 1) * limit + index + 1;
                  return (
                    <tr
                      key={facility._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">{number}</td>
                      <td className="px-6 py-4">{facility.nama}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(facility)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(facility._id)}
                            disabled={deleteMutation.isPending}
                            className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Tampilkan pesan kosong di dalam tbody
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-16 h-16 text-slate-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <p className="text-slate-400 text-lg">
                        {search
                          ? `No facilities found matching "${search}"`
                          : "No facilities found"}
                      </p>
                      {search && (
                        <button
                          onClick={() => setSearch("")}
                          className="text-blue-400 hover:text-blue-300 text-sm underline"
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
      </div>

      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 px-2">
          <div className="text-sm text-slate-400">
            Showing {(page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalItems)} of {totalItems} facilities
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevPage}
              disabled={
                !facilitesQuery.data?.pagination?.hasPrev ||
                facilitesQuery.isFetching
              }
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              Prev
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  disabled={facilitesQuery.isFetching}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    page === pageNumber
                      ? "bg-blue-600 text-white font-bold"
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
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexFacilities;
