import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { submitAttendance } from "../../../services/BookingMeeting/attendance";

export default function AttendanceForm() {
  const { meetingId } = useParams();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.nama || user?.username || "");
  const [photo, setPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : ""),
    [photo],
  );
  const mutation = useMutation({
    mutationFn: (body) => submitAttendance(meetingId, body),
    onSuccess: () => toast.success("Absensi berhasil direkap."),
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Absensi gagal dikirim.",
      ),
  });

  const submit = (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("name", name);
    body.append("photo", photo);
    mutation.mutate(body);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (!photoPreview) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser ini tidak mendukung akses kamera.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      stopCamera();
      setCameraError("Kamera tidak dapat diakses. Izinkan akses kamera lalu coba lagi.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setPhoto(new File([blob], `attendance-${Date.now()}.jpg`, { type: "image/jpeg" }));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  if (mutation.isSuccess) {
    const record = mutation.data.data;
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-emerald-400/20 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Absensi Tercatat</h1>
          <img
            src={`${API_URL}${record.photo}`}
            alt={`Foto ${record.name}`}
            className="mx-auto mt-5 h-32 w-32 rounded-xl object-cover"
          />
          <p className="mt-4 text-lg font-semibold">{record.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            Absensi dan foto Anda sudah masuk ke rekap meeting.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-slate-900 p-7"
      >
        <div>
          <h1 className="text-2xl font-bold">Form Absensi Meeting</h1>
          <p className="mt-1 text-sm text-slate-400">
            Isi nama dan ambil foto menggunakan kamera untuk mencatat kehadiran.
          </p>
        </div>
        <label className="block space-y-2 text-sm">
          Nama
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input input-bordered w-full bg-slate-950"
          />
        </label>
        <div className="space-y-2 text-sm">
          Foto
          {photo ? (
            <div className="space-y-3">
              <img
                src={photoPreview}
                alt="Foto absensi"
                className="max-h-72 w-full rounded-xl bg-black object-contain"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="btn btn-outline btn-sm w-full"
              >
                Ambil Ulang Foto
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <video ref={videoRef} muted playsInline className={`w-full rounded-xl bg-black ${cameraReady ? "block" : "hidden"}`} />
              {!cameraReady && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn btn-outline w-full"
                >
                  Buka Kamera
                </button>
              )}
              {cameraReady && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-primary w-full"
                >
                  Ambil Foto
                </button>
              )}
              {cameraError && (
                <p role="alert" className="text-xs text-rose-300">
                  {cameraError}
                </p>
              )}
            </div>
          )}
          <span className="block text-xs text-slate-500">
            Foto harus diambil langsung menggunakan kamera.
          </span>
        </div>
        <button
          disabled={!photo || mutation.isPending}
          className="btn btn-primary w-full"
        >
          {mutation.isPending ? "Mengirim..." : "Kirim Absensi"}
        </button>
      </form>
    </main>
  );
}
