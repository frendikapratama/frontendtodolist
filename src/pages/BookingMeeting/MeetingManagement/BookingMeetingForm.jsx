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
import {
  X,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calendar,
  User,
  Mail,
  Asterisk,
} from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { getUsers } from "../../../services/userServices";
import UserSearchSelect from "../../../components/Usersearchselect";
import TimeWheelPicker from "../../../components/ui/TimeWheelPicker";
import { createPortal } from "react-dom";

const pad = (n) => String(n).padStart(2, "0");

const todayStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const dateTimeInputClass =
  "input input-bordered w-full bg-black/60 text-white accent-blue-500 [color-scheme:dark]";

const BookingMeetingForm = ({ defaultRoomId = "", onSuccess, onClose }) => {
  const { user } = useContext(AuthContext);
  const getOrganizerId = () => user?._id || user?.id || "";

  const { roomsQuery } = useRooms();
  const { checkAvailabilityMutation, createMeetingMutation } = useMeetings();

  const rooms = roomsQuery.data || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    meetingLink: "",
    external_factory: "",
    roomId: defaultRoomId,
    date: "",
    startTime: "",
    endTime: "",
    meetingType: "internal_department",
    snackRequest: [],
  });

  const [participantIds, setParticipantIds] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [checked, setChecked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const formWrapperRef = useRef(null);
  const scrollPosRef = useRef(0);

  useEffect(() => {
    const modalBox = formWrapperRef.current?.closest(".modal-box");

    if (showPreview) {
      if (modalBox) {
        scrollPosRef.current = modalBox.scrollTop;
        modalBox.style.overflow = "hidden";
      }
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (modalBox) {
        modalBox.style.overflow = "";
        // restore posisi setelah reflow
        requestAnimationFrame(() => {
          modalBox.scrollTop = scrollPosRef.current;
        });
      }
    }

    return () => {
      document.body.style.overflow = "";
      if (modalBox) modalBox.style.overflow = "";
    };
  }, [showPreview]);

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
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleParticipantsChange = (ids, users) => {
    setParticipantIds(ids);
    if (users) setSelectedParticipants(users);
    setChecked(false);
    setAvailability(null);
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleMeetingTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      meetingType: value,
      external_factory:
        value === "external_factory" ? prev.external_factory : "",
      snackRequest: value === "external_factory" ? prev.snackRequest : [],
    }));

    setChecked(false);
    setAvailability(null);
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleSnackRequestToggle = (option) => {
    setForm((prev) => {
      const exists = prev.snackRequest.includes(option);
      return {
        ...prev,
        snackRequest: exists
          ? prev.snackRequest.filter((s) => s !== option)
          : [...prev.snackRequest, option],
      };
    });
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

  const getDurationLabel = () => {
    if (!form.startTime || !form.endTime) return null;
    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h === 0) return `${m} minutes`;
    if (m === 0) return `${h} hour${h > 1 ? "s" : ""}`;
    return `${h} hour${h > 1 ? "s" : ""} ${m} minutes`;
  };

  const durationLabel = getDurationLabel();

  const buildPayload = () => ({
    roomId: form.roomId,
    participantIds,
    startTime: getStartTime(),
    endTime: getEndTime(),
    meetingType: form.meetingType,
    snackRequest:
      form.meetingType === "internal_department" ? [] : form.snackRequest,
  });

  const validateBasics = () => {
    if (!form.title.trim()) return "Meeting title is required";
    if (!form.roomId) return "Please select a room";
    if (!form.date) return "Please select a date";
    if (!form.startTime) return "Please select a start time";
    if (!form.endTime) return "Please select an end time";
    if (form.endTime <= form.startTime)
      return "End time must be after start time";

    if (
      form.meetingType !== "external_factory" &&
      participantIds.length === 0
    ) {
      return "Please add at least one participant";
    }

    return null;
  };

  // Book the meeting
  const bookMeeting = async () => {
    const organizerId = getOrganizerId();
    if (!organizerId) {
      toast.error("Unable to identify organizer — please log in again");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMeetingMutation.mutateAsync({
        ...buildPayload(),
        title: form.title,
        description: form.description,
        meetingLink: form.meetingLink,
        external_factory: form.external_factory,
        organizerId,
      });

      handleCancel();
      onSuccess?.();
      onClose?.();
    } catch (error) {
      // toast sudah ditangani di useMeetings (createMeetingMutation.onError)
      console.error("Booking failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validateBasics();
    if (err) {
      toast.error(err);
      return;
    }

    setShowForm(false);

    const result = await checkAvailabilityMutation.mutateAsync(buildPayload());
    setAvailability(result);
    setChecked(true);

    const selectedRoom = rooms.find((r) => r._id === form.roomId);

    setPreviewData({
      ...buildPayload(),
      title: form.title,
      description: form.description,
      meetingLink: form.meetingLink,
      external_factory: form.external_factory,
      conflicts: result.participantConflicts || [],
      roomAvailable: result.roomAvailable,
      roomMessage: result.roomMessage,
      room: selectedRoom,
      duration: durationLabel,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      participants: selectedParticipants,
    });
    setShowPreview(true);
  };

  const handlePreviewSubmit = async () => {
    await bookMeeting();
    setShowPreview(false);
    setShowForm(true);
    setPreviewData(null);
  };

  const handleCancel = () => {
    setForm({
      title: "",
      description: "",
      meetingLink: "",
      external_factory: "",
      roomId: "",
      date: "",
      startTime: "",
      endTime: "",
      meetingType: "internal_department",
      snackRequest: [],
    });
    setParticipantIds([]);
    setSelectedParticipants([]);
    setAvailability(null);
    setChecked(false);
    setShowPreview(false);
    setPreviewData(null);
    setIsSubmitting(false);
    setShowForm(true);
    onClose?.();
  };

  // Modal Preview
  const renderPreviewModal = () => {
    if (!showPreview || !previewData) return null;
    const dialogEl = document.getElementById("bookingModal");
    const portalTarget = dialogEl || document.body;
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="bg-gray-900 rounded-2xl max-w-2xl w-full h-[90vh] max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-white">
                Booking Preview
              </h3>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="btn btn-ghost btn-sm text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Meeting Details */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-400">
                Meeting Details
              </h4>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-[100px]">
                    Title
                  </span>
                  <span className="text-white font-medium">
                    {previewData.title}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-[100px]">
                    Meeting Type
                  </span>
                  <span className="text-white capitalize">
                    {previewData.meetingType}
                  </span>
                </div>

                {previewData.meetingType === "external" &&
                  previewData.snackRequest?.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 text-sm min-w-[100px]">
                        Snack Request
                      </span>
                      <span className="text-white capitalize">
                        {previewData.snackRequest.join(", ")}
                      </span>
                    </div>
                  )}

                {previewData.description && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm min-w-[100px]">
                      Description
                    </span>
                    <span className="text-gray-300 text-sm">
                      {previewData.description}
                    </span>
                  </div>
                )}

                {previewData.meetingLink && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm min-w-[100px]">
                      Meeting Link
                    </span>

                    <span className="text-blue-400 underline">
                      <a
                        href={previewData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {previewData.meetingLink}
                      </a>
                    </span>
                  </div>
                )}

                {previewData.external_factory && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 text-sm min-w-[100px]">
                      external_factory
                    </span>

                    <span className="text-blue-400 underline">
                      <a
                        href={previewData.external_factory}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {previewData.external_factory}
                      </a>
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-[100px]">
                    Room
                  </span>
                  <span className="text-white">
                    {previewData.room?.nama || "N/A"} —{" "}
                    {previewData.room?.lokasi || "N/A"}
                    {previewData.room?.kapasitas &&
                      ` (Capacity: ${previewData.room.kapasitas})`}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-[100px]">
                    Date & Time
                  </span>
                  <span className="text-white">
                    {previewData.date} {previewData.startTime} -{" "}
                    {previewData.endTime}
                    {previewData.duration && ` (${previewData.duration})`}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 text-sm min-w-[100px]">
                    Participants
                  </span>
                  <span className="text-white">
                    {participantIds.length} person
                    {participantIds.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Room Conflict Warning */}
            {previewData.roomAvailable === false && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-red-400 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-red-400 mb-1">
                      Room Conflict
                    </h5>
                    <p className="text-xs text-red-300/80">
                      {previewData.roomMessage ||
                        "This room is already booked at that time. Please choose a different time or room."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Participants List */}
            {previewData.participants &&
              previewData.participants.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <Users size={14} className="text-blue-400" />
                    Participant List
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {previewData.participants.map((p, index) => {
                      const hasConflict = previewData.conflicts?.some(
                        (c) => c.userId?._id === p._id || c.userId === p._id,
                      );
                      return (
                        <div
                          key={p._id || index}
                          className={`flex items-center gap-3 rounded-lg p-2.5 ${
                            hasConflict
                              ? "bg-yellow-500/10 border border-yellow-500/20"
                              : "bg-gray-700/40"
                          }`}
                        >
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={p.username}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-600/40 flex items-center justify-center shrink-0">
                              <User size={13} className="text-blue-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {p.username || "Unknown"}
                            </p>
                            {p.email && (
                              <p className="text-xs text-gray-400 truncate">
                                {p.email}
                              </p>
                            )}
                          </div>
                          {hasConflict && (
                            <span className="text-xs text-yellow-400 flex items-center gap-1 shrink-0">
                              <AlertTriangle size={11} /> Conflict
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Participant Conflict Warning */}
            {previewData.conflicts && previewData.conflicts.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-yellow-400 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-yellow-400 mb-2">
                      {previewData.conflicts.length} Participant
                      {previewData.conflicts.length !== 1 ? "s" : ""} Have
                      Scheduling Conflicts
                    </h5>
                    <p className="text-xs text-yellow-300/80 mb-3">
                      The following participants already have another meeting at
                      the same time. You can still proceed with the booking.
                    </p>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {previewData.conflicts.map((conflict, index) => {
                        // userId may be a plain string ID or a populated object
                        const conflictUserId =
                          typeof conflict.userId === "string"
                            ? conflict.userId
                            : conflict.userId?._id;

                        // Cross-reference with selectedParticipants for reliable name/photo
                        const localUser = previewData.participants?.find(
                          (p) => p._id === conflictUserId,
                        );

                        const displayName =
                          localUser?.username ||
                          conflict.userId?.username ||
                          "Unknown";

                        const displayEmail =
                          localUser?.email ||
                          conflict.userId?.email ||
                          "No email";

                        return (
                          <div
                            key={conflict._id || index}
                            className="bg-gray-800/50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-2">
                              {localUser?.photo ? (
                                <img
                                  src={localUser.photo}
                                  alt={displayName}
                                  className="w-5 h-5 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <User
                                  size={14}
                                  className="text-gray-400 shrink-0"
                                />
                              )}
                              <span className="text-sm font-medium text-white">
                                {displayName}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({displayEmail})
                              </span>
                            </div>
                            <div className="mt-1 ml-6 text-xs text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-yellow-400" />
                                <span>Meeting: </span>
                                <span className="text-yellow-300">
                                  {conflict.meetingId?.title ||
                                    "Unknown meeting"}
                                </span>
                              </div>
                              {conflict.meetingId?.startTime &&
                                conflict.meetingId?.endTime && (
                                  <div className="ml-4 text-[10px] text-gray-500">
                                    {new Date(
                                      conflict.meetingId.startTime,
                                    ).toLocaleString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
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
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All clear */}
            {previewData.roomAvailable !== false &&
              previewData.conflicts &&
              previewData.conflicts.length === 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <p className="text-sm text-emerald-300 font-medium">
                    Room and all participants are available
                  </p>
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="btn bg-gray-700 hover:bg-gray-600 border-none text-white"
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePreviewSubmit}
                className="btn btn-primary"
                disabled={isSubmitting || previewData.roomAvailable === false}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>,
      portalTarget,
    );
  };

  return (
    <div className="" ref={formWrapperRef}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        inert={showPreview ? "" : undefined}
      >
        {/* Title */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Meeting Title
              <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
            </span>
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
            placeholder="Additional notes about this meeting"
            className="textarea textarea-bordered w-full bg-black/60 text-white resize-none"
          />
        </div>

        {/* Meeting Type */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Meeting Type
              <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
            </span>
          </label>
          {/* Menambahkan h-12 atau py-2 serta appearance-none untuk menormalisasi select di Edge */}
          <select
            name="meetingType"
            value={form.meetingType}
            onChange={handleMeetingTypeChange}
            className="select select-bordered w-full h-12 bg-black/60 text-white focus:outline-none"
          >
            <option
              value="internal_department"
              className="bg-gray-950 text-white"
            >
              Internal Departement
            </option>
            <option value="internal_factory" className="bg-gray-950 text-white">
              Internal Factory
            </option>
            <option value="external_factory" className="bg-gray-950 text-white">
              External Factory
            </option>
          </select>
        </div>

        {form.meetingType === "external_factory" && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 flex items-center gap-1 text-white">
                External Company / Organization
                <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
              </span>
            </label>
            <input
              type="text"
              name="external_factory"
              value={form.external_factory}
              onChange={handleChange}
              placeholder="e.g. PT ABC Indonesia (Customer, Supplier, Vendor, Contractor, etc.)"
              className="input input-bordered w-full bg-black/60 text-white"
              required
            />
          </div>
        )}
        {/* Snack Request — hanya muncul jika external */}
        {form.meetingType === "external_factory" && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 text-white font-medium">
                Snack Request
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-6 p-2 rounded-lg bg-black/30 border border-gray-800">
              <label className="flex items-center gap-2.5 text-white text-sm cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary bg-black/40"
                  checked={form.snackRequest.includes("makanan-ringan")}
                  onChange={() => handleSnackRequestToggle("makanan-ringan")}
                />
                <span className="group-hover:text-blue-400 transition-colors">
                  Makanan Ringan
                </span>
              </label>
              <label className="flex items-center gap-2.5 text-white text-sm cursor-pointer select-none group">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary bg-black/40"
                  checked={form.snackRequest.includes("makanan-berat")}
                  onChange={() => handleSnackRequestToggle("makanan-berat")}
                />
                <span className="group-hover:text-blue-400 transition-colors">
                  Makanan Berat
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white">Meeting Link</span>
          </label>
          <input
            type="text"
            name="meetingLink"
            value={form.meetingLink}
            onChange={handleChange}
            placeholder="e.g. https://zoom.us/j/123456789"
            className="input input-bordered w-full bg-black/60 text-white"
          />
        </div>

        {/* Room */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Room
              <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
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
                {room.nama} — {room.lokasi} (Capacity: {room.kapasitas})
              </option>
            ))}
          </select>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 flex items-center gap-1 text-white">
                Date
                <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
              </span>
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
              <span className="label-text mb-2 flex items-center gap-1 text-white">
                Start Time
                <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
              </span>
            </label>
            <TimeWheelPicker
              value={form.startTime}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, startTime: val }));
                setChecked(false);
                setAvailability(null);
                setShowPreview(false);
                setPreviewData(null);
              }}
            />
          </div>
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 flex items-center gap-1 text-white">
                End Time
                <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
              </span>
            </label>
            <TimeWheelPicker
              value={form.endTime}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, endTime: val }));
                setChecked(false);
                setAvailability(null);
                setShowPreview(false);
                setPreviewData(null);
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

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Participants
              {form.meetingType !== "external_factory" && (
                <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
              )}
            </span>
          </label>
          <UserSearchSelect
            selectedIds={participantIds}
            onChange={handleParticipantsChange}
            fetchUsers={fetchUsers}
            placeholder="Search by name or email…"
          />
        </div>

        {/* Actions */}
        {!showPreview && (
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="btn bg-red-400 hover:bg-red-300 border-none text-white"
              disabled={isSubmitting || createMeetingMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isSubmitting ||
                checkAvailabilityMutation.isPending ||
                createMeetingMutation.isPending
              }
            >
              {isSubmitting ||
              checkAvailabilityMutation.isPending ||
              createMeetingMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                "Process"
              )}
            </button>
          </div>
        )}
      </form>

      {/* Preview Modal */}
      {renderPreviewModal()}
    </div>
  );
};

export default BookingMeetingForm;
