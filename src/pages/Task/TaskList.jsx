import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTask } from "../../hook/useTask";
import SubtaskList from "../Subtask/SubTaskList";

const TaskList = ({ groupId }) => {
  const { taskByGroup, addTaskMutation, updateTaskMutation } = useTask(groupId);
  const { data, isLoading, isError } = taskByGroup;
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [hoveredTask, setHoveredTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const toggleSubtasks = (taskId) => {
    setOpenSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleAdd = () => {
    if (!taskName.trim()) return;
    addTaskMutation.mutate(
      { groupId, data: { nama: taskName.trim() } },
      {
        onSuccess: () => {
          setTaskName("");
          setShowAddTask(false);
        },
      }
    );
  };

  const handleAddKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === "Escape") {
      setTaskName("");
      setShowAddTask(false);
    }
  };

  const handleEdit = (groupId) => {
    if (!editedName.trim()) return;
    updateTaskMutation.mutate({
      groupId,
      data: { nama: editedName.trim() },
    });
    setEditingTaskId(null);
  };

  const handleEditKeyDown = (e, groupId) => {
    if (e.key === "Enter") handleEdit(groupId);
    if (e.key === "Escape") setEditingTaskId(null);
  };

  if (!groupId)
    return (
      <p className="px-6 py-4 text-sm text-gray-500">Select a group first</p>
    );
  if (isLoading)
    return <p className="px-6 py-4 text-sm text-gray-500">Loading tasks...</p>;
  if (isError)
    return (
      <p className="px-6 py-4 text-sm text-red-500">Failed to load tasks</p>
    );

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex bg-gray-50 border-b border-gray-200">
            <div className="flex-1 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Task
            </div>
            <div className="w-32 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Person
            </div>
            <div className="w-40 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </div>
            <div className="w-32 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Priority
            </div>
            <div className="w-40 px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </div>
          </div>

          {data &&
            data.map((task) => (
              <div key={task._id}>
                <div
                  className="flex items-center hover:bg-gray-50 transition"
                  onMouseEnter={() => setHoveredTask(task._id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <div className="flex-1 flex items-center gap-3 px-6 py-3.5 border-b border-gray-100">
                    <button
                      onClick={() => toggleSubtasks(task._id)}
                      className={`p-0.5 hover:bg-gray-200 rounded transition ${
                        hoveredTask === task._id ||
                        (task.subtask && task.subtask.length > 0)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      {openSubtasks[task._id] ? (
                        <ChevronDown
                          className={`w-4 h-4 ${
                            task.subtask && task.subtask.length > 0
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        />
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 ${
                            task.subtask && task.subtask.length > 0
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                    </button>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {editingTaskId === task._id ? (
                      <input
                        type="text"
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                        value={editedName}
                        autoFocus
                        onChange={(e) => setEditedName(e.target.value)}
                        onBlur={() => handleEdit(task._id)}
                        onKeyDown={(e) => handleEditKeyDown(e, task._id)}
                      />
                    ) : (
                      <span
                        className="text-sm text-gray-700 hover:bg-gray-100 px-1 rounded cursor-pointer"
                        onClick={() => {
                          setEditingTaskId(task._id);
                          setEditedName(task.nama);
                        }}
                      >
                        {task.nama}
                      </span>
                    )}
                  </div>
                  <div className="w-32 px-6 py-3.5 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      UN
                    </div>
                  </div>
                  <div className="w-40 px-6 py-3.5 border-b border-gray-100">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Not Started
                    </span>
                  </div>
                  <div className="w-32 px-6 py-3.5 border-b border-gray-100">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Low
                    </span>
                  </div>
                  <div className="w-40 px-6 py-3.5 border-b border-gray-100 text-sm text-gray-600">
                    No date
                  </div>
                </div>
                {openSubtasks[task._id] && (
                  <div className="border-b border-gray-100">
                    <SubtaskList
                      taskId={task._id}
                      subtasks={task.subtask || []}
                      groupId={groupId}
                    />
                  </div>
                )}
              </div>
            ))}

          {showAddTask ? (
            <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100">
              <div className="w-5"></div>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
                disabled
              />
              <input
                type="text"
                placeholder="Task name"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                autoFocus
                onKeyDown={handleAddKeyDown}
                onBlur={() =>
                  taskName.trim() ? handleAdd() : setShowAddTask(false)
                }
              />
            </div>
          ) : (
            <div className="px-6 py-3 border-b border-gray-100">
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
              >
                <Plus className="w-4 h-4" />
                Add task
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default TaskList;
