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
  Clock,
  Calendar,
  AlertCircle,
  Hourglass,
  ArrowLeft,
  Check,
  Users,
  CalendarDays,
  Building2,
} from "lucide-react";
import { API_URL } from "../../../api/axios";

export default function RoomDetailPage() {
  const BASE_URL = API_URL;
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

  const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <h1 className="fixed bottom-2 right-4 text-xs text-blue-200 z-50 pointer-events-none">
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

          <div className="flex items-center gap-2 sm:gap-3 text-sm font-semibold text-blue-100/90 tracking-wide">
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
          {/* LEFT SIDE */}
          <div className="lg:col-span-8 flex flex-col gap-5 overflow-y-auto pr-1">
            {/* ROOM HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Room Icon */}
                <div className="shrink-0 w-12 h-12 rounded-2xl  border border-blue-400/15 flex items-center justify-center">
                  <Building2 size={32} className="text-cyan-400" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-white truncate capitalize">
                    {room?.nama || "Meeting Room"}
                  </h1>

                  <div className="flex items-center gap-1.5 mt-1 text-sm text-blue-200/60">
                    <MapPin size={14} className="text-cyan-400 shrink-0" />

                    <span className="truncate">
                      {room?.lokasi || "Location not set"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ROOM STATUS */}
              <div className="flex items-center gap-3 shrink-0">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full  `}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status === "BUFFER"
                        ? "bg-amber-700 animate-pulse"
                        : !isAvailable
                          ? "bg-rose-700 animate-pulse"
                          : "bg-emerald-700"
                    }`}
                  />

                  <span
                    className={`text-sm font-bold tracking-wide uppercase ${
                      status === "BUFFER"
                        ? "text-amber-600"
                        : !isAvailable
                          ? "text-rose-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {status || (!isAvailable ? "IN PROGRESS" : "AVAILABLE")}
                  </span>
                </div>

                {/* Remaining Minutes */}
                {Boolean(remainingMinutes) && Number(remainingMinutes) > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-cyan-300">
                    <Hourglass size={13} className="animate-pulse" />

                    <span>{remainingMinutes} min left</span>
                  </div>
                )}
              </div>
            </div>

            {/* ROOM IMAGE */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-xl">
              <img
                src={`${BASE_URL}/uploads/rooms/${room.photo}`}
                alt={room.nama}
                className="w-full h-72 sm:h-80 object-cover"
              />
              {/* Subtle image overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* CURRENT MEETING */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/45 backdrop-blur-md shadow-lg shrink-0">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center">
                    <Users size={16} className="text-cyan-400" />
                  </div>

                  <span className="text-xl font-bold tracking-[0.12em] text-cyan-400 uppercase">
                    Current Meeting
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/15 text-sm font-semibold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Active Session
                </span>
              </div>

              {/* Meeting Content */}
              <div className="px-5 pb-5 pt-4">
                {currentMeeting ? (
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                      {currentMeeting.title}
                    </h2>

                    <p className="text-sm text-blue-200/60 mt-1.5 flex items-center gap-1.5">
                      <span>Organizer: </span>

                      <strong className="text-blue-100 font-medium capitalize">
                        {currentMeeting.organizerId?.username ||
                          currentMeeting.organizer ||
                          "Super Admin"}
                      </strong>
                    </p>

                    {/* Meeting Meta */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-cyan-300">
                        <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                          <Clock size={15} className="text-cyan-400" />
                        </div>

                        <span className="text-sm sm:text-base font-semibold">
                          {formatTime(currentMeeting.startTime)} –{" "}
                          {formatTime(currentMeeting.endTime)}
                        </span>
                      </div>

                      <span className="text-sm text-cyan-400">
                        Today{" "}
                        {dayjs(currentMeeting.startTime).format("D MMMM YYYY")}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="min-h-[145px] flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center mb-3">
                      <CalendarDays size={22} className="text-blue-300/60" />
                    </div>

                    <p className="text-base font-semibold text-blue-100/90">
                      No Current Meeting
                    </p>

                    <p className="text-xs text-blue-200/45 mt-1">
                      The room is empty and ready to use
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (4 cols) - Upcoming Meetings */}
          <div className="lg:col-span-4 bg-slate-800/40 border border-white/10 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md overflow-hidden shadow-lg">
            <div className="flex flex-col h-full overflow-hidden">
              {/* NEXT MEETING */}
              <div className="pb-4 mb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold tracking-wider text-cyan-400 uppercase">
                    Next Meeting
                  </span>
                </div>

                {nextMeeting ? (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-2.5 transition hover:bg-slate-900/50">
                    {/* LEFT */}
                    <div className="min-w-0 max-w-[65%]">
                      <h5 className="line-clamp-3 text-base font-semibold text-white">
                        {nextMeeting.title}
                      </h5>

                      <p className="mt-2 truncate text-sm text-blue-200">
                        Organizer:{" "}
                        <span className="font-medium text-blue-100 capitalize">
                          {nextMeeting.organizer || "Admin"}
                        </span>
                      </p>
                    </div>

                    {/* RIGHT */}
                    <div className="shrink-0 text-right">
                      <span className="mt-1 flex items-center justify-end gap-1 text-sm font-medium text-cyan-300">
                        {nextMeeting.startTime
                          ? dayjs(nextMeeting.startTime).isSame(dayjs(), "day")
                            ? "Today"
                            : dayjs(nextMeeting.startTime).format("DD MMM YYYY")
                          : nextMeeting.date || "Today"}
                      </span>

                      <span className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-cyan-300">
                        <Clock size={10} className="text-cyan-400" />

                        {nextMeeting.startTime
                          ? `${formatTime(nextMeeting.startTime)} - ${formatTime(
                              nextMeeting.endTime,
                            )}`
                          : nextMeeting.startTimeLabel
                            ? `${nextMeeting.startTimeLabel} - ${nextMeeting.endTimeLabel}`
                            : nextMeeting.date || "-"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-blue-200/40 border border-dashed border-white/10 rounded-xl">
                    No upcoming meetings today
                  </div>
                )}
              </div>

              {/* UPCOMING LIST */}
              <div className="grow overflow-y-auto pr-1 flex flex-col">
                <h4 className="text-lg font-bold tracking-wider text-cyan-400 uppercase mb-3 shrink-0">
                  Upcoming Schedule
                </h4>

                {upcomingMeetings.length > 0 ? (
                  <div className="space-y-2.5">
                    {upcomingMeetings.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-slate-900/30 p-2.5 transition hover:bg-slate-900/50"
                      >
                        <div className="min-w-0 max-w-[65%]">
                          <h5 className="line-clamp-3 text-base font-semibold text-white">
                            {item.title}
                          </h5>

                          <p className="mt-2 truncate text-sm text-blue-200">
                            Organizer:{" "}
                            <span className="font-medium text-blue-100 capitalize">
                              {item.organizer || "Admin"}
                            </span>
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          {/* <span className="text-sm text-cyan-500 font-medium"> */}{" "}
                          <span className="mt-1 flex items-center justify-end gap-1 text-sm font-medium text-cyan-300">
                            {item.startTime
                              ? dayjs(item.startTime).isSame(dayjs(), "day")
                                ? "Today"
                                : dayjs(item.startTime).format("DD MMM YYYY")
                              : item.date || "Today"}
                          </span>
                          <span className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-cyan-300">
                            <Clock size={10} className="text-cyan-400" />

                            {item.startTime
                              ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
                              : item.startTimeLabel
                                ? `${item.startTimeLabel} - ${item.endTimeLabel}`
                                : item.date || "-"}
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
