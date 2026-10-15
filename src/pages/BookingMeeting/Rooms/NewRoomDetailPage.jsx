import React, { useState, useEffect, useRef } from "react";
import {
  useParams as useReactParams,
  useNavigate as useReactNavigate,
} from "react-router-dom";
import useRooms from "../../../hook/BookingMeeting/useRooms";

import GradientText from "../../../components/ui/GradientText";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  Users,
  CalendarDays,
  Hourglass,
  BarChart3,
  Rocket,
} from "lucide-react";
import { API_URL } from "../../../api/axios";
import bgImage from "../../../assets/bg.jpeg";
import bgImageHeader from "../../../assets/bg-header - Copy.jpeg";

dayjs.locale("id");

export default function RoomDetailPage() {
  const BASE_URL = API_URL;
  const { roomId } = useReactParams();
  const navigate = useReactNavigate();

  const { useDetailRoom } = useRooms();
  const { data, isLoading, isError, error } = useDetailRoom(roomId);

  const [time, setTime] = useState(dayjs().format("HH:mm:ss"));
  const meetingListRef = useRef(null);
  const thisWeekMeetings = data?.nextMeetings?.thisWeek;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs().format("HH:mm:ss"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const list = meetingListRef.current;
    if (!list || !thisWeekMeetings?.length) return;

    const scrollSpeed = 35;
    let animationFrame;
    let direction = 1;
    let previousTime;

    const animate = (timestamp) => {
      const maxScroll = list.scrollHeight - list.clientHeight;
      if (maxScroll <= 1) {
        animationFrame = undefined;
        return;
      }

      const elapsed = previousTime
        ? Math.min(timestamp - previousTime, 50) / 1000
        : 0;
      previousTime = timestamp;

      const nextScrollTop = list.scrollTop + direction * scrollSpeed * elapsed;

      if (nextScrollTop >= maxScroll) {
        list.scrollTop = maxScroll;
        direction = -1;
      } else if (nextScrollTop <= 0) {
        list.scrollTop = 0;
        direction = 1;
      } else {
        list.scrollTop = nextScrollTop;
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (
        animationFrame === undefined &&
        list.scrollHeight - list.clientHeight > 1
      ) {
        previousTime = undefined;
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(startAnimation);
    resizeObserver?.observe(list);
    if (list.firstElementChild) {
      resizeObserver?.observe(list.firstElementChild);
    }
    const animationCheck = window.setInterval(startAnimation, 300);
    startAnimation();

    return () => {
      resizeObserver?.disconnect();
      window.clearInterval(animationCheck);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [thisWeekMeetings]);

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
      <div className="h-screen w-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">
            Memuat detail ruangan...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="h-screen w-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center max-w-md w-full shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Gagal Memuat Data
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            {error?.response?.data?.message ||
              error?.message ||
              "Terjadi kesalahan yang tidak diketahui"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!data) {
    return (
      <div className="h-screen w-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center text-slate-600">
          <p className="mb-4 font-medium">Ruangan tidak ditemukan.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm hover:bg-blue-100 transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} /> Kembali
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
    dailyMeetings,
    totalMeetingToday,
    totalMeetingTomorrow,
  } = data;

  return (
    <div
      className="bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col justify-between bg-slate-50/60 p-3 sm:p-5 select-none font-sans text-slate-800">
        <header class="w-full  bg-white shadow-xl rounded-2xl overflow-hidden border border-blue-100 flex flex-col lg:flex-row items-center justify-between">
          <div class="flex items-center justify-between lg:justify-start px-6 py-4 w-full lg:w-auto bg-linear-to-r from-blue-50/50 to-transparent">
            <div class="flex items-center space-x-3">
              <div class="text-blue-600 text-3xl sm:text-4xl">
                <i class="fa-solid fa-calendar-days"></i>
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text leading-none">
                  <GradientText
                    colors={["#40ffaa", "#4079ff", "#40ffaa"]}
                    animationSpeed={4}
                    showBorder={false}
                    className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  >
                    Planify
                  </GradientText>
                </h1>
                <p class="text-[11px] sm:text-xs text-blue-600 font-semibold tracking-wider uppercase mt-1">
                  Smart Meeting, Better Collaboration
                </p>
              </div>
            </div>
            <div class="hidden sm:block h-10 w-px bg-slate-300 ml-6"></div>
          </div>

          <div class="flex items-center space-x-4 px-6 py-4 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 bg-white">
            <div>
              <h2 class="text-lg sm:text-xl font-extrabold text-blue-950 tracking-tight capitalize">
                {room?.nama || "Ruang Meeting"}
              </h2>
              <p class="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 capitalize">
                {room?.lokasi || "Office Lantai 2 HPC"}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-4 px-6 py-4 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 bg-linear-to-r from-transparent to-blue-50/30">
            <div class="text-blue-600 text-3xl">
              <i class="fa-regular fa-calendar-days"></i>
            </div>
            <div>
              <div
                id="live-date"
                class="text-xs sm:text-sm font-semibold text-slate-600"
              >
                <span>{dayjs().format("dddd, D MMMM YYYY")}</span>
              </div>
              <div
                id="live-time"
                class="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-wider font-mono"
              >
                {time}
              </div>
            </div>
          </div>

          <div class="relative w-full lg:w-[360px] h-28 sm:h-32 lg:h-32 overflow-hidden bg-blue-700 flex items-center justify-start [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] lg:[clip-path:polygon(15%_0,100%_0,100%_100%,0_100%)] ml-auto rounded-lg shadow-sm">
            {/* Background Image menggunakan div dengan inline style background-image */}
            <div
              class="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgImageHeader})` }}
            ></div>

            {/* Overlay gradien biru solid di kiri yang memudar ke transparan di kanan */}
            <div class="absolute inset-0 bg-linear-to-r from-blue-700 via-blue-700/90 to-transparent"></div>

            {/* Kontainer Teks */}
            <div class="relative z-10 w-full text-left pl-10 sm:pl-12 pr-6 text-white">
              <p class="text-xs sm:text-sm font-semibold italic tracking-wide leading-snug drop-shadow">
                PT Alkindo Naratama Tbk.
                <br />
                Partnership Through Quality
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3 grow overflow-hidden">
          <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden shadow-md border border-slate-200 shrink-0 flex flex-col justify-end group">
              <img
                src={`${BASE_URL}/uploads/rooms/${room.photo}`}
                alt={room.nama}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="relative bg-slate-900/85 backdrop-blur-md px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-3 border-t border-white/10">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-xs shrink-0 ${
                      status === "BUFFER"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : !isAvailable
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === "BUFFER"
                          ? "bg-amber-400 animate-pulse"
                          : !isAvailable
                            ? "bg-rose-400 animate-pulse"
                            : "bg-emerald-400"
                      }`}
                    />
                    <span className="text-xs font-bold tracking-wide uppercase">
                      {status || (!isAvailable ? "In Progress" : "Available")}
                    </span>
                  </div>
                </div>

                {/* Indikator Sisa Waktu (Timer) */}
                {Boolean(remainingMinutes) && Number(remainingMinutes) > 0 && (
                  <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium shrink-0 shadow-sm text-slate-200">
                    <Hourglass
                      size={13}
                      className="text-amber-400 animate-pulse"
                    />
                    <span>
                      Sisa{" "}
                      <strong className="text-white font-semibold">
                        {remainingMinutes}
                      </strong>{" "}
                      min
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: Meeting Hari Ini (Emerald Theme) */}
              <div className="group relative overflow-hidden flex items-center justify-between p-5 bg-linear-to-br from-emerald-50/80 to-emerald-100/30 border border-emerald-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300">
                {/* Subtle Decorative Left Accent Pill */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />

                <div className="space-y-1.5 pl-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80">
                    Total Meeting Hari Ini
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black tracking-tight text-emerald-950">
                      {totalMeetingToday || 0}
                    </p>
                    <span className="text-xs font-medium text-emerald-700/80">
                      Jadwal
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-700 font-extrabold text-base ring-1 ring-inset ring-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                  <CalendarDays size={20} />
                </div>
              </div>

              <div className="group relative overflow-hidden flex items-center justify-between p-5 bg-linear-to-br from-amber-50/80 to-amber-100/30 border border-amber-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full" />

                <div className="space-y-1.5 pl-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800/80">
                    Total Meeting Besok
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black tracking-tight text-amber-950">
                      {totalMeetingTomorrow || 0}
                    </p>
                    <span className="text-xs font-medium text-amber-700/80">
                      Jadwal
                    </span>
                  </div>
                </div>

                {/* Modern Floating Metric Badge */}
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 font-extrabold text-base ring-1 ring-inset ring-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Rocket size={20} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SECTION BAWAH: Meeting Saat Ini */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm shrink-0 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock size={25} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Meeting Saat Ini
                  </h3>
                </div>

                {currentMeeting ? (
                  <div className="flex flex-col sm:flex-row items-start justify-center gap-4 p-3 rounded-xl  my-auto">
                    <div className="w-full min-w-0">
                      <div className="w-full min-w-0">
                        <h4 className="text-xl font-bold text-slate-800">
                          {currentMeeting.title}
                        </h4>

                        <div className="w-full flex items-center justify-between gap-3 py-3">
                          <span className="text-xl sm:text-2xl text-slate-600 font-bold tracking-tight">
                            {formatTime(currentMeeting.startTime)} -{" "}
                            {formatTime(currentMeeting.endTime)}
                          </span>

                          {remainingMinutes != null && (
                            <span className="shrink-0 text-lg sm:text-xl font-semibold text-blue-600  px-3 py-1 rounded-full">
                              Sisa {remainingMinutes} mnt
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Users size={24} />
                          <p className="text-xl text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700">
                              {currentMeeting.organizerId?.username ||
                                currentMeeting.organizer ||
                                "Admin"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    Tidak ada meeting yang sedang berlangsung saat ini. Ruangan
                    siap digunakan.
                  </div>
                )}
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm shrink-0">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BarChart3 size={25} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Statistik Meeting Harian
                  </h3>
                </div>

                {Array.isArray(dailyMeetings) && dailyMeetings.length > 0 ? (
                  <div className="pt-2">
                    {/* Area Grafik Batang */}
                    <div className="h-36 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
                      {dailyMeetings.map((item, index) => {
                        const maxTotal = Math.max(
                          ...dailyMeetings.map((d) => d.total),
                          5,
                        );
                        const heightPercentage = (item.total / maxTotal) * 100;

                        const activeColors = [
                          "bg-blue-600 hover:bg-blue-700", // Hari ke-1
                          "bg-indigo-600 hover:bg-indigo-700", // Hari ke-2
                          "bg-violet-600 hover:bg-violet-700", // Hari ke-3
                          "bg-emerald-600 hover:bg-emerald-700", // Hari ke-4
                          "bg-amber-600 hover:bg-amber-700", // Hari ke-5
                          "bg-rose-600 hover:bg-rose-700", // Hari ke-6
                          "bg-cyan-600 hover:bg-cyan-700", // Hari ke-7
                        ];

                        const colorClass =
                          activeColors[index % activeColors.length];

                        return (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center h-full justify-end group relative"
                          >
                            <div className="absolute -top-7 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none z-10">
                              {item.total} meeting
                            </div>

                            <span className="text-[10px] font-semibold text-slate-700 mb-1">
                              {item.total > 0 ? item.total : ""}
                            </span>

                            {/* Batang Grafik */}
                            <div
                              className={`w-full max-w-[26px] rounded-t-lg transition-all duration-300 shadow-sm ${
                                item.total > 0
                                  ? colorClass
                                  : "bg-slate-100 hover:bg-slate-200"
                              }`}
                              style={{
                                height: `${Math.max(heightPercentage, 8)}%`,
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between gap-2 px-2 pt-3">
                      {dailyMeetings.map((item, index) => (
                        <div key={index} className="flex-1 text-center">
                          <p className="text-[11px] font-semibold text-slate-700">
                            {item.day.slice(0, 3)}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {item.date.split("-").slice(1).join("/")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    Tidak ada data statistik.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-1 gap-1 h-full min-h-0">
            {/* CARD 1: MINGGU INI */}
            <div className="h-full min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              {/* Header Card */}
              <div className="px-4 py-3 bg-linear-to-r from-blue-700/80 via-blue-800/90 to-blue-900 flex items-center justify-between">
                <h4 className="text-lg font-semibold uppercase tracking-wider text-slate-50">
                  Minggu Ini
                </h4>
                <span className="text-sm font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {nextMeetings?.thisWeek?.length || 0} meeting
                </span>
              </div>

              {/* Konten List Meeting (Menggunakan Grid / Flex) */}
              <div
                ref={meetingListRef}
                className="p-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar"
              >
                {nextMeetings?.thisWeek?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {nextMeetings.thisWeek.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200/60 rounded-xl transition-all shadow-2xs hover:shadow-sm"
                      >
                        <h5 className="text-lg font-semibold text-slate-800 truncate">
                          {item.title}
                        </h5>

                        <div className="flex items-center gap-1.5 text-base text-slate-500 mt-1">
                          <Users
                            size={12}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="truncate">
                            {item.organizer || "Admin"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm mt-2.5 pt-2 border-t border-slate-100">
                          <span className="font-medium text-blue-600">
                            {dayjs(item.startTime).format("ddd, DD MMM")}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {formatTime(item.startTime)} -{" "}
                            {formatTime(item.endTime)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Tidak ada meeting tersisa minggu ini.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BAWAH */}
        <div className=" text-xs text-slate-500 ">
          <div className="flex items-center gap-2">
            <span>
              © 2026 Developed by IT Aldo | PT. Alkindo Naratama Tbk. | All
              rights reserved.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
