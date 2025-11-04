import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function CalendarView({ tasks }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const mappedEvents = tasks.flatMap((task) => {
        const events = [];

        if (task.startDate) {
          events.push({
            title: `${task.title} (Start)`,
            start: task.startDate,
            color: "#4caf50",
          });
        }

        if (task.dueDate) {
          events.push({
            title: `${task.title} (Due)`,
            start: task.dueDate,
            color: "#f44336",
          });
        }

        if (task.meetingDate) {
          events.push({
            title: `${task.title} (Meeting)`,
            start: task.meetingDate,
            color: "#2196f3",
          });
        }

        return events;
      });

      setEvents(mappedEvents);
    }
  }, [tasks]);

  return (
    <div className="p-4 bg-white rounded-xl shadow">
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
        eventClick={(info) => alert(info.event.title)}
      />
    </div>
  );
}
