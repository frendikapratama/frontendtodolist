import { X, Clock, Plus, Edit, Trash2 } from "lucide-react";
import { useRecentUpdates } from "../../context/RecentlyContext";
import { useLog } from "../../hook/useLog";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const RecentlyUpdates = () => {
    const { isOpen, selectedGroupId, closeRecentUpdates } = useRecentUpdates();
    const { logsByGroup } = useLog(selectedGroupId);
    const panelRef = useRef(null);
    const location = useLocation();
    const logs = logsByGroup?.data?.logs || [];
    useEffect(() => {
        if (isOpen) {
            closeRecentUpdates();
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                const isButtonClick = event.target.closest('button')?.textContent?.includes('Recent Updates') ||
                    event.target.closest('button')?.textContent?.includes('Hide Updates');
                if (!isButtonClick) {
                    closeRecentUpdates();
                }
            }
        };

        if (isOpen) {
            setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeRecentUpdates]);

    const formatDateTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTimeAgo = (date) => {
        if (!date) return "";
        const now = new Date();
        const updated = new Date(date);
        const diff = Math.floor((now - updated) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
        return formatDateTime(date);
    };

    const getActionIcon = (action) => {
        switch (action) {
            case "CREATE_TASK":
                return <Plus className="w-4 h-4 text-green-600" />;
            case "UPDATE_TASK":
                return <Edit className="w-4 h-4 text-blue-600" />;
            case "DELETE_TASK":
                return <Trash2 className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case "CREATE_TASK":
                return "bg-green-500";
            case "UPDATE_TASK":
                return "bg-blue-500";
            case "DELETE_TASK":
                return "bg-red-500";
            default:
                return "bg-gray-400";
        }
    };

    const getActionText = (action) => {
        switch (action) {
            case "CREATE_TASK":
                return "created new task";
            case "UPDATE_TASK":
                return "updated task";
            case "DELETE_TASK":
                return "deleted task";
            default:
                return "performed action";
        }
    };

    const renderChanges = (log) => {
        if (!log.before && !log.after) return null;
        const changes = [];
        if (log.action === "CREATE_TASK" && log.after) {
            return (
                <div className="mt-2 text-xs text-gray-600">
                    <span className="font-medium">New task created</span>
                </div>
            );
        }
        if (log.action === "UPDATE_TASK" && log.before && log.after) {
            const before = log.before;
            const after = log.after;
            Object.keys(after).forEach(key => {
                if (before[key] !== after[key]) {
                    changes.push({ field: key, from: before[key], to: after[key] });
                }
            });
            if (changes.length === 0) return null;
            return (
                <div className="mt-2 space-y-1">
                    {changes.map((change, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                            <span className="font-medium capitalize">{change.field}:</span>
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded line-through">
                                {change.from || '-'}
                            </span>
                            <span>→</span>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded font-medium">
                                {change.to || '-'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };
    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="w-96 bg-white border-l border-gray-300 shadow-lg flex flex-col h-screen fixed right-0 top-0 z-50"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-linear-to-r from-blue-600 to-blue-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                        <p className="text-sm text-blue-100 mt-1">
                            {logs.length} activities
                        </p>
                    </div>
                    <button
                        onClick={closeRecentUpdates}
                        className="p-1 hover:bg-blue-800 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Activity Log List */}
            <div className="flex-1 overflow-y-auto p-4">
                {logsByGroup?.isLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Clock className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log, index) => {
                            const isFirstOfDay = index === 0 ||
                                new Date(log.createdAt).toDateString() !== new Date(logs[index - 1].createdAt).toDateString();
                            return (
                                <div key={log._id}>
                                    {/* Date Separator */}
                                    {isFirstOfDay && (
                                        <div className="flex items-center gap-2 mb-3 mt-2">
                                            <div className="h-px bg-gray-300 flex-1"></div>
                                            <span className="text-xs font-medium text-gray-500">
                                                {new Date(log.createdAt).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <div className="h-px bg-gray-300 flex-1"></div>
                                        </div>
                                    )}
                                    {/* Activity Item */}
                                    <div className="flex gap-3 group">
                                        {/* Avatar/Icon */}
                                        <div className={`w-10 h-10 rounded-full ${getActionColor(log.action)} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
                                            {log.user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-lg p-3 group-hover:bg-gray-100 transition-colors">
                                                {/* Action Text */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getActionIcon(log.action)}
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-semibold text-gray-700">
                                                            {log.user?.username || 'Unknown'}
                                                        </span>
                                                        {' '}{getActionText(log.action)}
                                                    </p>
                                                </div>
                                                {/* Task Name */}
                                                <p className="text-sm font-medium text-gray-800 mb-2 wrap-break-word line-clamp-10">
                                                    "{log.task?.nama || 'Unknown Task'}"
                                                </p>
                                                {/* Changes */}
                                                {renderChanges(log)}
                                                {/* Meta Info */}
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatTimeAgo(log.createdAt)}</span>
                                                    {log.group?.nama && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-medium">{log.group.nama}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentlyUpdates;