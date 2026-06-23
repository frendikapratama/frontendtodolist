import React, {
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import useRooms from "../../../hook/BookingMeeting/useRooms";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import { X, Users, MapPin, AlertTriangle, Clock } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { getUsers } from "../../../services/userServices"; // ← adjust path as needed
import UserSearchSelect from "../../../components/Usersearchselect";
const pad = (n) => String(n).padStart(2, "0");

const todayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const SLOT_START_HOUR = 7;
const SLOT_END_HOUR = 20;

const dateTimeInputClass =
  "input input-bordered w-full bg-black/60 text-white accent-blue-500 [color-scheme:dark]";

const HOURS = Array.from(
  { length: SLOT_END_HOUR - SLOT_START_HOUR + 1 },
  (_, i) => pad(SLOT_START_HOUR + i),
);
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i));

/* ─── TimeWheelPicker (unchanged) ─────────────────────────────────────── */

const TimeWheelPicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [open, setOpen] = useState(false);
  const [tempHour, setTempHour] = useState(HOURS[0]);
  const [tempMinute, setTempMinute] = useState(MINUTES[0]);
  const containerRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const scrollToValue = (listEl, val) => {
    if (!listEl) return;
    const el = listEl.querySelector(`[data-value="${val}"]`);
    el?.scrollIntoView({ block: "center" });
  };

  const openPicker = () => {
    const [h, m] = value ? value.split(":") : [HOURS[0], MINUTES[0]];
    setTempHour(h);
    setTempMinute(m);
    setOpen(true);
    requestAnimationFrame(() => {
      scrollToValue(hourListRef.current, h);
      scrollToValue(minuteListRef.current, m);
    });
  };

  const handleSelectHour = (h) => {
    setTempHour(h);
    scrollToValue(hourListRef.current, h);
  };

  const handleSelectMinute = (m) => {
    setTempMinute(m);
    scrollToValue(minuteListRef.current, m);
  };

  const handleNow = () => {
    const now = new Date();
    let h = pad(now.getHours());
    const m = pad(now.getMinutes());
    if (!HOURS.includes(h)) {
      h = now.getHours() < SLOT_START_HOUR ? HOURS[0] : HOURS[HOURS.length - 1];
    }
    onChange(`${h}:${m}`);
    setOpen(false);
  };

  const handleOk = () => {
    onChange(`${tempHour}:${tempMinute}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="input input-bordered w-full bg-black/60 text-white flex items-center justify-between"
      >
        <span className={value ? "text-white" : "text-slate-500"}>
          {value || placeholder}
        </span>
        <Clock size={16} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex divide-x divide-white/10">
            <div
              ref={hourListRef}
              className="h-32 w-1/2 overflow-y-auto py-5 snap-y snap-mandatory scroll-smooth"
            >
              {HOURS.map((h) => (
                <button
                  type="button"
                  key={h}
                  data-value={h}
                  onClick={() => handleSelectHour(h)}
                  className={`w-full text-center py-1.5 text-xs snap-center transition-colors ${
                    tempHour === h
                      ? "bg-blue-500/20 text-blue-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div
              ref={minuteListRef}
              className="h-36 w-1/2 overflow-y-auto py-5 snap-y snap-mandatory scroll-smooth"
            >
              {MINUTES.map((m) => (
                <button
                  type="button"
                  key={m}
                  data-value={m}
                  onClick={() => handleSelectMinute(m)}
                  className={`w-full text-center py-1.5 text-xs snap-center transition-colors ${
                    tempMinute === m
                      ? "bg-blue-500/20 text-blue-300 font-semibold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between px-3 py-1 border-t border-white/10">
            <button
              type="button"
              onClick={handleNow}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium"
            >
              Now
            </button>
            <button
              type="button"
              onClick={handleOk}
              className="btn btn-primary btn-xs"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── BookingMeetingForm ──────────────────────────────────────────────── */

const BookingMeetingForm = ({ defaultRoomId = "", onSuccess, onClose }) => {
  const { user } = useContext(AuthContext);
  const getOrganizerId = () => user?._id || user?.id || "";

  const { roomsQuery } = useRooms();
  const { checkAvailabilityMutation, createMeetingMutation } = useMeetings();

  const rooms = roomsQuery.data || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    roomId: defaultRoomId,
    date: "",
    startTime: "",
    endTime: "",
  });

  const [participantIds, setParticipantIds] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [checked, setChecked] = useState(false);

  const fetchUsers = useCallback(async (query) => {
    if (!query) return [];
    const res = await getUsers({ search: query, limit: 20 });
    const list = res?.data ?? [];
    return list.map((u) => ({
      _id: u._id,
      username: u.username || u.nama || u.name,
      email: u.email,
      photo: u.photo
        ? `${import.meta.env.VITE_API_URL}/uploads/users/${u.photo}`
        : undefined,
    }));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setChecked(false);
    setAvailability(null);
  };

  const handleParticipantsChange = (ids) => {
    setParticipantIds(ids);
    setChecked(false);
    setAvailability(null);
  };

  const getStartTime = () =>
    form.date && form.startTime ? `${form.date}T${form.startTime}:00` : null;

  const getEndTime = () =>
    form.date && form.endTime ? `${form.date}T${form.endTime}:00` : null;

  const getDurationLabel = () => {
    if (!form.startTime || !form.endTime) return null;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h === 0) return `${m} menit`;
    if (m === 0) return `${h} jam`;
    return `${h} jam ${m} menit`;
  };

  const durationLabel = getDurationLabel();

  const buildPayload = () => ({
    roomId: form.roomId,
    participantIds,
    startTime: getStartTime(),
    endTime: getEndTime(),
  });

  const validateBasics = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.roomId) return "Please select a room";
    if (!form.date) return "Please select a date";
    if (!form.startTime) return "Please select a start time";
    if (!form.endTime) return "Please select an end time";
    if (form.endTime <= form.startTime)
      return "End time must be after start time";
    if (participantIds.length === 0) return "Add at least one participant";
    return null;
  };

  const handleCheckAvailability = async () => {
    const err = validateBasics();
    if (err) {
      toast.error(err);
      return;
    }
    const result = await checkAvailabilityMutation.mutateAsync(buildPayload());
    setAvailability(result);
    setChecked(true);
    if (result.roomAvailable && result.participantConflicts.length === 0) {
      toast.success("Room and participants are available");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateBasics();
    if (err) {
      toast.error(err);
      return;
    }

    const result = await checkAvailabilityMutation.mutateAsync(buildPayload());
    setAvailability(result);
    setChecked(true);

    if (!result.roomAvailable || result.participantConflicts.length > 0) {
      toast.error("There are conflicts — resolve them before booking");
      return;
    }

    const organizerId = getOrganizerId();
    if (!organizerId) {
      toast.error("Could not determine organizer — please log in again");
      return;
    }

    await createMeetingMutation.mutateAsync({
      ...buildPayload(),
      title: form.title,
      description: form.description,
      organizerId,
    });

    handleCancel();
    onSuccess?.();
    onClose?.();
  };

  const handleCancel = () => {
    setForm({
      title: "",
      description: "",
      roomId: "",
      date: "",
      startTime: "",
      endTime: "",
    });
    setParticipantIds([]);
    setAvailability(null);
    setChecked(false);
    onClose?.();
  };

  const hasConflict =
    checked &&
    availability &&
    (!availability.roomAvailable ||
      availability.participantConflicts.length > 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-white">Meeting Title</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Weekly Sync"
          className="input input-bordered w-full bg-black/60 text-white"
          required
        />
      </div>

      {/* Description */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-white">Description</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          placeholder="Optional notes about this meeting"
          className="textarea textarea-bordered w-full bg-black/60 text-white resize-none"
        />
      </div>

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

      {durationLabel && (
        <p className="text-xs text-slate-400 -mt-1">
          Duration:{" "}
          <span className="text-white font-semibold">{durationLabel}</span>
        </p>
      )}

      {/* ── Participants ─────────────────────────────────────────────── */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-white flex items-center gap-1.5">
            <Users size={14} /> Participants
          </span>
        </label>
        <UserSearchSelect
          selectedIds={participantIds}
          onChange={handleParticipantsChange}
          fetchUsers={fetchUsers}
          placeholder="Search by name or email…"
        />
      </div>

      {/* Conflict feedback */}
      {hasConflict && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1.5">
          <p className="text-xs text-red-300 font-semibold flex items-center gap-1.5">
            <AlertTriangle size={13} /> Conflicts found
          </p>
          {!availability.roomAvailable && (
            <p className="text-[11px] text-red-300/80">
              Room is already booked during this time.
            </p>
          )}
          {availability.participantConflicts.length > 0 && (
            <ul className="text-[11px] text-red-300/80 list-disc list-inside">
              {availability.participantConflicts.map((c) => (
                <li key={c._id}>
                  {c.userId?.nama || "Participant"} is already in{" "}
                  {c.meetingId?.title || "another meeting"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {checked && availability && !hasConflict && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <p className="text-xs text-emerald-300 font-semibold">
            Room and all participants are available
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-6">
        <button
          type="button"
          onClick={handleCancel}
          className="btn bg-red-400 hover:bg-red-300 border-none text-white"
          disabled={createMeetingMutation.isPending}
        >
          Cancel
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={checkAvailabilityMutation.isPending}
            className="btn btn-outline btn-info"
          >
            {checkAvailabilityMutation.isPending
              ? "Checking…"
              : "Check Availability"}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMeetingMutation.isPending}
          >
            {createMeetingMutation.isPending ? "Booking…" : "Book Room"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingMeetingForm;
