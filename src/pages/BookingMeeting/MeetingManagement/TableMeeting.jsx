import React, { useState } from "react";
import { Calendar, MapPin, Clock, Filter, X } from "lucide-react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import UpdateMeetingForm from "./UpdateMeetingForm";
import RescheduleMeetingForm from "./RescheduleMeetingForm";
import CancelMeetingDialog from "./CancelMeetingDialog";
import dayjs from "dayjs";
import useRooms from "../../../hook/BookingMeeting/useRooms";

const theme = {
  panel: "bg-[#0f2c47]/50 border border-white/10",
  headerRow: "bg-[#0c2338]",
  headerBorder: "border-white/10",
  rowHover: "hover:bg-white/5",
  rowDivide: "divide-white/5",
  filterPanel: "bg-[#0f2c47]/50 border border-white/10",
  inputBg: "bg-[#122d47] border-white/10 focus:border-teal-400/60",
  iconBoxBg: "bg-teal-500/10 border border-teal-400/20 text-teal-300",
  badgeOutline: "bg-slate-800 text-white border-white/10 hover:bg-slate-700",
  btnActive: "bg-teal-600 hover:bg-teal-500 text-white border-none",
  btnInactive: "bg-[#122d47] hover:bg-[#16324f] text-white border-none",
  accentText: "text-teal-300",
};

// Status badge dibuat custom (bukan daisyUI badge-*) biar selaras palet teal/blue
const STATUS_STYLES = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    dot: "bg-blue-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  completed: {
    label: "Completed",
    className: "bg-teal-500/15 text-teal-300 border border-teal-500/20",
    dot: "bg-teal-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-500/15 text-rose-300 border border-rose-500/20",
    dot: "bg-rose-400",
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || {
    label: status,
    className: "bg-slate-500/15 text-slate-300 border border-slate-500/20",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {s.label}
    </span>
  );
};

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

  // Sizing yang menyesuaikan compact / normal, terpusat juga
  const sizing = {
    cellPad: compact ? "py-3 px-2" : "py-4 px-4",
    headText: compact ? "text-xs" : "text-sm",
    bodyText: compact ? "text-xs" : "text-sm",
    titleText: compact ? "text-base" : "text-xl",
    iconBox: compact ? "w-10 h-10" : "w-12 h-12",
    iconSize: compact ? 20 : 24,
  };

  const formatMeetingType = (type) => {
    if (!type) return "";

    return type
      .replace(/_/g, " ") // ganti underscore jadi spasi
      .replace(/-/g, " ") // ganti dash jadi spasi
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };
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

  const meetings = data?.data || [];
  const pagination = data?.pagination || {};

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
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`${sizing.iconBox} rounded-xl flex items-center justify-center shadow-inner shrink-0 ${theme.iconBoxBg}`}
          >
            <Calendar size={sizing.iconSize} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                className={`${sizing.titleText} text-white font-bold tracking-tight`}
              >
                Meeting Schedule
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                {pagination.total || 0} Total
              </span>
            </div>
            {!compact && (
              <p className="text-sm text-slate-400 mt-0.5">
                Monitor, and manage all your scheduled conference room meetings.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className={`btn btn-sm gap-2 ${
            showFilters ? theme.btnActive : theme.btnInactive
          }`}
        >
          <Filter size={14} />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && !showFilters && (
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className={`backdrop-blur-md rounded-xl shadow-xl p-4 shrink-0 ${theme.filterPanel}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end md:grid-cols-4">
            {/* Room */}
            <div className="flex flex-col gap-1 min-w-[170px]">
              <label className="text-xs font-medium text-slate-400">Room</label>
              <select
                value={filters.roomId}
                onChange={(e) => handleFilterChange("roomId", e.target.value)}
                className={`select select-sm text-white focus:outline-none ${theme.inputBg}`}
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
                className={`select select-sm text-white focus:outline-none ${theme.inputBg}`}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                className={`input input-sm text-white focus:outline-none ${theme.inputBg}`}
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
                className={`input input-sm text-white focus:outline-none ${theme.inputBg}`}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-sm bg-[#122d47] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border-white/10 gap-1.5"
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
        className={`backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300 shadow-lg flex-1 min-h-0 flex flex-col ${theme.panel}`}
      >
        <div className="overflow-auto w-full flex-1 min-h-0">
          <table className="table w-full border-collapse text-left">
            <thead className={`sticky top-0 z-10 ${theme.headerRow}`}>
              <tr className={`border-b ${theme.headerBorder}`}>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                >
                  Title
                </th>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                >
                  Room
                </th>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                >
                  Time
                </th>
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                >
                  Organizer
                </th>
                {!compact && (
                  <th
                    className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                  >
                    Meeting Type
                  </th>
                )}
                <th
                  className={`font-semibold tracking-wider text-slate-300 ${sizing.cellPad} ${sizing.headText}`}
                >
                  Status
                </th>
              </tr>
            </thead>

            <tbody className={`divide-y ${theme.rowDivide}`}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-white"></span>
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-slate-400 text-sm"
                  >
                    No meetings found.
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => (
                  <tr
                    key={meeting._id}
                    className={`transition-colors ${theme.rowHover}`}
                  >
                    <td
                      className={`font-medium text-white ${sizing.cellPad} max-w-[350px]`}
                      title={meeting.title}
                    >
                      <div
                        className={`wrap-break-word line-clamp-2 ${sizing.bodyText}`}
                      >
                        {meeting.title}
                      </div>
                      {meeting.description && (
                        <div className="text-xs text-slate-400 font-normal mt-1 wrap-break-word line-clamp-2">
                          {meeting.description}
                        </div>
                      )}
                    </td>

                    <td className={sizing.cellPad}>
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <MapPin
                          size={14}
                          className="text-emerald-400 shrink-0"
                        />
                        <span
                          className={`truncate wrap-break-word whitespace-normal max-w-[200px] ${sizing.bodyText}`}
                        >
                          {meeting.roomId?.nama || "-"}
                        </span>
                      </div>
                    </td>

                    <td className={sizing.cellPad}>
                      <div className="flex flex-col text-slate-200 text-xs">
                        <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                          <Clock size={12} className="text-teal-300 shrink-0" />
                          {formatDateTime(meeting.startTime)} -{" "}
                          {formatTime(meeting.endTime)}
                        </span>
                      </div>
                    </td>

                    <td
                      className={`text-slate-200 capitalize ${sizing.cellPad} ${sizing.bodyText}`}
                    >
                      {meeting.organizerId?.username || "-"}
                    </td>

                    {!compact && (
                      <td
                        className={`text-slate-200 ${sizing.cellPad} ${sizing.bodyText}`}
                      >
                        {formatMeetingType(meeting.meetingType) || "-"}
                      </td>
                    )}

                    <td className={sizing.cellPad}>
                      <div className="flex items">
                        <StatusBadge status={meeting.status} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/5 shrink-0">
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="join">
              <button
                className="join-item btn btn-xs sm:btn-sm bg-[#122d47] text-white border-white/10 hover:bg-[#16324f] disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
              >
                «
              </button>
              <button className="join-item btn btn-xs sm:btn-sm bg-[#122d47] text-white border-white/10 cursor-default">
                {pagination.page}
              </button>
              <button
                className="join-item btn btn-xs sm:btn-sm bg-[#122d47] text-white border-white/10 hover:bg-[#16324f] disabled:opacity-40"
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
        <div className="modal-box w-11/12 max-w-xl bg-[#0f2c47] text-white rounded-2xl shadow-2xl border border-white/10">
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
