import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTask } from "../../hook/useTask";
import SubtaskList from "../Subtask/SubTaskList";

const TaskList = ({ groupId }) => {
  const { taskByGroup, addTaskMutation } = useTask(groupId);
  const { data, isLoading, isError } = taskByGroup;
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskName, setTaskName] = useState("");

  const toggleSubtasks = (taskId) => {
    setOpenSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    addTaskMutation.mutate({
      groupId,
      data: { nama: taskName },
    });
    setTaskName("");
    setShowAddTask(false);
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
                <div className="flex items-center hover:bg-gray-50 transition">
                  <div className="flex-1 flex items-center gap-3 px-6 py-3.5 border-b border-gray-100">
                    {task.subtask && task.subtask.length > 0 && (
                      <button
                        onClick={() => toggleSubtasks(task._id)}
                        className="p-0.5 hover:bg-gray-200 rounded transition"
                      >
                        {openSubtasks[task._id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                    {(!task.subtask || task.subtask.length === 0) && (
                      <div className="w-5"></div>
                    )}
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 font-medium flex-1">
                      {task.nama}
                    </span>
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
                {openSubtasks[task._id] &&
                  task.subtask &&
                  task.subtask.length > 0 && (
                    <div className="border-b border-gray-100">
                      <SubtaskList taskId={task._id} subtasks={task.subtask} />
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask(e);
                  if (e.key === "Escape") setShowAddTask(false);
                }}
              />
              <button
                onClick={handleAddTask}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
              >
                Cancel
              </button>
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
