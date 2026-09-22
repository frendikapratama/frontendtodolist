import React, { useState, useEffect } from "react";
import {
  useParams as useReactParams,
  useNavigate as useReactNavigate,
} from "react-router-dom";
import useRooms from "../../../hook/BookingMeeting/useRooms";

import GradientText from "../../../components/ui/GradientText";
import dayjs from "dayjs";
import {
  MapPin,
  Users,
  Clock,
  Calendar,
  AlertCircle,
  Hourglass,
  ArrowLeft,
  Check,
  Building2,
} from "lucide-react";

export default function RoomDetailPage() {
  const { roomId } = useReactParams();
  const navigate = useReactNavigate();

  const { useDetailRoom } = useRooms();
  const { data, isLoading, isError, error } = useDetailRoom(roomId);

  const [time, setTime] = useState(dayjs().format("HH:mm:ss"));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-linear-to-tl from-[#1A3D64] to-[#1D546C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-cyan-300">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">
            Loading room details...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="h-screen w-screen bg-linear-to-tl from-[#1A3D64] to-[#1D546C] flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 p-6 rounded-2xl text-center max-w-md w-full shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">
            Failed to Load Data
          </h3>
          <p className="text-xs text-blue-200/70 mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "An unknown error occurred"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-cyan-200 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!data) {
    return (
      <div className="h-screen w-screen bg-linear-to-tl from-[#1A3D64] to-[#1D546C] flex items-center justify-center">
        <div className="text-center text-blue-200">
          <p className="mb-4 font-medium">Room not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 text-cyan-200 rounded-xl text-sm hover:bg-cyan-500/30 transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>
    );
  }

  const {
    room,
    status,
    isAvailable,
    nextMeetings,
    remainingMinutes,
    currentMeeting,
  } = data;

  const nextMeeting =
    nextMeetings && nextMeetings.length > 0 ? nextMeetings[0] : null;
  const upcomingMeetings =
    nextMeetings && nextMeetings.length > 1 ? nextMeetings.slice(1) : [];

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-linear-to-tl from-[#1A3D64] via-[#163758] to-[#1D546C] p-4 sm:p-6 relative select-none font-sans text-white">
      {/* Background Soft Glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Footer Copyright */}
      <h1 className="fixed bottom-3 right-4 text-[10px] text-blue-200/40 z-50 pointer-events-none">
        © 2026 Developed by IT Aldo | PT. Alkindo Naratama Tbk. | All rights
        reserved.
      </h1>

      {/* Main Container Card */}
      <div className="backdrop-blur-2xl bg-slate-900/40 border border-white/10 shadow-2xl rounded-3xl p-5 sm:p-7 w-full max-w-7xl h-full max-h-[92vh] flex flex-col justify-between overflow-hidden relative z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={4}
              showBorder={false}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            >
              Planify
            </GradientText>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold text-blue-100/90 tracking-wide">
            <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner">
              <Calendar size={14} className="text-cyan-300" />
              {dayjs().format("DD MMMM YYYY")}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner tabular-nums">
              <Clock size={14} className="text-cyan-300" />
              {time}
            </span>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 grow overflow-hidden">
          {/* LEFT SIDE (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4 overflow-y-auto pr-1">
            {/* Room Title Header & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Building2 size={24} className="text-cyan-400/80" />
                  {room?.nama || "Meeting Room"}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200/80 mt-1">
                  <MapPin size={14} className="text-cyan-400" />
                  <span>{room?.lokasi || "Location not set"}</span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                  {/* Color Indicator */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "BUFFER"
                        ? "bg-amber-500 animate-pulse"
                        : !isAvailable
                          ? "bg-rose-500 animate-ping"
                          : "bg-emerald-500"
                    }`}
                  />

                  {/* Status Text */}
                  <span
                    className={
                      status === "BUFFER"
                        ? "text-amber-600"
                        : !isAvailable
                          ? "text-rose-600"
                          : "text-emerald-600"
                    }
                  >
                    {status || (!isAvailable ? "IN PROGRESS" : "AVAILABLE")}
                  </span>
                </span>

                {/* Remaining Minutes */}
                {Boolean(remainingMinutes) && Number(remainingMinutes) > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <Hourglass
                      size={13}
                      className="text-cyan-300 animate-pulse"
                    />
                    {remainingMinutes} Minutes Remaining
                  </span>
                )}
              </div>
            </div>

            {/* CURRENT MEETING CARD */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md flex flex-col justify-between shrink-0 shadow-lg">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                    Current Meeting
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 font-medium">
                    Active Session
                  </span>
                </div>

                {currentMeeting ? (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                      {currentMeeting.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-200/70 mb-4 flex items-center gap-1.5">
                      <span>Organized by:</span>
                      <strong className="text-blue-100 font-semibold">
                        {currentMeeting.organizerId?.username ||
                          currentMeeting.organizer ||
                          "Super Admin"}
                      </strong>
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5 text-cyan-300 font-semibold text-lg sm:text-xl">
                      <span className="flex items-center gap-2">
                        <Clock size={18} className="text-cyan-400" />
                        {new Date(currentMeeting.startTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}{" "}
                        –{" "}
                        {new Date(currentMeeting.endTime).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          },
                        )}
                      </span>
                      <span className="text-xs font-normal text-blue-200/60">
                        {dayjs(currentMeeting.startTime).format("D MMMM YYYY")}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-blue-200/50">
                    <p className="text-base font-medium text-blue-100/80">
                      No Current Meeting
                    </p>
                    <p className="text-xs text-blue-200/50 mt-1">
                      The room is empty and ready to use
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ROOM SPECIFICATIONS */}
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-5 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-blue-100/90 uppercase tracking-wider">
                  Room Specifications
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-medium bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  <Users size={14} />
                  <span>Capacity: {room?.kapasitas || 0} People</span>
                </div>
              </div>

              {room?.facilities && room.facilities.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {room.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-blue-100 transition"
                    >
                      <Check size={13} className="text-cyan-400 shrink-0" />
                      <span>{fac.nama}</span>
                      <span className="text-cyan-300 font-bold text-[10px] bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                        {fac.total}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-blue-200/50 italic">
                  No facilities registered
                </p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE (4 cols) - Upcoming Meetings */}
          <div className="lg:col-span-4 bg-slate-800/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md overflow-hidden shadow-lg">
            <div className="flex flex-col h-full overflow-hidden">
              {/* NEXT MEETING */}
              <div className="pb-4 mb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
                    Next Meeting
                  </span>
                  <Calendar size={14} className="text-blue-300/60" />
                </div>

                {nextMeeting ? (
                  <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold mb-1">
                      <span>
                        {nextMeeting.startTimeLabel || "18:00"} –{" "}
                        {nextMeeting.endTimeLabel || "18:45"}
                      </span>
                      <span className="text-[10px] text-blue-200/60 font-normal">
                        {nextMeeting.date || "Today"}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1 truncate">
                      {nextMeeting.title}
                    </h4>
                    <p className="text-[11px] text-blue-200/60 truncate">
                      By:{" "}
                      <span className="text-blue-100 font-medium">
                        {nextMeeting.organizer || "Admin"}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-blue-200/40 bg-slate-900/30 rounded-xl border border-white/5">
                    No upcoming meetings today
                  </div>
                )}
              </div>

              {/* UPCOMING LIST */}
              <div className="grow overflow-y-auto pr-1 flex flex-col">
                <h4 className="text-[11px] font-bold tracking-wider text-blue-200/60 uppercase mb-3 shrink-0">
                  Upcoming Schedule
                </h4>

                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-2.5">
                    {upcomingMeetings.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 border border-white/5 transition"
                      >
                        <div className="max-w-[65%]">
                          <h5 className="text-xs font-semibold text-white truncate">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-blue-200/50 truncate">
                            Organizer: {item.organizer || "-"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-medium text-cyan-300 flex items-center justify-end gap-1">
                            <Clock size={10} className="text-cyan-400" />
                            {item.startTimeLabel
                              ? `${item.startTimeLabel} - ${item.endTimeLabel}`
                              : item.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 my-auto text-center text-xs text-blue-200/40 border border-dashed border-white/10 rounded-xl">
                    No other upcoming schedules
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
