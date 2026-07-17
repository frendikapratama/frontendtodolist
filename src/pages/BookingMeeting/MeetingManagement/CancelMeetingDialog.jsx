import React, { useState, useContext } from "react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import { AuthContext } from "../../../context/AuthContext";
import { AlertCircle } from "lucide-react";

const CancelMeetingDialog = ({ meeting, onClose }) => {
  const { user } = useContext(AuthContext);
  const { cancelMeetingMutation } = useMeetings();
  const [reason, setReason] = useState("");

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    await cancelMeetingMutation.mutateAsync({
      id: meeting._id,
      payload: {
        cancelledReason: reason,
        cancelledBy: user?._id || user?.id,
      },
    });
    onClose();
  };

  return (
    <form onSubmit={handleCancel} className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-red-400">Cancel Meeting?</h4>
          <p className="text-xs text-red-300/80 mt-1">
            Are you sure you want to cancel the meeting{" "}
            <strong>{meeting.title}</strong>? This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text mb-2 text-white">
            Reason for Cancellation
          </span>
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Please provide a reason..."
          className="textarea textarea-bordered w-full bg-black/60 text-white resize-none"
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost text-slate-300"
          disabled={cancelMeetingMutation.isPending}
        >
          Keep Meeting
        </button>
        <button
          type="submit"
          className="btn bg-red-500 hover:bg-red-400 border-none text-white"
          disabled={cancelMeetingMutation.isPending}
        >
          {cancelMeetingMutation.isPending
            ? "Cancelling…"
            : "Yes, Cancel Meeting"}
        </button>
      </div>
    </form>
  );
};

export default CancelMeetingDialog;
