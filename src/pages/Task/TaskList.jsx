import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { useTask } from "../../hook/useTask";
import SubtaskList from "../Subtask/SubTaskList";
import PopupSelect from "./PopupSelect";
import DatePickerPopup from "./DatePickerPopup";

const TaskList = ({ groupId }) => {
  const { taskByGroup, addTaskMutation, updateTaskMutation } = useTask(groupId);
  const { data, isLoading, isError } = taskByGroup;
  const [openSubtasks, setOpenSubtasks] = useState({});
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [hoveredTask, setHoveredTask] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [activePopup, setActivePopup] = useState(null);

  const buttonRefs = useRef({});

  const STATUS_OPTIONS = ["To Do", "In Progress", "Done", "Blocked"];
  const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Urgent"];

  const toggleSubtasks = (taskId) => {
    setOpenSubtasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleAddTask = useCallback(() => {
    const trimmedName = taskName.trim();
    if (!trimmedName) return;
    const newTaskData = {
      nama: trimmedName,
      status: "To Do",
      priority: "Medium",
      start_date: "",
    };

    addTaskMutation.mutate(newTaskData, {
      onSuccess: () => {
        setTaskName("");
        setShowAddTask(false);
      },
    });
  }, [taskName, addTaskMutation]);

  const handleAddKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTask();
      } else if (e.key === "Escape") {
        setTaskName("");
        setShowAddTask(false);
      }
    },
    [handleAddTask]
  );

  const handleFieldEdit = useCallback(
    (taskId, field, value) => {
      const trimmedValue = value.trim();

      if (!trimmedValue && field === "nama") {
        setEditingField(null);
        return;
      }

      updateTaskMutation.mutate({
        taskId,
        data: { [field]: trimmedValue },
      });

      setEditingField(null);
    },
    [updateTaskMutation]
  );

  const handleFieldKeyDown = useCallback(
    (e, taskId, field) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleFieldEdit(taskId, field, editedValue);
      } else if (e.key === "Escape") {
        setEditingField(null);
      }
    },
    [editedValue, handleFieldEdit]
  );

  const handlePopupChange = useCallback(
    (taskId, field, value) => {
      updateTaskMutation.mutate({
        taskId,
        data: { [field]: value },
      });
      setActivePopup(null);
    },
    [updateTaskMutation]
  );

  const startEditing = useCallback((taskId, field, currentValue) => {
    setEditingField({ taskId, field });
    setEditedValue(currentValue);
  }, []);

  const openPopup = useCallback((taskId, field) => {
    setActivePopup({ taskId, field });
  }, []);

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
              Start Date
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
                    {editingField?.taskId === task._id &&
                    editingField?.field === "nama" ? (
                      <input
                        type="text"
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
                        value={editedValue}
                        autoFocus
                        onChange={(e) => setEditedValue(e.target.value)}
                        onBlur={() =>
                          handleFieldEdit(task._id, "nama", editedValue)
                        }
                        onKeyDown={(e) =>
                          handleFieldKeyDown(e, task._id, "nama")
                        }
                      />
                    ) : (
                      <span
                        className="text-sm text-gray-700 hover:bg-gray-100 px-1 rounded cursor-pointer"
                        onClick={() =>
                          startEditing(task._id, "nama", task.nama)
                        }
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
                  <div className="w-40 px-6 py-3.5 border-b border-gray-100 flex items-center">
                    <span
                      ref={(el) =>
                        (buttonRefs.current[`status-${task._id}`] = el)
                      }
                      className="px-3 py-1.5 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-700 cursor-pointer hover:bg-indigo-200 transition"
                      onClick={() => openPopup(task._id, "status")}
                    >
                      {task.status}
                    </span>

                    {activePopup?.taskId === task._id &&
                      activePopup?.field === "status" && (
                        <PopupSelect
                          value={task.status}
                          options={STATUS_OPTIONS}
                          onChange={(value) =>
                            handlePopupChange(task._id, "status", value)
                          }
                          onClose={() => setActivePopup(null)}
                          buttonRef={{
                            current: buttonRefs.current[`status-${task._id}`],
                          }}
                        />
                      )}
                  </div>
                  <div className="w-32 px-6 py-3.5 border-b border-gray-100">
                    <span
                      ref={(el) =>
                        (buttonRefs.current[`priority-${task._id}`] = el)
                      }
                      className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                      onClick={() => openPopup(task._id, "priority")}
                    >
                      {task.priority}
                    </span>

                    {activePopup?.taskId === task._id &&
                      activePopup?.field === "priority" && (
                        <PopupSelect
                          value={task.priority}
                          options={PRIORITY_OPTIONS}
                          onChange={(value) =>
                            handlePopupChange(task._id, "priority", value)
                          }
                          onClose={() => setActivePopup(null)}
                          buttonRef={{
                            current: buttonRefs.current[`priority-${task._id}`],
                          }}
                        />
                      )}
                  </div>

                  <div className="w-40 px-6 py-3.5 border-b border-gray-100">
                    <span
                      ref={(el) =>
                        (buttonRefs.current[`date-${task._id}`] = el)
                      }
                      className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 px-1 rounded"
                      onClick={() => openPopup(task._id, "start_date")}
                    >
                      {task.start_date
                        ? new Date(task.start_date).toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "Set date"}
                    </span>

                    {activePopup?.taskId === task._id &&
                      activePopup?.field === "start_date" && (
                        <DatePickerPopup
                          value={task.start_date}
                          onChange={(value) =>
                            handlePopupChange(task._id, "start_date", value)
                          }
                          onClose={() => setActivePopup(null)}
                          buttonRef={{
                            current: buttonRefs.current[`date-${task._id}`],
                          }}
                        />
                      )}
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
              <div className="w-5" />
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300"
                disabled
              />
              <input
                type="text"
                placeholder="Nama task"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                autoFocus
                onKeyDown={handleAddKeyDown}
                onBlur={() =>
                  taskName.trim() ? handleAddTask() : setShowAddTask(false)
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
                Tambah task
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default TaskList;
