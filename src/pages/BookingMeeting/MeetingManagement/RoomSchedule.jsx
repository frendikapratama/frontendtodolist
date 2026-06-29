import {
  X,
  Calendar,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import useRooms from "../../../hook/BookingMeeting/useRooms";

const StatusBadge = ({ status }) => {
  const map = {
    scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    ongoing: "bg-green-500/20 text-green-300 border-green-500/30",
    completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-md border font-medium ${map[status] || map.scheduled}`}
    >
      {status}
    </span>
  );
};

const MeetingCard = ({ meeting }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white truncate">
            {meeting.title}
          </h4>
          {meeting.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {meeting.description}
            </p>
          )}
        </div>
        <StatusBadge status={meeting.status} />
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <Calendar size={13} className="text-blue-400 shrink-0" />
        <span>{formatDate(meeting.startTime)}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
        <Clock size={13} className="text-blue-400 shrink-0" />
        <span>
          {formatTime(meeting.startTime)} — {formatTime(meeting.endTime)}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 text-[10px] font-bold shrink-0">
          {meeting.organizerId?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <span className="text-xs text-slate-400">
          Organizer:{" "}
          <span className="text-white font-medium">
            {meeting.organizerId?.username}
          </span>
        </span>
      </div>

      {meeting.participants?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Users size={13} />
            {meeting.participants.length} Participants
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {expanded && (
            <div className="mt-3 flex flex-col gap-2 border-t border-white/5 pt-3">
              {meeting.participants.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-[10px] font-bold shrink-0">
                      {p.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium leading-none">
                        {p.username}
                      </p>
                      <p className="text-[10px] text-slate-500">{p.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      p.invitationStatus === "accepted"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : p.invitationStatus === "rejected"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    {p.invitationStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const RoomSchedule = ({ room, onClose }) => {
  const { useSchedule } = useRooms();
  const scheduleQuery = useSchedule(room?._id);
  const schedule = scheduleQuery.data?.schedule || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="font-bold text-lg">{room?.nama} — Schedule</h3>
            <p className="text-xs text-slate-400 mt-0.5">{room?.lokasi}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5">
          {scheduleQuery.isLoading ? (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-md text-blue-400" />
            </div>
          ) : scheduleQuery.isError ? (
            <div className="flex flex-col items-center gap-3 py-20 text-red-400">
              <Calendar size={40} />
              <p className="text-sm">Failed to load schedule</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
              <Calendar size={40} />
              <p className="text-sm">No upcoming meetings scheduled</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 mb-1">
                {schedule.length} upcoming meeting(s)
              </p>
              {schedule.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomSchedule;
