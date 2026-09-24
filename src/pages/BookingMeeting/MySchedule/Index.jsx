import { useMySchedule } from "../../../hook/BookingMeeting/useMyShcedule";
import {
  Edit,
  RotateCcw,
  XCircle,
  FileText,
  CircleStop,
  Search,
  X,
  Calendar,
} from "lucide-react";
import MeetingResultsModal from "./MeetingResultsModal";
import CancelMeetingDialog from "../MeetingManagement/CancelMeetingDialog";
import UpdateMeetingForm from "../MeetingManagement/UpdateMeetingForm";
import RescheduleMeetingForm from "../MeetingManagement/RescheduleMeetingForm";
import { useState, useContext, useRef } from "react";
import { AuthContext } from "../../../context/AuthContext";

const IndexMySchedule = () => {
  const {
    myScheduleQuery,
    items,
    totalItems,
    hasMore,
    loadMore,
    isFetchingMore,
    isInitialLoading,
    endMeetingMutation,
    search,
    setSearch,
  } = useMySchedule();

  const { user } = useContext(AuthContext);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalType, setModalType] = useState(null);

  // Ref untuk menjaga fokus pada input search
  const searchInputRef = useRef(null);

  const openModal = (type, meeting) => {
    setSelectedMeeting(meeting);
    setModalType(type);
    document.getElementById("meetingManagementModal").showModal();
  };

  const closeModal = () => {
    setSelectedMeeting(null);
    setModalType(null);
    document.getElementById("meetingManagementModal").close();
  };

  const openResultsModal = (meeting) => {
    setSelectedMeeting(meeting);
    document.getElementById("meetingResultsModal").showModal();
  };

  const closeResultsModal = () => {
    setSelectedMeeting(null);
    document.getElementById("meetingResultsModal").close();
  };

  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleClearSearch = () => {
    setSearch("");
    // Kembalikan fokus ke input setelah tombol X diklik
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const { isError, error } = myScheduleQuery;
  const schedule = items || [];
  const hasData = schedule.length > 0;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 max-w-sm mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <p className="text-sm text-red-400">
          Error: {error?.message || "Failed to load schedule"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STICKY HEADER SECTION WITH SMOOTH TRANSITION */}
      <div className="sticky top-4 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl shadow-black/40 transition-all duration-300">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md group">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors duration-200 pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, or description"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs text-white placeholder:text-slate-500 bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-white/10 transition-all duration-200"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Counter & Stats Badge */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 backdrop-blur-md shadow-inner transition-all duration-300">
            <Calendar size={14} className="text-blue-400 shrink-0" />
            <span className="font-medium">
              Showing{" "}
              <strong className="text-white font-bold">
                {schedule.length}
              </strong>{" "}
              of <strong className="text-white font-bold">{totalItems}</strong>{" "}
              Schedules
            </span>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Grid Schedules */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.map((item) => {
              const computedStatus = item.status;
              const isCancelled = computedStatus === "cancelled";
              const isCompleted = computedStatus === "completed";
              const isProgress = computedStatus === "in_progress";
              const isOwner = item.organizerId?._id === user?._id;
              const disabledActions = isCancelled || isCompleted || !isOwner;

              const getStatusStyle = (status) => {
                switch (status) {
                  case "completed":
                    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
                  case "cancelled":
                    return "bg-rose-500/10 text-rose-400 border-rose-500/15";
                  case "in_progress":
                    return "bg-blue-500/10 text-blue-400 border-blue-500/15";
                  default:
                    return "bg-amber-500/10 text-amber-400 border-amber-500/15";
                }
              };

              return (
                <div
                  key={item._id}
                  className="bg-linear-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg shadow-black/20 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-5 bg-blue-500 group-hover:opacity-10 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/15">
                        {item.roomId?.nama || "No Room"}
                      </span>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {formatDateOnly(item.startTime)}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(computedStatus)}`}
                        >
                          {computedStatus || "upcoming"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                      {item.description || "No description provided."}
                    </p>
                  </div>

                  {item.meetingLink && (
                    <div className="flex flex-row justify-between items-center gap-2 mb-3">
                      <span className="text-blue-300 text-sm truncate">
                        {item.meetingLink}
                      </span>
                      <span className="text-blue-400 px-2 py-1 text-xs font-semibold bg-blue-500/10 border border-blue-500/15 rounded shrink-0 hover:bg-blue-500/20 transition-all">
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          join meeting
                        </a>
                      </span>
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    <div className="border-t border-white/5 pt-3" />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 shadow-inner">
                          {item.organizerId?.username
                            ?.charAt(0)
                            .toUpperCase() || "O"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                            Organizer
                          </span>
                          <span className="text-xs font-medium text-slate-300 truncate capitalize">
                            {item.organizerId?.username || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                          Time Slot
                        </span>
                        <div className="flex flex-row items-center gap-1 justify-end">
                          <span className="inline-flex items-center text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono">
                            {formatTimeOnly(item.startTime)} -{" "}
                            {formatTimeOnly(item.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1">
                      <button
                        onClick={() => openResultsModal(item)}
                        className="flex items-center justify-center p-2 rounded-lg text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-95 transition-all cursor-pointer"
                        title={
                          isOwner
                            ? "View Meeting Results"
                            : "Only organizer can edit"
                        }
                      >
                        <FileText size={15} />
                      </button>

                      <button
                        onClick={() => openModal("edit", item)}
                        className="flex items-center justify-center p-2 rounded-lg text-blue-400 bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                        disabled={disabledActions}
                        title={
                          isOwner
                            ? "Edit Meeting Details"
                            : "Only organizer can edit"
                        }
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        onClick={() => openModal("reschedule", item)}
                        className="flex items-center justify-center p-2 rounded-lg text-amber-400 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                        disabled={disabledActions}
                        title={
                          isOwner
                            ? "Reschedule Meeting"
                            : "Only organizer can reschedule"
                        }
                      >
                        <RotateCcw size={15} />
                      </button>

                      <button
                        onClick={() => openModal("cancel", item)}
                        className="flex items-center justify-center p-2 rounded-lg text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                        disabled={disabledActions}
                        title={
                          isOwner
                            ? "Cancel Meeting"
                            : "Only organizer can cancel"
                        }
                      >
                        <XCircle size={15} />
                      </button>

                      {isProgress && isOwner && (
                        <button
                          onClick={() => openModal("end", item)}
                          className="col-span-4 flex items-center justify-center gap-2 p-2 mt-1 rounded-lg text-white bg-red-600 hover:bg-red-500 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-red-600/20"
                          title="End Meeting Now"
                          disabled={endMeetingMutation.isPending}
                        >
                          {endMeetingMutation.isPending &&
                          selectedMeeting?._id === item._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <CircleStop size={15} />
                          )}
                          <span className="text-xs font-semibold">
                            End Meeting
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={isFetchingMore}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-blue-400 bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/15 hover:text-blue-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isFetchingMore ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-16 max-w-sm mx-auto bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 p-8 shadow-xl">
          <div className="inline-flex p-3 bg-white/5 border border-white/5 rounded-full text-slate-500 mb-4 shadow-inner animate-pulse">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            No schedule items found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Check back later for updates or new bookings.
          </p>
        </div>
      )}

      {/* Main Modal */}
      <dialog id="meetingManagementModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="font-bold text-xl">
              {modalType === "end" && "End Meeting"}
              {modalType === "edit" && "Update Meeting"}
              {modalType === "reschedule" && "Reschedule Meeting"}
              {modalType === "cancel" && "Cancel Meeting"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {selectedMeeting && modalType === "edit" && (
            <UpdateMeetingForm meeting={selectedMeeting} onClose={closeModal} />
          )}

          {selectedMeeting && modalType === "reschedule" && (
            <RescheduleMeetingForm
              meeting={selectedMeeting}
              onClose={closeModal}
            />
          )}

          {selectedMeeting && modalType === "cancel" && (
            <CancelMeetingDialog
              meeting={selectedMeeting}
              onClose={closeModal}
            />
          )}

          {selectedMeeting && modalType === "end" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <h4 className="text-lg font-semibold text-red-400">
                  End Meeting?
                </h4>
                <p className="mt-2 text-sm text-slate-300">
                  Are you sure you want to end this meeting now? This action
                  will mark the meeting as completed and update its end time.
                </p>
                <p className="mt-4 text-sm">
                  Meeting:
                  <span className="ml-1 font-semibold text-white">
                    {selectedMeeting.title}
                  </span>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button className="btn btn-ghost" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  disabled={endMeetingMutation.isPending}
                  onClick={() => {
                    endMeetingMutation.mutate(
                      {
                        id: selectedMeeting._id,
                        payload: {
                          endTime: new Date().toISOString(),
                          endedBy: user?._id || user?.id,
                        },
                      },
                      {
                        onSuccess: () => {
                          closeModal();
                        },
                      },
                    );
                  }}
                >
                  {endMeetingMutation.isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Ending...
                    </>
                  ) : (
                    <>
                      <CircleStop size={16} />
                      End Meeting
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>

      {/* Meeting Results Modal */}
      <dialog id="meetingResultsModal" className="modal">
        <div className="modal-box w-11/12 max-w-2xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10 p-0 overflow-hidden">
          {selectedMeeting && (
            <MeetingResultsModal
              meeting={selectedMeeting}
              onClose={closeResultsModal}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeResultsModal}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default IndexMySchedule;
