import React, { useState, useEffect, useContext } from "react";
import {
  X,
  FileText,
  Download,
  Trash2,
  Plus,
  File,
  Image,
  FileArchive,
  Clock,
  User,
} from "lucide-react";
import useMeetings from "../../../hook/BookingMeeting/useMeetings";
import { AuthContext } from "../../../context/AuthContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { SOCKET_URL } from "../../../api/axios";

dayjs.extend(relativeTime);

const MeetingResultsModal = ({ meeting, onClose }) => {
  const BASE_URL = SOCKET_URL;
  const { user } = useContext(AuthContext);
  const {
    meetingDetailQuery,
    addMeetingResultMutation,
    deleteMeetingResultMutation,
  } = useMeetings();

  const [showAddForm, setShowAddForm] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const { data, isLoading, refetch } = meetingDetailQuery(meeting._id);
  const meetingData = data?.data;
  const results = meetingData?.meetingResults || [];
  const participants = meetingData?.participants || [];

  const currentPhotoUrl = user.photo
    ? `${import.meta.env.VITE_API_URL}/uploads/users/${user.photo}`
    : "https://placehold.co/400";
  const resetForm = () => {
    setContent("");
    setFile(null);
    setPreviewUrl(null);
    setShowAddForm(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }
    if (!content.trim() && !file) {
      toast.error("Please enter notes or select a file");
      return;
    }
    const payload = { userId: user._id };
    if (content.trim()) payload.content = content;
    if (file) payload.file = file;

    addMeetingResultMutation.mutate(
      { id: meeting._id, payload },
      {
        onSuccess: () => {
          resetForm();
          refetch();
        },
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to add result");
        },
      },
    );
  };

  const handleDeleteResult = (resultId) => {
    if (!window.confirm("Are you sure you want to delete this result?")) return;
    deleteMeetingResultMutation.mutate(
      {
        meetingId: meeting._id,
        resultId,
        payload: { userId: user._id },
      },
      {
        onSuccess: () => {
          refetch();
          toast.success("Result deleted successfully");
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete result",
          );
        },
      },
    );
  };

  const handleDownload = async (fileName, originalName) => {
    try {
      const url = `${BASE_URL}/uploads/meeting-results/${fileName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = originalName || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const getFileIcon = (fileName, size = 16) => {
    if (!fileName) return <File size={size} />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return <Image size={size} />;
    if (["pdf"].includes(ext)) return <FileArchive size={size} />;
    if (["doc", "docx", "txt"].includes(ext)) return <FileText size={size} />;
    return <File size={size} />;
  };

  const getFileIconColor = (fileName) => {
    if (!fileName) return "text-slate-400";
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
      return "text-purple-400";
    if (["pdf"].includes(ext)) return "text-red-400";
    if (["doc", "docx"].includes(ext)) return "text-blue-400";
    if (["xls", "xlsx"].includes(ext)) return "text-emerald-400";
    if (["txt"].includes(ext)) return "text-slate-300";
    return "text-blue-400";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const canAddResult = () => {
    if (!user) return false;
    if (meeting.organizerId?._id === user._id) return true;
  };

  const isOwnerOrOrganizer = (result) =>
    user?._id === result.uploadedBy?._id ||
    user?._id === meeting.organizerId?._id;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="flex w-full h-[90vh] max-h-[90vh] gap-6 overflow-hidden">
      {/* ======================================================== */}
      {/* KOLOM KIRI: Konten Utama (Hasil Rapat & Form)           */}
      {/* ======================================================== */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Header */}
        <div className="flex justify-between items-start px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white">Meeting Results</h3>
            <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">
              {meeting.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:text-white ml-4 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Meeting Info Bar */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/10 shrink-0">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-400" />
              <span>
                {dayjs(meeting.startTime).format("DD MMM YYYY, HH:mm")} –{" "}
                {dayjs(meeting.endTime).format("HH:mm")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={12} className="text-emerald-400" />
              <span>{meeting.organizerId?.username || "-"}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span
                className={`badge badge-sm ${
                  results.length > 0 ? "badge-primary" : "badge-ghost"
                }`}
              >
                {results.length} result{results.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content (Kolom Kiri) */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Add Result Form */}
          {showAddForm && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-white text-sm">
                  New Result Entry
                </h4>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-xs btn-ghost text-slate-400"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-3">
                {/* Notes Input */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Notes{" "}
                    <span className="text-slate-600 font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered bg-slate-800/80 border-white/10 text-white text-sm w-full focus:border-primary/50 resize-none"
                    placeholder="Write meeting notes, decisions, or action items..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* File Upload Input */}
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Attachment{" "}
                    <span className="text-slate-600 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-sm file-input-bordered bg-slate-800/80 border-white/10 text-white w-full"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                  />

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-28 w-full object-contain bg-black/20"
                      />
                    </div>
                  )}

                  {/* File Info Box */}
                  {file && !previewUrl && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-white/5 rounded-lg px-3 py-2">
                      <span className={getFileIconColor(file.name)}>
                        {getFileIcon(file.name, 14)}
                      </span>
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-slate-600">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-2 pt-1 justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost btn-sm text-slate-400"
                  >
                    Cancel
                  </button>{" "}
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={addMeetingResultMutation.isPending}
                  >
                    {addMeetingResultMutation.isPending && (
                      <span className="loading loading-spinner loading-xs" />
                    )}
                    Submit
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Button */}
          {canAddResult() && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-outline btn-sm border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20 w-full"
            >
              <Plus size={15} />
              Add Result
            </button>
          )}

          {/* Results List */}
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No results yet</p>
              {canAddResult() && (
                <p className="text-xs mt-1 text-slate-600">
                  Add notes or files from this meeting
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={result._id}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-150"
                >
                  <div className="flex items-start gap-3">
                    {/* Index Badge */}
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400 font-medium mt-0.5">
                      {index + 1}
                    </div>

                    {/* Result Content */}
                    <div className="flex-1 min-w-0">
                      {result.content &&
                        result.content !== result.originalName && (
                          <p className="text-sm text-slate-200 leading-relaxed wrap-break-word mb-2">
                            {result.content}
                          </p>
                        )}

                      {/* File Attachment */}
                      {result.fileName && (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-fit max-w-full">
                          <span
                            className={`shrink-0 ${getFileIconColor(
                              result.fileName,
                            )}`}
                          >
                            {getFileIcon(result.fileName, 14)}
                          </span>
                          <span className="text-xs text-slate-300 truncate">
                            {result.originalName || result.fileName}
                          </span>
                        </div>
                      )}

                      {/* Meta Information */}
                      <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500">
                        <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <User size={9} />
                        </div>
                        <span>{result.uploadedBy?.username || "Unknown"}</span>
                        <span>·</span>
                        <span>
                          {dayjs(result.uploadedAt).locale("en").fromNow()}
                        </span>
                      </div>
                    </div>

                    {/* Actions (Download / Delete) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {result.fileName && (
                        <button
                          onClick={() =>
                            handleDownload(result.fileName, result.originalName)
                          }
                          className="btn btn-xs btn-square btn-ghost text-blue-400 hover:bg-blue-500/10"
                          title="Download file"
                        >
                          <Download size={13} />
                        </button>
                      )}
                      {isOwnerOrOrganizer(result) && (
                        <button
                          onClick={() => handleDeleteResult(result._id)}
                          className="btn btn-xs btn-square btn-ghost text-error hover:bg-error/10"
                          title="Delete result"
                          disabled={deleteMeetingResultMutation.isPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-64 flex flex-col h-full bg-white/5 border border-white/10 rounded-xl overflow-hidden shrink-0">
        {/* Header Kolom Kanan */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <p className="text-sm font-semibold text-white">
            Participants ({participants.length})
          </p>
        </div>

        {/* Area Scroll Partisipan */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {participants.map((participant) => {
            const invitationStatus = participant.invitationStatus || "pending";

            const getStatusStyle = (status) => {
              switch (status) {
                case "accepted":
                  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/15";
                case "pending":
                  return "bg-amber-500/10 text-amber-400 border-amber-500/15";
                case "decline":
                  return "bg-rose-500/10 text-rose-400 border-rose-500/15";
                case "tentative":
                  return "bg-blue-500/10 text-blue-400 border-blue-500/15";
                default:
                  return "bg-slate-500/10 text-slate-400 border-slate-500/15";
              }
            };

            const getStatusLabel = (status) => {
              switch (status) {
                case "accepted":
                  return "Accepted";
                case "pending":
                  return "Pending";
                case "decline":
                  return "Declined";
                case "tentative":
                  return "Tentative";
                default:
                  return status;
              }
            };

            return (
              <div
                key={participant._id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                title={participant.username}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                    {participant.photo ? (
                      <img
                        src={currentPhotoUrl}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={13} className="text-blue-400" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-slate-300 font-medium truncate">
                      {participant.username}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.responseAt && (
                    <span className="text-[10px] text-slate-500">
                      {dayjs(participant.responseAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  )}
                  <span
                    className={`
            text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full 
            font-semibold shrink-0 border
            ${getStatusStyle(invitationStatus)}
          `}
                  >
                    {getStatusLabel(invitationStatus)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeetingResultsModal;
