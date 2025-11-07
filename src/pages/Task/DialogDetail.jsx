import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Paperclip, Link2, Calendar, Reply, MoreVertical } from "lucide-react"

const DialogDetail = ({ onClose, show }) => {
    // const dialogRef = useRef(null);
    // const fileInputRef = useRef(null);
    const dialogRef = useRef(null);
        const fileInputRef = useRef(null);
        const [status, setStatus] = useState("to-do");
        const [message, setMessage] = useState("");
        const [replyTo, setReplyTo] = useState(null);
        const [meetingLink, setMeetingLink] = useState("");
        const [dueDate, setDueDate] = useState("");
        const [uploadedFiles, setUploadedFiles] = useState([]);
        const [comments, setComments] = useState([
            {
                id: 1,
                author: "John Doe",
                avatar: "JD",
                content: "Sudah saya review dokumentasinya, sepertinya perlu beberapa revisi.",
                timestamp: "2 jam yang lalu",
                replies: [
                    {
                        id: 2,
                        author: "Jane Smith",
                        avatar: "JS",
                        content: "Setuju, saya akan update bagian introduction.",
                        timestamp: "1 jam yang lalu",
                    }
                ]
            },
            {
                id: 3,
                author: "Mike Johnson",
                avatar: "MJ",
                content: "Kapan kita bisa meeting untuk discuss ini?",
                timestamp: "30 menit yang lalu",
                replies: []
            }
        ]);

    const handleSendMessage = () => {
        if (message.trim()) {
            if (replyTo) {
                // Add reply to specific comment
                setComments(comments.map(comment => {
                    if (comment.id === replyTo) {
                        return {
                            ...comment,
                            replies: [
                                ...comment.replies,
                                {
                                    id: Date.now(),
                                    author: "You",
                                    avatar: "YU",
                                    content: message,
                                    timestamp: "Baru saja"
                                }
                            ]
                        }
                    }
                    return comment;
                }));
                setReplyTo(null);
            } else {
                setComments([...comments, {
                    id: Date.now(),
                    author: "You",
                    avatar: "YU",
                    content: message,
                    timestamp: "Baru saja",
                    replies: []
                }]);
            }
            setMessage("");
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles([...uploadedFiles, ...files]);
    };

    const statusOptions = [
        { value: "to-do", label: "To Do", color: "bg-gray-100 text-gray-700" },
        { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
        { value: "done", label: "Done", color: "bg-green-100 text-green-700" }
    ];

    const getStatusColor = (statusValue) => {
        return statusOptions.find(s => s.value === statusValue)?.color || "";
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
                    onClick={onClose}
                >
                    <motion.div
                        key="dialog-content"
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold text-gray-800">Detail Task</h2>
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
                                        <div key={comment.id} className="space-y-3">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                    {comment.avatar}
                                                </div>
                                                <div className="flex-1 bg-gray-50 rounded-2xl p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{comment.author}</p>
                                                            <p className="text-xs text-gray-500">{comment.timestamp}</p>
                                                        </div>
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-700">{comment.content}</p>
                                                    <button
                                                        onClick={() => setReplyTo(comment.id)}
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <Reply className="w-3 h-3" />
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Replies */}
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="flex gap-3 ml-12">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                                                        {reply.avatar}
                                                    </div>
                                                    <div className="flex-1 bg-gray-50 rounded-2xl p-3">
                                                        <div className="flex items-start justify-between mb-1">
                                                            <div>
                                                                <p className="font-semibold text-sm text-gray-800">{reply.author}</p>
                                                                <p className="text-xs text-gray-500">{reply.timestamp}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{reply.content}</p>
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
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Tulis komentar..."
                                            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        >
                                            <Paperclip className="w-4 h-4" />
                                            Upload File
                                        </button>
                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-1">
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                        <Paperclip className="w-3 h-3" />
                                                        {file.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Meeting Link */}
                                    <div className="flex items-center gap-2">
                                        <Link2 className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="Link meeting (opsional)"
                                            className="flex-1 px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="flex-1 px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar - Status */}
                            <div className="w-64 border-l p-6 space-y-4">
                                {/* <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
                                    <div className="space-y-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setStatus(option.value)}
                                                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all ${status === option.value
                                                        ? option.color + " ring-2 ring-offset-2 ring-blue-500"
                                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div> */}

                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Status saat ini:</span>
                                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(status)}`}>
                                            {statusOptions.find(s => s.value === status)?.label}
                                        </span>
                                    </p>
                                </div>

                                {dueDate && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Due Date:</span>
                                            <br />
                                            <span className="text-gray-800">
                                                {new Date(dueDate).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {meetingLink && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Meeting Link</p>
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
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DialogDetail;