import React, { useState, useContext } from "react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import { AuthContext } from "../../../context/AuthContext";
import TimeWheelPicker from "../../../components/ui/TimeWheelPicker";
import { MapPin, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const dateTimeInputClass =
  "input input-bordered w-full bg-black/60 text-white accent-blue-500 [color-scheme:dark]";

const RescheduleMeetingForm = ({ meeting, onClose }) => {
  const { user } = useContext(AuthContext);
  const { rescheduleMeetingMutation, checkAvailabilityMutation } =
    useMeetings();
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setChecked(false);
    setAvailability(null);
  };

  const getStartTime = () =>
    form.date && form.startTime ? `${form.date}T${form.startTime}:00` : null;
  const getEndTime = () =>
    form.date && form.endTime ? `${form.date}T${form.endTime}:00` : null;

  const validateBasics = () => {
    if (!form.roomId) return "Please select a room";
    if (!form.date) return "Please select a date";
    if (!form.startTime) return "Please select a start time";
    if (!form.endTime) return "Please select an end time";
    if (form.endTime <= form.startTime)
      return "End time must be after start time";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateBasics();
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const changedBy = user?._id || user?.id;
      const res = await rescheduleMeetingMutation.mutateAsync({
        id: meeting._id,
        payload: {
          roomId: form.roomId,
          startTime: getStartTime(),
          endTime: getEndTime(),
          changedBy,
        },
      });

      if (res.participantConflicts && res.participantConflicts.length > 0) {
        toast.error("Rescheduled, but there are participant conflicts!");
      }

      onClose();
    } catch (error) {
      // toast is handled in hook
    }
  };

  return (
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
  );
};

export default RescheduleMeetingForm;
