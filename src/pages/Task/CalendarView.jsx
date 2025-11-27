import React, { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTaskByProject, useUpdateTask } from "../../hook/useTask";
import { Calendar, X, AlertCircle } from "lucide-react";

const EventDetailsDialog = ({ event, onClose }) => {
  if (!event) return null;

  const props = event.extendedProps;
  const statusColors = {
    "To Do": "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Done": "bg-green-100 text-green-800",
    "Blocked": "bg-red-100 text-red-800",
    "Hold": "bg-yellow-100 text-yellow-800",
  };

  const priorityColors = {
    "Low": "bg-blue-100 text-blue-800",
    "Medium": "bg-yellow-100 text-yellow-800",
    "High": "bg-red-100 text-red-800",
    "Urgent": "bg-purple-100 text-purple-800",
  };

  const typeIcons = {
    "start": "🟢",
    "due": "🔴",
    "meeting": "🔵",
    "finish": "✅",
  };

  const typeLabels = {
    "start": "Start Date",
    "due": "Due Date",
    "meeting": "Meeting Date",
    "finish": "Finish Date",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{typeIcons[props.type]}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                {event.title.replace(` (${props.type.charAt(0).toUpperCase() + props.type.slice(1)})`, "")}
              </h3>
              <p className="text-xs text-gray-500">{typeLabels[props.type]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {event.start.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Group */}
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Group</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{props.groupName}</p>
            </div>
          </div>

          {/* Status & Priority Row */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Status */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColors[props.status] || "bg-gray-100 text-gray-800"}`}>
                {props.status}
              </span>
            </div>

            {/* Priority */}
            {props.priority && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[props.priority] || "bg-gray-100 text-gray-800"}`}>
                  {props.priority}
                </span>
              </div>
            )}
          </div>

          {/* Meeting Link */}
          {props.meeting_link && (
            <div className="flex items-start gap-3 pt-2">
              <div className="shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-bold text-green-600">🔗</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Meeting Link</p>
                <a
                  href={props.meeting_link.startsWith('http') ? props.meeting_link : `https://${props.meeting_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  {props.meeting_link}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoomIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-in.fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-in.zoom-in-95 {
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

const CalendarView = ({ projectId }) => {
  const tasksQuery = useTaskByProject(projectId);
  const updateTaskMutation = useUpdateTask();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const allTasks = useMemo(() => {
    return (
      tasksQuery.data?.flatMap(
        (group) =>
          group.tasks?.map((task) => ({
            ...task,
            groupName: group.groupName,
          })) || []
      ) || []
    );
  }, [tasksQuery.data]);

  useEffect(() => {
    if (allTasks && allTasks.length > 0) {
      const mappedEvents = allTasks.flatMap((task) => {
        const events = [];

        // Start Date Event
        if (task.start_date) {
          events.push({
            id: `${task._id}-start`,
            title: `${task.nama} (Start)`,
            start: task.start_date,
            allDay: true,
            backgroundColor: "#4caf50",
            borderColor: "#4caf50",
            editable: false, // Start date tidak bisa di-drag
            extendedProps: {
              taskId: task._id,
              type: "start",
              status: task.status,
              groupName: task.groupName,
              priority: task.priority,
              meeting_link: task.meeting_link,
            },
          });
        }

        // Due Date Event - EDITABLE
        if (task.due_date) {
          events.push({
            id: `${task._id}-due`,
            title: `${task.nama} (Due)`,
            start: task.due_date,
            allDay: true,
            backgroundColor: "#f44336",
            borderColor: "#f44336",
            editable: true, // Due date bisa di-drag
            extendedProps: {
              taskId: task._id,
              type: "due",
              status: task.status,
              groupName: task.groupName,
              priority: task.priority,
              meeting_link: task.meeting_link,
            },
          });
        }

        // Meeting Date Event
        if (task.meeting_date) {
          events.push({
            id: `${task._id}-meeting`,
            title: `${task.nama} (Meeting)`,
            start: task.meeting_date,
            allDay: true,
            backgroundColor: "#2196f3",
            borderColor: "#2196f3",
            editable: true, // Meeting date tidak bisa di-drag
            extendedProps: {
              taskId: task._id,
              type: "meeting",
              status: task.status,
              groupName: task.groupName,
              priority: task.priority,
              meeting_link: task.meeting_link,
            },
          });
        }

        // Finish Date Event
        if (task.finish_date) {
          events.push({
            id: `${task._id}-finish`,
            title: `${task.nama} (Finish)`,
            start: task.finish_date,
            allDay: true,
            backgroundColor: "#00c875",
            borderColor: "#00c875",
            editable: false, // Finish date tidak bisa di-drag
            extendedProps: {
              taskId: task._id,
              type: "finish",
              status: task.status,
              groupName: task.groupName,
              priority: task.priority,
              meeting_link: task.meeting_link,
            },
          });
        }

        return events;
      });

      setEvents(mappedEvents);
    }
  }, [allTasks]);

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    if (props.type !== "due" && props.type !== "meeting") {
      info.revert();
      return;
    }

    const newDate = event.start;
    const taskId = props.taskId;
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const updateField = props.type === "due" ? "due_date" : "meeting_date";
    updateTaskMutation.mutate(
      {
        taskId: taskId,
        data: { [updateField]: formattedDate },
      },
      {
        onSuccess: () => {
          console.log(`${props.type} date updated successfully to:`, formattedDate);
        },
        onError: (error) => {
          console.error(`Failed to update ${props.type} date:`, error);
          info.revert(); 
        },
      }
    );
  };

  const handleEventResize = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    if (props.type !== "due" && props.type !== "meeting") {
      info.revert();
      return;
    }

    const newDate = event.start;
    const taskId = props.taskId;

    // Fix timezone issue
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    const updateField = props.type === "due" ? "due_date" : "meeting_date";

    updateTaskMutation.mutate(
      {
        taskId: taskId,
        data: { [updateField]: formattedDate },
      },
      {
        onSuccess: () => {
          console.log(`${props.type} date updated successfully to:`, formattedDate);
        },
        onError: (error) => {
          console.error(`Failed to update ${props.type} date:`, error);
          info.revert();
        },
      }
    );
  };

  if (tasksQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading Calendar...</p>
        </div>
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-600 font-medium">Failed to load calendar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 shadow-2xl text-black rounded-lg p-6">
      {allTasks.length > 0 ? (
        <div className="bg-white/60 rounded-xl shadow-lg p-4">
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#4caf50" }}
              ></div>
              <span className="text-gray-600">Start Date</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f44336" }}
              ></div>
              <span className="text-gray-600">Due Date (Draggable)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#2196f3" }}
              ></div>
              <span className="text-gray-600">Meeting Date (Draggable)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#00c875" }}
              ></div>
              <span className="text-gray-600">Finish Date</span>
            </div>
          </div>

          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="80vh"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            editable={true}
            droppable={true}
            eventDisplay="block"
            dayMaxEvents={3}
            displayEventTime={false}
            eventClassNames="cursor-pointer"
            dayCellClassNames="hover:bg-gray-50"
            eventStartEditable={true}
            eventDurationEditable={false}
          />
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No tasks in calendar
              </h3>
              <p className="text-gray-500 text-sm">
                Create tasks with dates to see them in calendar view
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Dialog */}
      <EventDetailsDialog 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
};

export default CalendarView;
