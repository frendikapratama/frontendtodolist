import { useState } from "react";
import { useSubTask } from "../../hook/useSubTask";
import { Plus } from "lucide-react"; //
const SubtaskList = ({ taskId, subtasks }) => {
  const { addSubTaskMutation } = useSubTask(taskId);
  const [subtaskName, setSubtaskName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddSubtask = (e) => {
    e.preventDefault();
    addSubTaskMutation.mutate({
      taskId,
      data: { nama: subtaskName },
    });
    setSubtaskName("");
    setShowForm(false);
  };

  return (
    <div className="ml-12 mt-1 mb-2">
      {subtasks.map((s) => (
        <div
          key={s._id}
          className="flex items-center gap-3 py-2 px-4 hover:bg-gray-50 rounded"
        >
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">{s.nama}</span>
        </div>
      ))}
      {showForm ? (
        <div className="flex gap-2 px-4 py-2">
          <input
            type="text"
            placeholder="Subtask name"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            required
            autoFocus
          />
          <button
            onClick={handleAddSubtask}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="ml-4 mt-1 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add subtask
        </button>
      )}
    </div>
  );
};

export default SubtaskList;
