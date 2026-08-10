import React, { useState, useEffect, useContext } from "react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import { AuthContext } from "../../../context/AuthContext";
import TimeWheelPicker from "../../../components/ui/TimeWheelPicker";
import toast from "react-hot-toast";
import {
  MapPin,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  User,
  X,
} from "lucide-react";

import { createPortal } from "react-dom";

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const dateTimeInputClass =
  "input input-bordered w-full bg-black/60 text-white accent-blue-500 [color-scheme:dark]";

const RescheduleMeetingForm = ({ meeting, onClose }) => {
  const { user } = useContext(AuthContext);
  const {
    rescheduleMeetingMutation,
    checkAvailabilityMutation,
    meetingParticipantsQuery,
  } = useMeetings();

  const { roomsQuery } = useRooms();
  const rooms = roomsQuery.data || [];

  const initialDate = meeting.startTime
    ? new Date(meeting.startTime).toISOString().split("T")[0]
    : "";
  const initialStartTime = meeting.startTime
    ? new Date(meeting.startTime).toTimeString().substring(0, 5)
    : "";
  const initialEndTime = meeting.endTime
    ? new Date(meeting.endTime).toTimeString().substring(0, 5)
    : "";

  const [form, setForm] = useState({
    roomId: meeting.roomId?._id || meeting.roomId || "",
    date: initialDate,
    startTime: initialStartTime,
    endTime: initialEndTime,
  });
  const [availability, setAvailability] = useState(null);
  const [checked, setChecked] = useState(false);

  const { data: participantsData } = meetingParticipantsQuery(meeting._id);

  const [conflicts, setConflicts] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [participantIds, setParticipantIds] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    if (participantsData?.data) {
      // Hanya peserta internal yang relevan untuk cek konflik jadwal reschedule
      const internal = participantsData.data.filter((p) => !p.isExternal);

      const ids = internal.map((p) => p.userId._id || p.userId);
      setParticipantIds(ids);
      setSelectedParticipants(
        internal.map((p) => ({
          _id: p.userId._id || p.userId,
          username: p.userId.username,
          email: p.userId.email,
        })),
      );
    }
  }, [participantsData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setChecked(false);
    setAvailability(null);
  };

  const getTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const h = pad(Math.floor(Math.abs(offset) / 60));
    const m = pad(Math.abs(offset) % 60);
    return `${sign}${h}:${m}`;
  };

  const getStartTime = () =>
    form.date && form.startTime
      ? `${form.date}T${form.startTime}:00${getTimezoneOffset()}`
      : null;

  const getEndTime = () =>
    form.date && form.endTime
      ? `${form.date}T${form.endTime}:00${getTimezoneOffset()}`
      : null;

  const validateBasics = () => {
    if (!form.roomId) return "Please select a room";
    if (!form.date) return "Please select a date";
    if (!form.startTime) return "Please select a start time";
    if (!form.endTime) return "Please select an end time";
    if (form.endTime <= form.startTime)
      return "End time must be after start time";
    return null;
  };

  const doReschedule = async () => {
    try {
      const changedBy = user?._id || user?.id;
      await rescheduleMeetingMutation.mutateAsync({
        id: meeting._id,
        payload: {
          roomId: form.roomId,
          startTime: getStartTime(),
          endTime: getEndTime(),
          changedBy,
        },
      });
      onClose();
    } catch (error) {
      // toast is handled in hook
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateBasics();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const result = await checkAvailabilityMutation.mutateAsync({
        roomId: form.roomId,
        participantIds,
        startTime: getStartTime(),
        endTime: getEndTime(),
        excludeMeetingId: meeting._id,
      });

      setChecked(true);

      const relevantConflicts = result.participantConflicts || [];
      setConflicts(relevantConflicts);

      if (relevantConflicts.length > 0) {
        setShowConfirmModal(true);
        return;
      }

      await doReschedule();
    } catch (error) {
      toast.error("Failed to check availability");
    }
  };
  const renderConflictModal = () => {
    if (!showConfirmModal) return null;
    const dialogEl = document.getElementById("meetingManagementModal");
    if (!dialogEl) return null;

    // Buat container di dalam dialog
    const portalContainer = document.createElement("div");
    portalContainer.className = "modal-overlay";
    dialogEl.appendChild(portalContainer);

    return createPortal(
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-gray-900 rounded-2xl max-w-lg w-full border border-gray-700 shadow-2xl">
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="text-yellow-400" />
              Participant Conflicts
            </h3>
            <button
              onClick={() => setShowConfirmModal(false)}
              className="btn btn-ghost btn-sm text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm text-yellow-300/80">
              {conflicts.length} participant
              {conflicts.length !== 1 ? "s" : ""} already have a meeting at this
              new time. You can still proceed.
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {conflicts.map((conflict, index) => {
                const uid =
                  typeof conflict.userId === "string"
                    ? conflict.userId
                    : conflict.userId?._id;
                const localUser = selectedParticipants.find(
                  (p) => p._id === uid,
                );
                const displayName =
                  localUser?.username || conflict.userId?.username || "Unknown";
                const displayEmail =
                  localUser?.email || conflict.userId?.email || "";

                return (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <span className="text-sm text-white font-medium">
                        {displayName}
                      </span>
                      {displayEmail && (
                        <span className="text-xs text-gray-400">
                          ({displayEmail})
                        </span>
                      )}
                    </div>
                    <div className="mt-1 ml-5 flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={11} className="text-yellow-400" />
                      <span className="text-yellow-300">
                        {conflict.meetingId?.title || "Unknown meeting"}
                      </span>
                    </div>
                    {conflict.meetingId?.startTime &&
                      conflict.meetingId?.endTime && (
                        <div className="ml-9 text-[10px] text-gray-500">
                          {new Date(
                            conflict.meetingId.startTime,
                          ).toLocaleString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(
                            conflict.meetingId.endTime,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn bg-gray-700 hover:bg-gray-600 border-none text-white btn-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmModal(false);
                  await doReschedule();
                }}
                className="btn btn-warning btn-sm"
                disabled={rescheduleMeetingMutation.isPending}
              >
                {rescheduleMeetingMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Proceed Anyway
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>,
      portalContainer,
    );
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Room */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white flex items-center gap-1.5">
              <MapPin size={14} /> Room
            </span>
          </label>
          <select
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            className="select select-bordered w-full bg-black/60 text-white"
            required
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.nama} — {room.lokasi} (cap. {room.kapasitas})
              </option>
            ))}
          </select>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 text-white">Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              min={todayStr()}
              onChange={handleChange}
              className={dateTimeInputClass}
              required
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 text-white">Start Time</span>
            </label>
            <TimeWheelPicker
              value={form.startTime}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, startTime: val }));
                setChecked(false);
                setAvailability(null);
              }}
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 text-white">End Time</span>
            </label>
            <TimeWheelPicker
              value={form.endTime}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, endTime: val }));
                setChecked(false);
                setAvailability(null);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-slate-300"
            disabled={rescheduleMeetingMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-warning"
            disabled={rescheduleMeetingMutation.isPending}
          >
            {rescheduleMeetingMutation.isPending
              ? "Rescheduling…"
              : "Confirm Reschedule"}
          </button>
        </div>
      </form>
      {renderConflictModal()}{" "}
    </>
  );
};

export default RescheduleMeetingForm;
