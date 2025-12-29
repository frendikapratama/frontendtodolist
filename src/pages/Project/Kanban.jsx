import { useState, useEffect, useMemo, useCallback } from "react";
import { useTaskByProject, useUpdateTask } from "../../hook/useTask";
import { Layout } from "lucide-react";

const Kanban = ({ projectId }) => {
  const tasksQuery = useTaskByProject(projectId);
  const updateTaskMutation = useUpdateTask();

  const [groups, setGroups] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);

  const STATUS_OPTIONS = useMemo(
    () => ["To Do", "In Progress", "Done", "Blocked", "Hold"],
    []
  );

  const STATUS_COLORS = useMemo(
    () => ({
      "To Do": "#579bfc",
      "In Progress": "#fdab3d",
      Done: "#00c875",
      Blocked: "#e2445c",
      Hold: "#888888",
    }),
    []
  );

  const handleFieldEdit = useCallback(
    (taskId, field, value) => {
      const trimmedValue = value.trim();
      if (!trimmedValue && field === "nama") {
        setEditingField(null);
        return;
      }
      updateTaskMutation.mutate({ taskId, data: { [field]: trimmedValue } });
      setEditingField(null);
    },
    [updateTaskMutation]
  );

  const handleDragStart = (e, task, groupId) => {
    setDraggedTask({ task, sourceGroupId: groupId });
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedTask(null);
    setDragOverGroup(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (groupId) => {
    setDragOverGroup(groupId);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      setDragOverGroup(null);
    }
  };

  const handleDrop = (e, targetGroupId) => {
    e.preventDefault();

    if (!draggedTask) return;

    const targetGroup = groups.find((g) => g.id === targetGroupId);
    if (!targetGroup) return;

    if (draggedTask.task.status !== targetGroup.name) {
      updateTaskMutation.mutate({
        taskId: draggedTask.task._id,
        data: { status: targetGroup.name },
      });
    }

    setDraggedTask(null);
    setDragOverGroup(null);
  };

  useEffect(() => {
    if (tasksQuery.data) {
      const apiData = tasksQuery.data;

      if (apiData && Array.isArray(apiData)) {
        const statusGroups = STATUS_OPTIONS.map((status) => ({
          id: status.toLowerCase().replace(" ", "-"),
          name: status,
          color: STATUS_COLORS[status] || "#579bfc",
          tasks: [],
        }));

        apiData.forEach((groupData) => {
          if (groupData.tasks && Array.isArray(groupData.tasks)) {
            groupData.tasks.forEach((task) => {
              const status = task.status || "To Do";
              const statusGroup = statusGroups.find((g) => g.name === status);

              if (statusGroup) {
                statusGroup.tasks.push({
                  ...task,
                  groupName: groupData.groupName,
                  groupId: groupData.groupId,
                });
              }
            });
          }
        });

        setGroups(statusGroups);
      }
    }
  }, [tasksQuery.data, STATUS_OPTIONS, STATUS_COLORS]);

  if (tasksQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-1deg); }
          75% { transform: rotate(1deg); }
        }
        
        .dragging-card {
          transform: rotate(15deg);
          transition: transform 0.2s ease;
          cursor: grabbing !important;
        }
        
        .drag-over-zone {
          background: linear-gradient(135deg, rgba(87, 155, 252, 0.1) 0%, rgba(87, 155, 252, 0.05) 100%);
          border: 2px dashed rgba(87, 155, 252, 0.5);
          animation: shake 0.5s ease-in-out infinite;
        }
        
        .task-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .task-card:hover {
          transform: translateY(-4px);
        }
        
        .status-badge {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .status-badge.done {
          background: linear-gradient(to right, #00c875 0%, #00c875 10%, #f3f4f6 10%);
          transition: 1s ease;
          color: #00c875;
        }
        
        .status-badge.done:hover {
          background: #00c875 !important;
          color: white !important;
        }
        
        .status-badge.to-do {
          background: linear-gradient(to right, #579bfc 0%, #579bfc 10%, #f3f4f6 10%);
          transition: 1s ease;
          color: #579bfc;
        }
        
        .status-badge.to-do:hover {
          background: #579bfc !important;
          color: white !important;
        }
        
        .status-badge.in-progress {
          background: linear-gradient(to right, #fdab3d 0%, #fdab3d 10%, #f3f4f6 10%);
          transition: 1s ease;
          color: #fdab3d;
        }
        
        .status-badge.in-progress:hover {
          background: #fdab3d !important;
          color: white !important;
        }
        
        .status-badge.blocked {
          background: linear-gradient(to right, #e2445c 0%, #e2445c 10%, #f3f4f6 10%);
          transition: 1s ease;
          color: #e2445c;
        }
        
        .status-badge.blocked:hover {
          background: #e2445c !important;
          color: white !important;
        }
        
        .status-badge.hold {
          background: linear-gradient(to right, #888888 0%, #888888 10%, #f3f4f6 10%);
          transition: 1s ease;
          color: #888888;
        }
        
        .status-badge.hold:hover {
          background: #888888 !important;
          color: white !important;
        }
        
        .group-header {
          position: relative;
          overflow: hidden;
        }
        
        .group-header::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .group-header:hover::after {
          left: 100%;
        }
      `}</style>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className={`shrink-0 w-80 bg-gray-50 rounded-lg border-2 transition-all duration-300 ${dragOverGroup === group.id
              ? "drag-over-zone border-blue-400 scale-105"
              : "border-gray-200"
              }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnter(group.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, group.id)}
          >
            <div
              className="group-header px-4 py-3 text-white font-semibold rounded-t-lg"
              style={{
                backgroundColor: group.color,
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm">{group.name}</h3>
                <span className="text-xs bg-white/40 bg-opacity-30 px-2 py-1 rounded-full font-bold">
                  {group.tasks.length}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-200px)] overflow-y-auto">
              {group.tasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task, group.id)}
                  onDragEnd={handleDragEnd}
                  className={`task-card bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg cursor-grab active:cursor-grabbing ${draggedTask?.task._id === task._id ? "dragging-card" : ""
                    }`}
                >
                  {editingField?.taskId === task._id &&
                    editingField?.field === "nama" ? (
                    <input
                      type="text"
                      className="text-sm border text-black border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 cursor-text"
                      value={editedValue}
                      autoFocus
                      onChange={(e) => setEditedValue(e.target.value)}
                      onBlur={() =>
                        handleFieldEdit(task._id, "nama", editedValue)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleFieldEdit(task._id, "nama", editedValue);
                        if (e.key === "Escape") setEditingField(null);
                      }}
                    />
                  ) : (
                    <h4
                      className="font-medium text-sm text-gray-800 mb-2 hover:bg-gray-100 px-1 rounded cursor-text line-clamp-5 wrap-break-word"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField({ taskId: task._id, field: "nama" });
                        setEditedValue(task.nama);
                      }}
                    >
                      {task.nama}
                    </h4>
                  )}

                  <div className="flex items-center gap-1 mb-2">
                    <span
                      className={`status-badge text-xs px-2 py-1 rounded font-medium ${task.status === "Done"
                        ? "done"
                        : task.status === "To Do"
                          ? "to-do"
                          : task.status === "In Progress"
                            ? "in-progress"
                            : task.status === "Blocked"
                              ? "blocked"
                              : task.status === "Hold"
                                ? "hold"
                                : ""
                        }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.pic && task.pic.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs text-gray-500">PIC:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.pic.map((person) => (
                          <span
                            key={person._id}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            {person.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.subtask && task.subtask.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      {task.subtask.length} subtask(s)
                    </div>
                  )}

                  {task.note && task.note !== "Planning" && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {task.note}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500">
                    {task.due_date && (
                      <span>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {group.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <div className="opacity-50">Drop tasks here</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="text-center py-20 w-full bg-[#EFECE3] rounded-lg border-2 border-dashed border-gray-300">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Layout className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500 text-sm">
                  Create tasks to see them in kanban view
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;