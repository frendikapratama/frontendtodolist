import React, { useState, useEffect, useCallback } from "react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import { getUsers } from "../../../services/userServices";
import UserSearchSelect from "../../../components/Usersearchselect";
import {
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  X,
  Asterisk,
} from "lucide-react";
import toast from "react-hot-toast";
import ExternalParticipantsInput from "../../../components/ExternalParticipantsInput";

const UpdateMeetingForm = ({ meeting, onClose }) => {
  const {
    updateMeetingMutation,
    meetingParticipantsQuery,
    checkAvailabilityMutation,
  } = useMeetings();
  const [initialUsers, setInitialUsers] = useState([]);
  const { data: participantsData, isLoading: participantsLoading } =
    meetingParticipantsQuery(meeting._id);
  const [externalParticipants, setExternalParticipants] = useState([]);
  const [form, setForm] = useState({
    title: meeting.title || "",
    description: meeting.description || "",
    meetingLink: meeting.meetingLink || "",
    meetingType: meeting.meetingType || "internal_department",
    external_factory: meeting.external_factory || "",
    snackRequest: Array.isArray(meeting.snackRequest)
      ? meeting.snackRequest
      : [],
    meetingLink: meeting.meetingLink || "",
  });

  const [participantIds, setParticipantIds] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const [conflicts, setConflicts] = useState([]);
  const [checked, setChecked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (participantsData?.data) {
      const internal = participantsData.data.filter((p) => !p.isExternal);
      const external = participantsData.data.filter((p) => p.isExternal);

      const ids = internal
        .map((p) => p.userId?._id || p.userId)
        .filter(Boolean);
      setParticipantIds(ids);
      const users = internal
        .filter((p) => p.userId)
        .map((p) => ({
          _id: p.userId?._id || p.userId,
          username: p.userId?.username || p.userId?.email || "Unknown",
          email: p.userId?.email || "",
          photo: p.userId?.photo
            ? `${import.meta.env.VITE_API_URL}/uploads/users/${p.userId.photo}`
            : undefined,
        }));
      setInitialUsers(users);
      setSelectedParticipants(users);

      setExternalParticipants(
        external.map((p) => ({
          name: p.externalName || p.externalEmail,
          email: p.externalEmail,
          noHp: p.externalNoHp || "",
        })),
      );
    }
  }, [participantsData]);

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
  };

  const handleParticipantsChange = (ids, users) => {
    setParticipantIds(ids);
    if (users) setSelectedParticipants(users);
    // Reset check saat participant berubahh
    setChecked(false);
    setConflicts([]);
  };

  const handleMeetingTypeChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      meetingType: value,
      // Hapus nilai jika bukan External Factory
      external_factory:
        value === "external_factory" ? prev.external_factory : "",
      // Reset snack request jika bukan External Factory
      snackRequest: value === "external_factory" ? prev.snackRequest : [],
    }));
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

  const doUpdate = async () => {
    await updateMeetingMutation.mutateAsync({
      id: meeting._id,
      payload: {
        title: form.title,
        description: form.description,
        organizerId: meeting.organizerId?._id || meeting.organizerId,
        participantIds,
        externalParticipants,
        meetingType: form.meetingType,
        external_factory: form.external_factory,
        snackRequest: form.snackRequest || null,
        meetingLink: form.meetingLink || null,
      },
    });

    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      const result = await checkAvailabilityMutation.mutateAsync({
        roomId: meeting.roomId?._id || meeting.roomId,
        participantIds,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        excludeMeetingId: meeting._id,
      });

      setChecked(true);

      // Filter konflik — exclude participant yang memang sudah ada di meeting ini
      // (mereka wajar punya conflict karena meeting ini sendiri)
      const existingIds =
        participantsData?.data
          ?.filter((p) => !p.isExternal && p.userId)
          ?.map((p) => p.userId?._id || p.userId) || [];

      const newParticipantIds = participantIds.filter(
        (id) => !existingIds.includes(id),
      );

      const relevantConflicts = (result.participantConflicts || []).filter(
        (c) => {
          const uid = typeof c.userId === "string" ? c.userId : c.userId?._id;
          return newParticipantIds.includes(uid);
        },
      );

      // Room conflict diabaikan secara sengaja pada update ini
      setConflicts(relevantConflicts);

      if (relevantConflicts.length > 0) {
        // Ada konflik participant → tampilkan modal konfirmasi
        setShowConfirmModal(true);
        return;
      }

      // Tidak ada konflik → langsung update
      await doUpdate();
    } catch (error) {
      toast.error("Failed to check availability");
    }
  };

  // Modal konfirmasi conflict
  const renderConflictModal = () => {
    if (!showConfirmModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
              {conflicts.length} participant{conflicts.length !== 1 ? "s" : ""}{" "}
              already have a meeting at this time. You can still proceed.
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
                  await doUpdate();
                }}
                className="btn btn-warning btn-sm"
                disabled={updateMeetingMutation.isPending}
              >
                {updateMeetingMutation.isPending ? (
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
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Meeting Type
              <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
            </span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input input-bordered w-full bg-black/60 text-white"
            required
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white">Description</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="textarea textarea-bordered w-full bg-black/60 text-white resize-none"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white">Meeting Link</span>
          </label>
          <input
            type="text"
            name="meetingLink"
            value={form.meetingLink}
            onChange={handleChange}
            className="input input-bordered w-full bg-black/60 text-white"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 flex items-center gap-1 text-white">
              Meeting Type
              <Asterisk className="h-3 w-3 text-red-500" strokeWidth={3} />
            </span>
          </label>
          <select
            name="meetingType"
            value={form.meetingType}
            onChange={handleMeetingTypeChange}
            className="select select-bordered w-full bg-black/60 text-white"
          >
            <option value="internal_department"> Internal Departement</option>
            <option value="internal_factory"> Internal Factory</option>
            <option value="external_factory"> External Factory</option>
          </select>
        </div>
        {form.meetingType === "external_factory" && (
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2 text-white">
                {" "}
                Name Of External Factory
              </span>
            </label>
            <input
              type="text"
              name="external_factory"
              value={form.external_factory}
              onChange={handleChange}
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
                  Light Snacks
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
                  Full Meal
                </span>
              </label>
            </div>
          </div>
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
          {participantsLoading ? (
            <span className="loading loading-spinner loading-xs text-white" />
          ) : (
            <UserSearchSelect
              selectedIds={participantIds}
              onChange={handleParticipantsChange}
              fetchUsers={fetchUsers}
              placeholder="Search by name or email…"
              initialUsers={initialUsers}
            />
          )}
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text mb-2 text-white">
              Manual Input Participants
            </span>
          </label>
          <ExternalParticipantsInput
            value={externalParticipants}
            onChange={(list) => {
              setExternalParticipants(list);
              setChecked(false);
              setConflicts([]);
            }}
            placeholder="e.g username@gmail.com"
          />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost text-slate-300"
            disabled={updateMeetingMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              updateMeetingMutation.isPending ||
              checkAvailabilityMutation.isPending
            }
          >
            {updateMeetingMutation.isPending ||
            checkAvailabilityMutation.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm" />{" "}
                Processing…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>

      {renderConflictModal()}
    </>
  );
};

export default UpdateMeetingForm;
