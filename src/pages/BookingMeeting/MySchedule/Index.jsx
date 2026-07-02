import { useMySchedule } from "../../../hook/BookingMeeting/useMyShcedule";
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
} from "lucide-react";
const IndexMySchedule = () => {
  const { myScheduleQuery } = useMySchedule();

  // Format untuk tanggal lengkap dengan waktu
  const formatFullDateTime = (dateStr) => {
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

  // Format hanya untuk waktu (tanpa tanggal)
  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format hanya untuk tanggal (tanpa waktu)
  const formatDateOnly = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const { data, isLoading, isError, error } = myScheduleQuery;
  const schedule = data || [];
  const totalItems = myScheduleQuery.data?.data?.pagination?.total || 0;
  const hasData = schedule.length > 0;

  if (isLoading) {
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
    <div className="space-y-4">
      {hasData ? (
        <>
          {/* Header Info Statistik Kecil */}
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between px-1">
            <span className="uppercase tracking-wider">
              Showing{" "}
              <strong className="text-blue-400 font-semibold">
                {schedule.length}
              </strong>{" "}
              of{" "}
              <strong className="text-blue-400 font-semibold">
                {totalItems}
              </strong>{" "}
              schedule items
            </span>
          </div>

          {/* Grid Schedules */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schedule.map((item) => (
              <div
                key={item._id}
                className="bg-linear-to-b from-slate-900/40 to-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg shadow-black/20 hover:border-white/20 hover:translate-y-0.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Efek dekoratif sudut khas IndexBooking */}
                <div className="absolute top-0 right-0 w-12 h-12 rounded-bl-full opacity-5 bg-blue-500 group-hover:opacity-10 transition-opacity duration-300" />

                {/* Konten Atas & Tengah */}
                <div>
                  {/* Bagian Atas: Room Badge & Waktu */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/15">
                      {item.roomId?.nama || "No Room"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {formatDateOnly(item.startTime)}
                    </span>
                  </div>

                  {/* Judul */}
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors duration-300 leading-snug">
                    {item.title}
                  </h3>

                  {/* Deskripsi */}
                  <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                {/* Konten Bawah (Metadata & Aksi) */}
                <div className="mt-auto space-y-3">
                  <div className="border-t border-white/5 pt-3" />

                  {/* Baris Keterangan Organizer & Jam */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Organizer */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 shadow-inner">
                        {item.organizerId?.username?.charAt(0).toUpperCase() ||
                          "O"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                          Organizer
                        </span>
                        <span className="text-xs font-medium text-slate-300 truncate">
                          {item.organizerId?.username || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Jam Sesi */}
                    <div className="text-right shrink-0">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
                        Time Slot
                      </span>
                      <span className="inline-flex items-center text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono">
                        {formatTimeOnly(item.startTime)} -{" "}
                        {formatTimeOnly(item.endTime)}
                      </span>
                    </div>
                  </div>

                  {/* Baris Tombol Aksi (Management Actions) */}
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    <button
                      // onClick={() => openResultsModal(item)}
                      className="flex items-center justify-center p-2 rounded-lg text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer"
                      title="View Meeting Results"
                    >
                      <FileText size={15} />
                    </button>

                    <button
                      // onClick={() => openModal("edit", item)}
                      className="flex items-center justify-center p-2 rounded-lg text-blue-400 bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/20 hover:text-blue-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                      // disabled={disabledActions}
                      title="Edit Meeting Details"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      // onClick={() => openModal("reschedule", item)}
                      className="flex items-center justify-center p-2 rounded-lg text-amber-400 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/20 hover:text-amber-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                      // disabled={disabledActions}
                      title="Reschedule Meeting"
                    >
                      <RotateCcw size={15} />
                    </button>

                    <button
                      // onClick={() => openModal("cancel", item)}
                      className="flex items-center justify-center p-2 rounded-lg text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/5 cursor-pointer"
                      // disabled={disabledActions}
                      title="Cancel Meeting"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Tampilan Kosong (Empty State) */
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
    </div>
  );
};

export default IndexMySchedule;
