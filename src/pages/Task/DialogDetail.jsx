import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  Link2,
  Calendar,
  Reply,
  MoreVertical,
  Download,
  X,
  ZoomIn,
} from "lucide-react";
import { useComment } from "../../hook/useComment";
import { useTask } from "../../hook/useTask";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { useAttachment } from "../../hook/useAttachment";

dayjs.extend(relativeTime);
dayjs.locale("id");

const DialogDetail = ({ onClose, show, taskId, taskData: propTaskData }) => {
  const { commentQuery, createCommentMutation, replyCommentMutation } =
    useComment(taskId);
  const { updateTaskMutation } = useTask();
  const {
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    attachmentsQuery,
  } = useAttachment(taskId);

  const serverAttachments = attachmentsQuery.data || [];
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);

  const comments = commentQuery.data || [];
  const commentsTaskData = comments.length > 0 ? comments[0].task : null;
  const taskData = propTaskData || commentsTaskData;

  const [status, setStatus] = useState("To Do");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [descriptions, setDescriptions] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [zoomImage, setZoomImage] = useState(null);
  const [linkTimer, setLinkTimer] = useState(null);

  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    if (taskData) {
      setStatus(taskData.status || "To Do");
      setMeetingDate(taskData.meeting_date || "");
      setMeetingLink(taskData.meeting_link || "");
      setDescriptions(taskData.description || "");
      setEditedDescription(taskData.description || "");
    }
  }, [taskData]);

  const handleMeetingDateChange = (newMeetingDate) => {
    const iso = newMeetingDate ? dayjs(newMeetingDate).toISOString() : "";
    setMeetingDate(iso);
    if (taskId) {
      updateTaskMutation.mutate({
        taskId,
        data: { meeting_date: iso },
      });
    }
  };

  const handleMeetingLinkChange = (newMeetingLink) => {
    setMeetingLink(newMeetingLink);

    if (linkTimer) clearTimeout(linkTimer);

    const newTimer = setTimeout(() => {
      if (taskId) {
        updateTaskMutation.mutate({
          taskId,
          data: { meeting_link: newMeetingLink },
        });
      }
    }, 1000);

    setLinkTimer(newTimer);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      if (replyTo) {
        replyCommentMutation.mutate({
          taskId,
          commentId: replyTo,
          data: { text: message },
        });
        setReplyTo(null);
      } else {
        createCommentMutation.mutate({
          taskId,
          data: { text: message },
        });
      }
      setMessage("");
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        await uploadAttachmentMutation.mutateAsync(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Gagal upload ${file.name}`);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (attachmentId) => {
    try {
      await deleteAttachmentMutation.mutateAsync(attachmentId);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Gagal menghapus file");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return "📎";
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    return "📎";
  };

  const statusOptions = [
    { value: "To Do", label: "To Do", color: "bg-gray-100 text-gray-700" },
    {
      value: "In Progress",
      label: "In Progress",
      color: "bg-blue-100 text-blue-700",
    },
    { value: "Done", label: "Done", color: "bg-green-100 text-green-700" },
    { value: "Blocked", label: "Blocked", color: "bg-red-100 text-red-700" },
    { value: "Hold", label: "Hold", color: "bg-amber-100 text-amber-700" },
  ];

  const getStatusColor = (statusValue) => {
    return statusOptions.find((s) => s.value === statusValue)?.color || "";
  };
  const handleEditDescription = () => {
    const trimmedValue = editedDescription.trim();
    if (!taskId) {
      updateTaskMutation.mutate({
        taskId,
        data: { description: trimmedValue },
      });
    }
    setDescriptions(trimmedValue);
    setEditingDescription(false);
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            key="dialog-content"
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Detail Task
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Main Content - Chat Area */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Comments Section */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {comments.map((comment) => (
                    <div key={comment._id} className="space-y-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
                          {comment.user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {comment.user.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                {dayjs(comment.createdAt).fromNow()}
                              </p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                          <button
                            onClick={() => setReplyTo(comment._id)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {(comment.replies || []).map((reply) => (
                        <div key={reply._id} className="flex gap-3 ml-12">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {reply.user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                            <div className="flex items-start justify-between mb-1">
                              <div>
                                <p className="font-semibold text-sm text-gray-800">
                                  {reply.user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {dayjs(reply.createdAt).fromNow()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">
                              {reply.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="border-t p-4 space-y-3">
                  {replyTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                      <Reply className="w-4 h-4" />
                      <span>Membalas komentar...</span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="ml-auto text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Tulis komentar..."
                      className="flex-1 text-black px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      disabled={uploadAttachmentMutation.isLoading}
                    >
                      <Paperclip className="w-4 h-4" />
                      {uploadAttachmentMutation.isLoading
                        ? "Uploading..."
                        : "Upload File"}
                    </button>

                    {serverAttachments.map((fileObj) => (
                      <div
                        key={fileObj._id}
                        className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded"
                      >
                        <Paperclip className="w-3 h-3" />
                        <div className="space-y-1">{fileObj.fileName}</div>
                      </div>
                    ))}
                  </div>

                  {/* Meeting Link */}
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => handleMeetingLinkChange(e.target.value)}
                      placeholder="Link meeting (opsional)"
                      className="flex-1 text-black px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Meeting Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={
                        meetingDate
                          ? dayjs(meetingDate).format("YYYY-MM-DD")
                          : ""
                      }
                      onChange={(e) => handleMeetingDateChange(e.target.value)}
                      className="flex-1 text-black px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar - Status */}
              <div className="w-80 border-l flex flex-col overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Task Description:
                    </p>
                    {editingDescription ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full text-sm text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-10"
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.ctrlKey) {
                              handleEditDescription();
                            }
                            if (e.key === "Escape") {
                              setEditingDescription(false);
                              setEditedDescription(descriptions);
                            }
                          }}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditDescription}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => {
                              setEditingDescription(false);
                              setEditedDescription(descriptions);
                            }}
                            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-sm text-gray-800 hover:bg-gray-100 px-2 py-1 rounded cursor-text  whitespace-pre-wrap"
                        onClick={() => {
                          setEditingDescription(true);
                          setEditedDescription(descriptions);
                        }}
                      >
                        {descriptions || "Click to add description..."}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">current status:</span>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                          status
                        )}`}
                      >
                        {statusOptions.find((s) => s.value === status)?.label ||
                          status}
                      </span>
                    </p>
                  </div>
                  {meetingDate && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Meeting Date:</span>
                        <br />
                        <span className="text-gray-800">
                          {dayjs(meetingDate).format("DD MMMM YYYY")}
                        </span>
                      </p>
                    </div>
                  )}
                  {meetingLink && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Meeting Link
                      </p>
                      <a
                        href={meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 break-all underline"
                      >
                        {meetingLink}
                      </a>
                    </div>
                  )}
                  {/* File Attachments Preview */}
                  {serverAttachments.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        File Terlampir ({serverAttachments.length})
                      </p>
                      <div className="space-y-2">
                        {serverAttachments.map((fileObj) => (
                          <div
                            key={fileObj._id}
                            className="border rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            {/* Image Preview */}
                            {fileObj.fileType?.startsWith("image/") && (
                              <div
                                className="relative w-full h-32 bg-gray-200 cursor-pointer group"
                                onClick={() =>
                                  setZoomImage(`${API_URL}${fileObj.fileUrl}`)
                                }
                              >
                                <img
                                  src={`${API_URL}${fileObj.fileUrl}`}
                                  alt={fileObj.fileName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            )}

                            {/* Non-image files */}
                            {!fileObj.fileType?.startsWith("image/") && (
                              <div className="flex items-center justify-center h-20 bg-linear-to-br from-gray-100 to-gray-200">
                                <span className="text-4xl">
                                  {getFileIcon(fileObj.fileType)}
                                </span>
                              </div>
                            )}

                            {/* File Info */}
                            <div className="p-3 space-y-2">
                              <p
                                className="text-xs font-medium text-gray-800 truncate"
                                title={fileObj.fileName}
                              >
                                {fileObj.fileName}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(fileObj.fileSize)}
                                </span>
                                <div className="flex gap-1">
                                  <a
                                    href={`${API_URL}/api/attachment/${taskId}/download/${fileObj._id}`}
                                    download
                                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                  <button
                                    onClick={() =>
                                      handleRemoveFile(fileObj._id)
                                    }
                                    className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                                    title="Hapus"
                                    disabled={
                                      deleteAttachmentMutation.isLoading
                                    }
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Zoom Modal */}
            <AnimatePresence>
              {zoomImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
                  onClick={() => setZoomImage(null)}
                >
                  <button
                    onClick={() => setZoomImage(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <motion.img
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    src={zoomImage}
                    alt="Zoomed preview"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogDetail;
