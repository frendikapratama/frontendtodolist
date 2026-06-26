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
} from "lucide-react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import UpdateMeetingForm from "./UpdateMeetingForm";
import RescheduleMeetingForm from "./RescheduleMeetingForm";
import CancelMeetingDialog from "./CancelMeetingDialog";

const TableMeeting = () => {
  const [page, setPage] = useState(1);
  const limit = 15;
  const { meetingsQuery } = useMeetings();
  const { data, isLoading } = meetingsQuery(page, limit);

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [modalType, setModalType] = useState(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* Header Baru - Lebih Profesional & Bersih */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <Calendar size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Meeting Schedule
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-white/10 text-slate-300 rounded-full border border-white/5">
                {pagination.total || 0} Total
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Monitor, and manage all your scheduled conference room meetings.
            </p>
          </div>
        </div>
      </div>

      {/* Container Table (Menghapus class table-zebra) */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr className="text-slate-400 border-b border-white/10 bg-white/2">
                <th className="py-4 font-semibold tracking-wider">Title</th>
                <th className="py-4 font-semibold tracking-wider">Room</th>
                <th className="py-4 font-semibold tracking-wider">Time</th>
                <th className="py-4 font-semibold tracking-wider">Organizer</th>
                <th className="py-4 font-semibold tracking-wider">Status</th>
                <th className="py-4 font-semibold tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No meetings found.
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => {
                  const isCancelled = meeting.status === "cancelled";
                  const isCompleted = meeting.status === "completed";
                  const disabledActions = isCancelled || isCompleted;

                  return (
                    <tr
                      key={meeting._id}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td
                        className="text-white font-medium max-w-[400px] py-4 wrap-break-word"
                        title={meeting.title}
                      >
                        <div className="line-clamp-2">{meeting.title}</div>

                        {meeting.description && (
                          <div className="text-xs text-slate-500 font-normal mt-0.5 wrap-break-word line-clamp-3">
                            {meeting.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <MapPin
                            size={14}
                            className="text-emerald-400 shrink-0"
                          />
                          <span className="truncate max-w-[250px] wrap-break-word whitespace-normal">
                            {meeting.roomId?.nama || "-"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col gap-0.5 text-slate-300 text-xs">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock
                              size={12}
                              className="text-blue-400 shrink-0"
                            />
                            {formatDateTime(meeting.startTime)}
                          </span>
                          <span className="text-slate-500 pl-4">
                            to {formatDateTime(meeting.endTime)}
                          </span>
                        </div>
                      </td>
                      <td className="text-slate-300 py-4">
                        {meeting.organizerId?.username || "-"}
                      </td>
                      <td className="py-4">{getStatusBadge(meeting.status)}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openModal("edit", meeting)}
                            className="btn btn-sm btn-square btn-ghost text-blue-400 hover:bg-blue-500/10 disabled:opacity-30"
                            disabled={disabledActions}
                            title="Edit Meeting Details"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openModal("reschedule", meeting)}
                            className="btn btn-sm btn-square btn-ghost text-warning hover:bg-warning/10 disabled:opacity-30"
                            disabled={disabledActions}
                            title="Reschedule Meeting"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => openModal("cancel", meeting)}
                            className="btn btn-sm btn-square btn-ghost text-error hover:bg-error/10 disabled:opacity-30"
                            disabled={disabledActions}
                            title="Cancel Meeting"
                          >
                            <XCircle size={16} />
                          </button>
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
          <div className="flex items-center justify-between p-4 border-t border-white/10 bg-white/1">
            <span className="text-xs text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="join">
              <button
                className="join-item btn btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
              >
                «
              </button>
              <button className="join-item btn btn-sm bg-slate-800 text-white border-white/10 cursor-default">
                {pagination.page}
              </button>
              <button
                className="join-item btn btn-sm bg-slate-800 text-white border-white/10 hover:bg-slate-700"
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

      {/* Main Modal */}
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
