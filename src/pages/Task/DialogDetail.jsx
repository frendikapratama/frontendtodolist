import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "../../api/axios";
import api from "../../api/axios";
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
import { useSubTask } from "../../hook/useSubTask";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import { useAttachment } from "../../hook/useAttachment";
import { useNotifications } from "../../context/NotificationContext";
import toast from "react-hot-toast" 
import { useContext, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useMember } from "../../hook/useMember";
import { FaRegFilePdf,FaRegFileWord ,FaFile } from "react-icons/fa6";
import { FaRegFileExcel } from "react-icons/fa";
import { CiImageOn } from "react-icons/ci";

dayjs.extend(relativeTime);
dayjs.locale("id");

const DialogDetail = ({
  onClose,
  show,
  taskId,
  taskData: propTaskData,
  isSubtask = false,
  subtaskId = null,
}) => {
  const itemId = isSubtask ? subtaskId : taskId;

  const {
    commentQuery,
    createCommentMutation,
    replyCommentMutation,
    deleteCommentMutation,
    editCommentMutation,
  } = useComment(itemId, isSubtask);
  const { updateTaskMutation } = useTask();
  const { updateSubTaskMutation } = useSubTask();
  const updateMutation = isSubtask ? updateSubTaskMutation : updateTaskMutation;

  const {
    uploadAttachmentMutation,
    deleteAttachmentMutation,
    attachmentsQuery,
  } = useAttachment(itemId, isSubtask);

const serverAttachments = attachmentsQuery.data || taskData?.attachments || [];
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
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editedReplyText, setEditedReplyText] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    commentId: null,
  });
  const { socket } = useNotifications();

  const { user: currentUser } = useContext(AuthContext);

  const workspaceId = taskData?.workspaceId || taskData?.workspace?._id;

  const { membersWorkspaceQuery } = useMember("workspace", workspaceId);

  const isAuthorized = useMemo(() => {
  if (!currentUser || !membersWorkspaceQuery.data) return false;
  
  const userMembership = membersWorkspaceQuery.data.members?.find(
    (member) =>
      member.user?._id === currentUser._id ||
      member.user?._id === currentUser.id
  );
  
  if (!userMembership) return true;
  
  const memberOnlyRoles = ["member"];
  return !memberOnlyRoles.includes(userMembership.role);
}, [currentUser, membersWorkspaceQuery.data]);

  const isFileOwner = (fileObj) => {
    const userId = currentUser?._id || currentUser?.id;
    const uploaderId = fileObj.uploadedBy?._id || fileObj.uploadedBy; 
    console.log("uploaderId:", uploaderId, "| userId:", userId);
    return uploaderId === userId;
  };

  useEffect(() => {
    if (!socket || !itemId) return;

    const roomEvent = isSubtask ? "subtask:join" : "task:join";
    const leaveEvent = isSubtask ? "subtask:leave" : "task:leave";
    const commentCreatedEvent = isSubtask
      ? "subtask-comment:created"
      : "comment:created";
    const replyCreatedEvent = isSubtask
      ? "subtask-reply:created"
      : "reply:created";
    const commentEditedEvent = isSubtask
      ? "subtask-comment:edited"
      : "comment:edited";

    socket.emit(roomEvent, itemId);
    console.log(`Joined ${isSubtask ? "subtask" : "task"} room: ${itemId}`);

    const handleNewComment = (data) => {
      const dataKey = isSubtask ? data.subtaskId : data.taskId;
      if (dataKey === itemId) {
        console.log("Real-time comment received:", data);
        commentQuery.refetch(); 
      }
    };

    const handleNewReply = (data) => {
      const dataKey = isSubtask ? data.subtaskId : data.taskId;
      if (dataKey === itemId) {
        console.log("Real-time reply received:", data);
        commentQuery.refetch(); 
      }
    };

    const handleEditedComment = (data) => {
      const dataKey = isSubtask ? data.subtaskId : data.taskId;
      if (dataKey === itemId) {
        console.log("Real-time comment edited:", data);
        commentQuery.refetch();
      }
    };

    socket.on(commentCreatedEvent, handleNewComment);
    socket.on(replyCreatedEvent, handleNewReply);
    socket.on(commentEditedEvent, handleEditedComment);

    return () => {
      socket.emit(leaveEvent, itemId);
      socket.off(commentCreatedEvent, handleNewComment);
      socket.off(replyCreatedEvent, handleNewReply);
      socket.off(commentEditedEvent, handleEditedComment);
      console.log(`Left ${isSubtask ? "subtask" : "task"} room: ${itemId}`);
    };
  }, [socket, itemId, commentQuery, isSubtask]);

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
    if (itemId) {
      updateMutation.mutate({
        [isSubtask ? "subtaskId" : "taskId"]: itemId,
        data: { meeting_date: iso },
      });
    }
  };

  const handleMeetingLinkChange = (newMeetingLink) => {
    setMeetingLink(newMeetingLink);

    if (linkTimer) clearTimeout(linkTimer);

    const newTimer = setTimeout(() => {
      if (itemId) {
        updateMutation.mutate({
          [isSubtask ? "subtaskId" : "taskId"]: itemId,
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
          taskId: isSubtask ? undefined : itemId,
          subtaskId: isSubtask ? itemId : undefined,
          commentId: replyTo,
          data: { text: message },
        });
        setReplyTo(null);
      } else {
        createCommentMutation.mutate({
          taskId: isSubtask ? undefined : itemId,
          subtaskId: isSubtask ? itemId : undefined,
          data: { text: message },
        });
      }
      setMessage("");
      if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);

    for (const file of files) {
      try {
        await uploadAttachmentMutation.mutateAsync(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error('Failed to upload file')
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = async (attachmentId) => {
    try {
      await deleteAttachmentMutation.mutateAsync(attachmentId);
    } catch (error) {
      toast.error('Only uploader can delete')
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-500" />;
    if (fileType.startsWith("image/")) return <CiImageOn className="text-lime-300" />;
    if (fileType.includes("pdf")) return <FaRegFilePdf className="text-red-500" />;
    if (fileType.includes("sheet") || fileType.includes("excel")) return <FaRegFileExcel className="text-green-500" />;
    if (fileType.includes("word") || fileType.includes("document")) return <FaRegFileWord className="text-blue-500" />;
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
    if (itemId) {
      updateMutation.mutate({
        [isSubtask ? "subtaskId" : "taskId"]: itemId,
        data: { description: trimmedValue },
      });
    }
    setDescriptions(trimmedValue);
    setEditingDescription(false);
  };

  const handleDownloadFile = async (fileObj) => {
    try {
      const endpoint = isSubtask
        ? `/attachment/subtask/${itemId}/download/${fileObj._id}`
        : `/attachment/${itemId}/download/${fileObj._id}`;

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileObj.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error('Failed to download file')
    }
  };

  const handleEditComment = (commentText) => {
    if (editedCommentText.trim()) {
      editCommentMutation.mutate({
        commentId: editingCommentId,
        text: editedCommentText,
      });
      setEditingCommentId(null);
      setEditedCommentText("");
      setActiveMenuId(null);
    }
  };

  const handleEditReply = () => {
    if (editedReplyText.trim()) {
      editCommentMutation.mutate({
        commentId: editingReplyId,
        text: editedReplyText,
      });
      setEditingReplyId(null);
      setEditedReplyText("");
      setActiveMenuId(null);
    }
  };

  const textareaRef = useRef(null);

useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }
}, [message]);
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
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Detail {isSubtask ? "Subtask" : "Task"}
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
                <div className="flex-1 overflow-y-auto p-6 space-y-4" onClick={() => setActiveMenuId(null)}>
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
                            <div className="relative">
                              {(isAuthorized || comment.user._id === (currentUser?._id || currentUser?.id)) && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(activeMenuId === comment._id ? null : comment._id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Menu"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {activeMenuId === comment._id && (
                                    <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment._id);
                                          setEditedCommentText(comment.text);
                                          setActiveMenuId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          setConfirmDelete({ show: true, commentId: comment._id });
                                          setActiveMenuId(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {editingCommentId === comment._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedCommentText}
                                onChange={(e) => setEditedCommentText(e.target.value)}
                                className="w-full text-sm text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditComment(comment.text)}
                                  disabled={editCommentMutation.isLoading}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {editCommentMutation.isLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditedCommentText("");
                                  }}
                                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                          )}
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
                              <div className="relative">
                                {(isAuthorized || reply.user._id === (currentUser?._id || currentUser?.id)) && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === reply._id ? null : reply._id);
                                      }}
                                      className="text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Menu"
                                    >
                                      <MoreVertical className="w-3 h-3" />
                                    </button>
                                    {activeMenuId === reply._id && (
                                      <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          onClick={() => {
                                            setEditingReplyId(reply._id);
                                            setEditedReplyText(reply.text);
                                            setActiveMenuId(null);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            setConfirmDelete({ show: true, commentId: reply._id });
                                            setActiveMenuId(null);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {editingReplyId === reply._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editedReplyText}
                                  onChange={(e) => setEditedReplyText(e.target.value)}
                                  className="w-full text-sm text-black border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleEditReply}
                                    disabled={editCommentMutation.isLoading}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {editCommentMutation.isLoading ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingReplyId(null);
                                      setEditedReplyText("");
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.text}</p>
                            )}
                          </div>
                        </div>
                      ))}{" "}
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="border-t p-4 space-y-3">
                  {replyTo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                      <Reply className="w-4 h-4" />
                      <span>Reply comment...</span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="ml-auto text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setMessage(message + "\n");
                        }
                      }}
                      placeholder="Write a comment..."
                      rows={1}
                      className="flex-1 text-black px-4 py-2 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                      style={{ minHeight: "40px", maxHeight: "150px" }}
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
                      onChange={(e) => isAuthorized && handleMeetingLinkChange(e.target.value)}
                      placeholder="Link meeting (opsional)"
                      readOnly={!isAuthorized}
                      className={`flex-1 text-black px-3 py-1 text-sm border rounded-lg focus:outline-none ${
                        isAuthorized
                          ? "focus:ring-2 focus:ring-blue-500"
                          : "bg-gray-50 cursor-default"
                      }`}
                    />
                  </div>

                  {/* Meeting Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <input
                      type="date"
                      value={meetingDate ? dayjs(meetingDate).format("YYYY-MM-DD") : ""}
                      onChange={(e) => isAuthorized && handleMeetingDateChange(e.target.value)}
                      disabled={!isAuthorized}
                      className={`flex-1 text-black px-3 py-1 text-sm border rounded-lg focus:outline-none ${
                        isAuthorized
                          ? "focus:ring-2 focus:ring-blue-500"
                          : "bg-gray-50 cursor-default opacity-70"
                      }`}
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
                    {editingDescription && isAuthorized ? (
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
                        className={`text-sm text-gray-800 px-2 py-1 rounded whitespace-pre-wrap ${
                          isAuthorized ? "hover:bg-gray-100 cursor-text" : "cursor-default"
                        }`}
                        onClick={() => {
                          if (!isAuthorized) return;
                          setEditingDescription(true);
                          setEditedDescription(descriptions);
                        }}
                      >
                        {descriptions || (isAuthorized ? "Click to add description..." : "-")}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">current status:</span>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                          status,
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
                                  <button
                                    onClick={() => handleDownloadFile(fileObj)}
                                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                    title="Download"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                 {(isAuthorized || isFileOwner(fileObj)) && (
                                    <button
                                      onClick={() => handleRemoveFile(fileObj._id)}
                                      className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
                                      title="Hapus"
                                      disabled={deleteAttachmentMutation.isLoading}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {confirmDelete.show && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center z-50"
                  onClick={() =>
                    setConfirmDelete({ show: false, commentId: null })
                  }
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Delete Comment
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete this comment? This action
                      cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() =>
                          setConfirmDelete({ show: false, commentId: null })
                        }
                        className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          deleteCommentMutation.mutate(confirmDelete.commentId);
                          setConfirmDelete({ show: false, commentId: null });
                        }}
                        disabled={deleteCommentMutation.isLoading}
                        className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {deleteCommentMutation.isLoading
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </motion.div>
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
