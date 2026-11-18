import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../../../api/axios";
import { getAttendanceRecap } from "../../../services/BookingMeeting/attendance";

export default function AttendanceModal({ meeting, mode }) {
  const recap = useQuery({
    queryKey: ["meetingAttendance", meeting?._id],
    queryFn: () => getAttendanceRecap(meeting._id),
    enabled: Boolean(meeting?._id && mode === "recap"),
  });
  if (!meeting) return null;
  const attendanceUrl = `${window.location.origin}/attendance/${meeting._id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(attendanceUrl)}`;

  return <div className="space-y-5 p-6 text-white">
    <header className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{mode === "qr" ? "QR Code Absensi" : "Rekap Absensi"}</h2><p className="mt-1 text-sm text-slate-400">{meeting.title}</p></div><button className="btn btn-sm btn-circle btn-ghost" onClick={() => document.getElementById("meetingAttendanceModal")?.close()}>✕</button></header>
    {mode === "qr" ? <div className="grid justify-items-center gap-4 text-center"><img src={qrUrl} alt="QR code form absensi" className="rounded-xl bg-white p-2"/><p className="max-w-sm text-sm text-slate-300">Peserta dapat memindai QR ini untuk membuka form absensi. Form memerlukan login akun peserta meeting.</p><a href={attendanceUrl} className="link link-info text-xs break-all">{attendanceUrl}</a></div> : recap.isLoading ? <div className="py-12 text-center"><span className="loading loading-spinner"/></div> : recap.isError ? <p className="text-sm text-rose-300">{recap.error?.response?.data?.message || "Rekap tidak dapat dimuat."}</p> : <><p className="text-sm text-slate-300">{recap.data.data.length} peserta telah mengisi absensi.</p><div className="max-h-[60vh] space-y-3 overflow-y-auto">{recap.data.data.length ? recap.data.data.map((record) => <article key={record._id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><img src={`${API_URL}${record.photo}`} alt={`Foto ${record.name}`} className="h-14 w-14 rounded-lg object-cover"/><div><p className="font-semibold">{record.name}</p><p className="text-xs text-slate-400">{new Date(record.checkedInAt).toLocaleString("id-ID")}</p></div></article>) : <p className="py-8 text-center text-sm text-slate-400">Belum ada absensi.</p>}</div></>}
  </div>;
}
