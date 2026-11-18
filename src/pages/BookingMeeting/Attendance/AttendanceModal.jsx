import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "../../../api/axios";
import { getAttendanceRecap } from "../../../services/BookingMeeting/attendance";

export default function AttendanceModal({ meeting, mode }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const recap = useQuery({
    queryKey: ["meetingAttendance", meeting?._id],
    queryFn: () => getAttendanceRecap(meeting._id),
    enabled: Boolean(meeting?._id && mode === "recap"),
  });

  const attendanceUrl = meeting
    ? `${window.location.origin}/attendance/${meeting._id}`
    : "";

  useEffect(() => {
    if (!meeting || mode !== "qr") return;
    let active = true;
    setQrDataUrl("");
    setQrError("");
    import("qrcode")
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(attendanceUrl, {
          width: 240,
          margin: 1,
          errorCorrectionLevel: "M",
        }),
      )
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrError("QR code gagal dibuat. Silakan coba lagi.");
      });
    return () => {
      active = false;
    };
  }, [attendanceUrl, meeting, mode]);

  if (!meeting) return null;

  return (
    <div className="space-y-5 p-6 text-white">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {mode === "qr" ? "Attendance QR Code" : "Attendance Records"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{meeting.title}</p>
        </div>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() =>
            document.getElementById("meetingAttendanceModal")?.close()
          }
        >
          ✕
        </button>
      </header>

      {mode === "qr" ? (
        <div className="grid justify-items-center gap-4 text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code form absensi"
              className="rounded-xl bg-white p-2"
            />
          ) : qrError ? (
            <p role="alert" className="py-12 text-sm text-rose-300">
              {qrError}
            </p>
          ) : (
            <div className="grid h-64 w-64 place-items-center rounded-xl bg-white/5">
              <span className="loading loading-spinner" />
            </div>
          )}
          <p className="max-w-sm text-sm text-slate-300">
            Participants can scan this QR code to open the attendance form and
            select their name from the invitation list or enter a new name.
          </p>
          <a href={attendanceUrl} className="link link-info break-all text-xs">
            {attendanceUrl}
          </a>
        </div>
      ) : recap.isLoading ? (
        <div className="py-12 text-center">
          <span className="loading loading-spinner" />
        </div>
      ) : recap.isError ? (
        <p className="text-sm text-rose-300">
          {recap.error?.response?.data?.message || "Rekap tidak dapat dimuat."}
        </p>
      ) : (
        <>
          <p className="text-sm text-slate-300">
            {recap.data.data.length} Participants who have completed attendance.
          </p>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {recap.data.data.length ? (
              recap.data.data.map((record) => (
                <article
                  key={record._id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <img
                    src={`${API_URL}${record.photo}`}
                    alt={`Foto ${record.name}`}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{record.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(record.checkedInAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-400">
                No attendance records yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
