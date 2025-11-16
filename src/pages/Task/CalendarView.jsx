import React, { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTaskByProject, useUpdateTask } from "../../hook/useTask";
import { Calendar } from "lucide-react";

const CalendarView = ({ projectId }) => {
  const tasksQuery = useTaskByProject(projectId);
  const updateTaskMutation = useUpdateTask();
  const [events, setEvents] = useState([]);

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
            editable: false, // Meeting date tidak bisa di-drag
            extendedProps: {
              taskId: task._id,
              type: "meeting",
              status: task.status,
              groupName: task.groupName,
              priority: task.priority,
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
            },
          });
        }

        return events;
      });

      setEvents(mappedEvents);
    }
  }, [allTasks]);

  const handleEventClick = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    const eventDetails = `
Task: ${event.title}
Group: ${props.groupName}
Status: ${props.status}
Priority: ${props.priority || "N/A"}
Type: ${props.type}
Date: ${event.start.toLocaleDateString()}
    `;

    alert(eventDetails);
  };

  // Handle event drop (drag and drop)
  const handleEventDrop = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    // Hanya update jika type adalah 'due'
    if (props.type !== "due") {
      info.revert(); // Kembalikan posisi event jika bukan due date
      return;
    }

    const newDate = event.start;
    const taskId = props.taskId;

    // Fix timezone issue: ambil tahun, bulan, tanggal dari local date
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const day = String(newDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    // Update task langsung tanpa konfirmasi
    updateTaskMutation.mutate(
      {
        taskId: taskId,
        data: { due_date: formattedDate },
      },
      {
        onSuccess: () => {
          console.log("Due date updated successfully to:", formattedDate);
        },
        onError: (error) => {
          console.error("Failed to update due date:", error);
          info.revert(); // Kembalikan posisi event jika gagal
        },
      }
    );
  };

  // Handle event resize (optional, untuk extend duration)
  const handleEventResize = (info) => {
    const { event } = info;
    const props = event.extendedProps;

    // Hanya update jika type adalah 'due'
    if (props.type !== "due") {
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

    updateTaskMutation.mutate(
      {
        taskId: taskId,
        data: { due_date: formattedDate },
      },
      {
        onError: () => {
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
              <span className="text-gray-600">Meeting Date</span>
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
    </div>
  );
};

export default CalendarView;
