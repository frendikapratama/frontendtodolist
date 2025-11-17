import React, { useState, useMemo } from "react";
import { Gantt } from "@svar-ui/react-gantt";
import "@svar-ui/react-gantt/all.css";
import { Calendar, AlertCircle } from "lucide-react";
import { useGanchart } from "../../hook/useGanchart";

const GanttChart = ({ projectId }) => {
  const ganchartByproject = useGanchart(projectId);

  // Fungsi untuk validasi dan parsing tanggal
  const parseDate = (dateString) => {
    if (!dateString) return new Date(); // Fallback ke tanggal sekarang jika null
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date; // Fallback jika invalid
  };

  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Invalid Date";
    }
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const [links] = useState([]);
  const [scales] = useState([
    { unit: "month", step: 1, format: "MMMM yyyy" },
    { unit: "day", step: 1, format: "d" },
  ]);

  const tasks = useMemo(() => {
    if (!ganchartByproject.data?.data?.groups) return [];

    console.log("Raw API data:", ganchartByproject.data.data);

    return ganchartByproject.data.data.groups
      .filter((group) => group.nama && group.groupId)
      .map((group) => {
        const startDate = parseDate(group.start_date);
        const dueDate = parseDate(group.due_date);

        // Jika due_date sebelum start_date, atur due_date ke 7 hari setelah start_date
        const validDueDate =
          dueDate < startDate
            ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            : dueDate;

        return {
          id: group.groupId,
          text: group.nama || "Unnamed Group",
          start: startDate,
          end: validDueDate,
          duration: calculateDuration(startDate, validDueDate),
          progress: (group.progress || 0) / 100 || 0,
          type: "task",
          completedTask: group.completedTask || 0,
          totalTask: group.totalTask || 0,
          finish_date: group.finish_date,
          tasks: group.tasks || [],
        };
      });
  }, [ganchartByproject.data]);

  const projectInfo = useMemo(() => {
    return (
      ganchartByproject.data?.data?.project || { name: "Project Timeline" }
    );
  }, [ganchartByproject.data]);

  const handleTaskUpdate = (id, task) => {
    console.log("Group updated:", id, task);
  };

  const handleTaskClick = (id) => {
    const clickedTask = tasks.find((t) => t.id === id);
    if (clickedTask) {
      console.log("Group clicked:", clickedTask);
    }
  };

  // Debug logs
  console.log("Processed tasks:", tasks);

  if (ganchartByproject.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading Gantt Chart...</p>
        </div>
      </div>
    );
  }

  if (ganchartByproject.isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-medium">Failed to load Gantt Chart</p>
              <p className="text-sm text-red-500 mt-1">
                {ganchartByproject.error?.message || "Please try again later"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    !ganchartByproject.isLoading &&
    !ganchartByproject.isError &&
    tasks.length === 0
  ) {
    return (
      <div className="bg-black/20 shadow-2xl text-black rounded-lg p-6">
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No groups available for Gantt Chart
              </h3>
              <p className="text-gray-500 text-sm">
                Create groups with start and due dates to see them in Gantt view
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 shadow-2xl text-black rounded-lg p-6">
      <div className="bg-white/60 rounded-xl shadow-lg p-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {projectInfo?.name || "Project Timeline"}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Showing {tasks.length} group{tasks.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-sm bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-600">Group Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-4 rounded bg-blue-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-700 w-1/2"></div>
            </div>
            <span className="text-gray-600">Progress Bar</span>
          </div>
        </div>

        <div
          className="border rounded-lg shadow-sm bg-white overflow-hidden"
          style={{ height: "70vh" }}
        >
          <Gantt
            tasks={tasks}
            links={links}
            scales={scales}
            columns={[
              {
                name: "text",
                label: "Group Name",
                width: 220,
                resize: true,
              },
              {
                name: "start",
                label: "Start Date",
                width: 110,
                align: "center",
                resize: true,
                template: (task) => formatDate(task.start),
              },
              {
                name: "end",
                label: "Due Date",
                width: 110,
                align: "center",
                resize: true,
                template: (task) => formatDate(task.end),
              },
              {
                name: "duration",
                label: "Duration",
                width: 80,
                align: "center",
                template: (task) => `${task.duration || 0} days`,
              },
              {
                name: "progress",
                label: "Progress",
                width: 90,
                align: "center",
                template: (task) =>
                  `${Math.round((task.progress || 0) * 100)}%`,
              },
              {
                name: "totalTask",
                label: "Tasks",
                width: 80,
                align: "center",
                template: (task) =>
                  `${task.completedTask || 0}/${task.totalTask || 0}`,
              },
            ]}
            cellWidth={50}
            cellHeight={42}
            readonly={false}
            onTaskUpdate={handleTaskUpdate}
            onTaskClick={handleTaskClick}
            taskHeight={32}
            progressColor="#1d4ed8"
            barStyle={{
              backgroundColor: "#3b82f6",
              borderRadius: "6px",
            }}
          />
        </div>

        <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
          <span>Click on a group to view details</span>
          <span>Drag to reschedule (coming soon)</span>
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800 font-medium">
            Data Loaded Successfully:
          </p>
          <p className="text-xs text-green-600">
            ✓ {tasks.length} group(s) loaded
          </p>
          <p className="text-xs text-green-600">
            ✓ Dates validated and formatted
          </p>
          <p className="text-xs text-green-600">✓ All data sanitized</p>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
