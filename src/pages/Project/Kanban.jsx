import { useState, useEffect, useMemo, useCallback } from "react";
import { useTaskByProject, useUpdateTask } from "../../hook/useTask";
import { Layout } from "lucide-react";

const Kanban = ({ projectId }) => {
  // ===== SEMUA HOOKS HARUS DI ATAS, SEBELUM CONDITIONAL RETURNS =====
  const tasksQuery = useTaskByProject(projectId);
  const updateTaskMutation = useUpdateTask();
  const [groups, setGroups] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");

  // Pindahkan ke useMemo agar tidak berubah setiap render
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

  // ===== CONDITIONAL RETURNS DI BAWAH SETELAH SEMUA HOOKS =====
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
      <div className="flex gap-4 overflow-x-auto pb-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="shrink-0 w-80 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Group Header */}
            <div
              className="px-4 py-3 text-white font-semibold rounded-t-lg"
              style={{
                backgroundColor: group.color,
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm">{group.name}</h3>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                  {group.tasks.length}
                </span>
              </div>
            </div>

            {/* Tasks List */}
            <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {group.tasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                      className="font-medium text-sm text-gray-800 mb-2 hover:bg-gray-100 px-1 rounded cursor-text"
                      onClick={() => {
                        setEditingField({ taskId: task._id, field: "nama" });
                        setEditedValue(task.nama);
                      }}
                    >
                      {task.nama}
                    </h4>
                  )}

                  {/* Group Info */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {task.status}
                    </span>
                  </div>

                  {/* PIC */}
                  {task.pic && task.pic.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs text-gray-500">PIC:</span>
                      <div className="flex flex-wrap gap-1">
                        {task.pic.map((person) => (
                          <span
                            key={person._id}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            {person.username}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtask Count */}
                  {task.subtask && task.subtask.length > 0 && (
                    <div className="text-xs text-gray-500 mb-2">
                      {task.subtask.length} subtask(s)
                    </div>
                  )}

                  {/* Note */}
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
                  No tasks in {group.name}
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
