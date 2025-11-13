import CalendarView from "./Task/CalendarView";

const sampleTasks = [
  {
    title: "Project Kickoff",
    startDate: "2025-11-10",
    dueDate: "2025-11-15",
    meetingDate: "2025-11-12",
  },
  {
    title: "Design Review",
    startDate: "2025-11-18",
    dueDate: "2025-11-20",
    meetingDate: "2025-11-19",
  },
];

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">📅 Kalender Proyek</h1>
      <CalendarView tasks={sampleTasks} />
    </div>
  );
}
