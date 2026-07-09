import React, { useState } from "react";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Edit,
  RotateCcw,
  XCircle,
  Search,
  FileText,
  Upload,
  Download,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import UpdateMeetingForm from "./UpdateMeetingForm";
import RescheduleMeetingForm from "./RescheduleMeetingForm";
import CancelMeetingDialog from "./CancelMeetingDialog";
// import MeetingResultsModal from "./MeetingResultsModal";
import dayjs from "dayjs";
import useRooms from "../../../hook/BookingMeeting/useRooms";

const TableMeeting = ({ compact = false }) => {
  const today = dayjs().format("YYYY-MM-DD");

  const [page, setPage] = useState(1);
  const limit = 25;
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    organizerId: "",
    roomId: "",
    startDate: compact ? today : "",
    endDate: compact ? today : "",
    status: "all",
    meetingType: "all",
    search: "",
  });

  const { meetingsQuery } = useMeetings();
  const { data, isLoading } = meetingsQuery(page, limit, filters);

  const { roomsQuery } = useRooms();
  const rooms = roomsQuery.data || [];

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({
      organizerId: "",
      roomId: "",
      startDate: compact ? today : "",
      endDate: compact ? today : "",
      status: "all",
      meetingType: "all",
      search: "",
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (value === "" || value === "all") return false;
    if (
      compact &&
      (key === "startDate" || key === "endDate") &&
      value === today
    ) {
      return false;
    }
    return true;
  });

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

  const meetings = data?.data || [];
  const pagination = data?.pagination || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="badge badge-info badge-sm font-medium">
            Scheduled
          </span>
        );
      case "in_progress":
        return (
          <span className="badge badge-warning badge-sm font-medium">
            In Progress
          </span>
        );
      case "completed":
        return (
          <span className="badge badge-success badge-sm font-medium">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="badge badge-error badge-sm font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="badge badge-ghost badge-sm font-medium">
            {status}
          </span>
        );
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`space-y-6 `}>
      {/* Header */}

      {!compact && (
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2">
          <div className="flex items-center gap-4">
            <div
              className={`${compact ? "w-9 h-9" : "w-12 h-12"} rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner`}
            >
              <Calendar size={compact ? 18 : 24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2
                  className={`${compact ? "text-base text-slate-700" : "text-xl text-white"} font-bold tracking-tight `}
                >
                  Meeting Schedule
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                  {pagination.total || 0} Total
                </span>
              </div>
              {!compact && (
                <p className="text-sm text-slate-400 mt-0.5">
                  Monitor, and manage all your scheduled conference room
                  meetings.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`btn btn-sm gap-2 ${
              showFilters
                ? "bg-blue-600 hover:bg-blue-700 text-white border-none"
                : "bg-slate-800 hover:bg-slate-700 text-white border-white/10"
            }`}
          >
            <Filter size={14} />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && !showFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            )}
          </button>
        </div>
      )}
      {/* Filter Panel */}
      {showFilters && (
        <div
          className={`bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl ${compact ? "p-2" : "p-4"}`}
        >
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 items-end ${compact ? "md:grid-cols-4" : "md:grid-cols-5"}`}
          >
            {/* Search */}
            {/* <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
      <label className="text-xs font-medium text-slate-400">
        Search
      </label>
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Search title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="input input-sm w-full pl-9 bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div> */}

            {/* Room */}
            <div
              className={`flex flex-col  min-w-[170px] ${compact ? "" : "gap-1"}`}
            >
              <label className="text-xs font-medium text-slate-400">Room</label>
              <select
                value={filters.roomId}
                onChange={(e) => handleFilterChange("roomId", e.target.value)}
                className="select select-sm bg-slate-800 border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Rooms</option>
                {rooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {room.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-slate-400">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="select select-sm bg-slate-800 border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-medium text-slate-400">
                Meeting Type
              </label>
              <select
                value={filters.meetingType}
                onChange={(e) =>
                  handleFilterChange("meetingType", e.target.value)
                }
                className="select select-sm bg-slate-800 border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-xs font-medium text-slate-400">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="input input-sm bg-slate-800 border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1 min-w-40">
              <label className="text-xs font-medium text-slate-400">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="input input-sm bg-slate-800 border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-sm bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border-white/10 gap-1.5"
              >
                <X size={14} />
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Container Table */}
      <div
        className={`backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 ${
          compact
            ? "bg-blue-400 border border-white/10 "
            : "bg-slate-900/40 shadow-xl border border-white/10"
        }`}
      >
        <div className="overflow-x-auto w-full">
          <table className="table w-full border-collapse text-left">
            {/* Header Tabel */}
            <thead
              className={`sticky top-0 z-10 ${
                compact ? "bg-blue-700" : "bg-slate-900"
              }`}
            >
              <tr className="border-b border-white/10">
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${compact ? "py-2.5 px-3 text-xs" : "py-4 px-4 text-sm"}`}
                >
                  Title
                </th>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${compact ? "py-2.5 px-3 text-xs" : "py-4 px-4 text-sm"}`}
                >
                  Room
                </th>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${compact ? "py-2.5 px-3 text-xs" : "py-4 px-4 text-sm"}`}
                >
                  Time
                </th>
                {!compact && (
                  <th className="py-4 px-4 font-semibold tracking-wider text-slate-300 text-sm">
                    Organizer
                  </th>
                )}
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${compact ? "py-2.5 px-3 text-xs" : "py-4 px-4 text-sm"}`}
                >
                  Status
                </th>
              </tr>
            </thead>

            {/* Body Tabel */}
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={compact ? 4 : 5} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-white"></span>
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td
                    colSpan={compact ? 4 : 5}
                    className="text-center py-12 text-slate-400 text-sm"
                  >
                    No meetings found.
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => {
                  const computedStatus = meeting.status;

                  return (
                    <tr
                      key={meeting._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Kolom Title */}
                      <td
                        className={`font-medium text-white ${
                          compact
                            ? "py-2.5 px-3 max-w-[150px]"
                            : "py-4 px-4 max-w-[350px]"
                        }`}
                        title={meeting.title}
                      >
                        <div
                          className={`wrap-break-word ${compact ? "line-clamp-1 text-xs" : "line-clamp-2 text-sm"}`}
                        >
                          {meeting.title}
                        </div>
                        {meeting.description && !compact && (
                          <div className="text-xs text-slate-400 font-normal mt-1 wrap-break-word line-clamp-2">
                            {meeting.description}
                          </div>
                        )}
                      </td>

                      {/* Kolom Room */}
                      <td className={compact ? "py-2.5 px-3" : "py-4 px-4"}>
                        <div className="flex items-center gap-1.5 text-slate-200">
                          {!compact && (
                            <MapPin
                              size={14}
                              className="text-emerald-400 shrink-0"
                            />
                          )}
                          <span
                            className={`truncate wrap-break-word whitespace-normal ${compact ? "max-w-[100px] text-xs" : "max-w-[200px] text-sm"}`}
                          >
                            {meeting.roomId?.nama || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Kolom Time */}
                      <td className={compact ? "py-2.5 px-3" : "py-4 px-4"}>
                        <div
                          className={`flex flex-col text-slate-200 ${compact ? "text-[11px]" : "text-xs"}`}
                        >
                          <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                            {!compact && (
                              <Clock
                                size={12}
                                className="text-blue-400 shrink-0"
                              />
                            )}
                            {formatDateTime(meeting.startTime)} -{" "}
                            {formatTime(meeting.endTime)}
                          </span>
                        </div>
                      </td>

                      {/* Kolom Organizer (Hanya non-compact) */}
                      {!compact && (
                        <td className="text-slate-200 py-4 px-4 text-sm">
                          {meeting.organizerId?.username || "-"}
                        </td>
                      )}

                      {/* Kolom Status */}
                      <td className={compact ? "py-2.5 px-3" : "py-4 px-4"}>
                        <div className="flex items-center">
                          {getStatusBadge(computedStatus)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5">
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="join">
              <button
                className="join-item btn btn-xs sm:btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
              >
                «
              </button>
              <button className="join-item btn btn-xs sm:btn-sm bg-slate-800 text-white border-white/10 cursor-default">
                {pagination.page}
              </button>
              <button
                className="join-item btn btn-xs sm:btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700 disabled:opacity-40"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={!pagination.hasNext}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Modal untuk Edit/Reschedule/Cancel */}
      <dialog id="meetingManagementModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-slate-900 text-white rounded-2xl shadow-2xl border border-white/10">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
            <h3 className="font-bold text-xl">
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
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default TableMeeting;
