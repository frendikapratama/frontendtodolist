import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import {
  getAttendanceOptions,
  submitAttendance,
} from "../../../services/BookingMeeting/attendance";

export default function AttendanceForm() {
  const { meetingId } = useParams();
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.nama || user?.username || "");
  const [participantId, setParticipantId] = useState("");
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const userPrefillDoneRef = useRef(false);
  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : ""),
    [photo],
  );
  const optionsQuery = useQuery({
    queryKey: ["meetingAttendanceOptions", meetingId],
    queryFn: () => getAttendanceOptions(meetingId),
  });
  const participants = optionsQuery.data?.data || [];
  const nameSuggestions = participants.filter((person) =>
    String(person.name || "")
      .toLowerCase()
      .includes(name.trim().toLowerCase()),
  );
  const mutation = useMutation({
    mutationFn: (body) => submitAttendance(meetingId, body),
    onSuccess: () => toast.success("Attendance successfully recorded."),
    onError: (error) =>
      toast.error(
        error.response?.data?.message || "Attendance submission failed.",
      ),
  });

  const submit = (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("name", name);
    body.append("photo", photo);
    if (participantId) body.append("participantId", participantId);
    mutation.mutate(body);
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  };

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    if (!photoPreview) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  useEffect(() => {
    if (!user || !optionsQuery.isSuccess || userPrefillDoneRef.current) return;
    userPrefillDoneRef.current = true;
    const currentUser = participants.find(
      (person) => person.userId === (user._id || user.id),
    );
    if (currentUser && !currentUser.attended) {
      setName(currentUser.name);
      setParticipantId(currentUser.participantId || "");
    }
  }, [user, participants, optionsQuery.isSuccess]);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser does not support camera access.");
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
      setCameraError(
        "Camera cannot be accessed. Please allow camera access and try again.",
      );
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement("canvas");
    const maxDimension = 1600;
    const scale = Math.min(
      1,
      maxDimension / Math.max(video.videoWidth, video.videoHeight),
    );
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPhoto(
            new File([blob], `attendance-${Date.now()}.jpg`, {
              type: "image/jpeg",
            }),
          );
          stopCamera();
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  if (mutation.isSuccess) {
    const record = mutation.data.data;
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
        <section className="max-w-md rounded-2xl border border-emerald-400/20 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Attendance Recorded</h1>
          <img
            src={`${API_URL}${record.photo}`}
            alt={`Photo ${record.name}`}
            className="mx-auto mt-5 h-32 w-32 rounded-xl object-cover"
          />
          <p className="mt-4 text-lg font-semibold">{record.name}</p>
          <p className="mt-1 text-sm text-slate-400">
            Attendance and your photo have been recorded in the meeting recap.
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
          <h1 className="text-2xl font-bold">Meeting Attendance Form</h1>
          <p className="mt-1 text-sm text-slate-400">
            Fill in your name and take a photo using the camera to record your
            attendance.
          </p>
        </div>
        <label className="block space-y-2 text-sm">
          Name
          <div className="relative">
            <input
              required
              maxLength={120}
              value={name}
              onFocus={() => setShowNameSuggestions(true)}
              onChange={(event) => {
                const value = event.target.value;
                setName(value);
                const match = participants.find(
                  (person) =>
                    !person.attended &&
                    String(person.name || "").toLowerCase() ===
                      value.trim().toLowerCase(),
                );
                setParticipantId(match?.participantId || "");
                setShowNameSuggestions(true);
              }}
              onBlur={() =>
                setTimeout(() => setShowNameSuggestions(false), 120)
              }
              className="input input-bordered w-full bg-slate-950"
              autoComplete="off"
            />
            {showNameSuggestions && nameSuggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl">
                {nameSuggestions.map((person) => (
                  <li key={person.participantId}>
                    <button
                      type="button"
                      disabled={person.attended}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setName(person.name);
                        setParticipantId(person.participantId || "");
                        setShowNameSuggestions(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>{person.name}</span>
                      {person.attended && (
                        <span className="ml-2 text-xs text-slate-400">
                          Already checked in
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {optionsQuery.isError && (
            <span role="alert" className="block text-xs text-rose-300">
              {optionsQuery.error?.response?.data?.message ||
                "Daftar undangan gagal dimuat."}
            </span>
          )}
        </label>
        <div className="space-y-2 text-sm">
          Photo
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
                Take Another Photo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <video
                ref={videoRef}
                muted
                playsInline
                className={`w-full rounded-xl bg-black ${cameraReady ? "block" : "hidden"}`}
              />
              {!cameraReady && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn btn-outline w-full"
                >
                  Open Camera
                </button>
              )}
              {cameraReady && (
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="btn btn-primary w-full"
                >
                  Take Photo
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
            Photo must be taken directly using the camera.
          </span>
        </div>
        <button
          disabled={!photo || mutation.isPending}
          className="btn btn-primary w-full"
        >
          {mutation.isPending ? "Sending..." : "Submit Attendance"}
        </button>
      </form>
    </main>
  );
}
