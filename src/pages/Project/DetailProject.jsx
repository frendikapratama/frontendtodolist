import { useParams } from "react-router-dom";
import { useProject } from "../../hook/useProject";
import { useGroup } from "../../hook/useGroups";
import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Star,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
import TaskList from "../Task/TaskList";

const ProjectDetailPage = () => {
  const { projectDetail } = useProject();
  const { id } = useParams();
  const { addGroupMutation } = useGroup();
  const projectQuery = projectDetail(id);
  const { data, isLoading, isError } = projectQuery;
  const [groupName, setGroupName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-200">
          <p className="text-red-600 font-medium">Failed to load project</p>
        </div>
      </div>
    );
  }

  const handleAddProject = (e) => {
    e.preventDefault();
    addGroupMutation.mutate({
      projectId: id,
      data: { nama: groupName },
    });
    setGroupName("");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Add New Group
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                  onClick={handleAddProject}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-1.5 hover:bg-gray-100 rounded transition">
                <Star className="w-5 h-5 text-gray-400 hover:text-yellow-500" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {data.nama}
                  </h1>
                  <button className="p-1 hover:bg-gray-100 rounded transition">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Main workspace
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Last updated today
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm">
                Integrate
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm">
                Automate
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subheader / Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-full px-8">
          <div className="flex items-center gap-6">
            <button className="px-1 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
              Main Table
            </button>
            <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Kanban
            </button>
            <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Calendar
            </button>
            <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Chart
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full px-8 py-6">
        <div className="space-y-3">
          {data.groups &&
            data.groups.map((group, index) => (
              <div
                key={group._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Group Header */}
                <div
                  className="px-6 py-3.5 flex items-center justify-between cursor-pointer"
                  style={{
                    background:
                      index % 3 === 0
                        ? "#579bfc"
                        : index % 3 === 1
                        ? "#00c875"
                        : "#fdab3d",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-white" />
                    <h3 className="text-white font-semibold text-base">
                      {group.nama}
                    </h3>
                    <span className="text-xs text-white bg-white bg-opacity-20 px-2.5 py-1 rounded-full font-medium">
                      {group.tasks?.length || 0} items
                    </span>
                  </div>
                  <button className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded transition">
                    <MoreHorizontal className="w-5 h-5 text-white" />
                  </button>
                </div>

                <TaskList groupId={group._id} />
              </div>
            ))}

          {(!data.groups || data.groups.length === 0) && (
            <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Create your first group to start organizing tasks
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add New Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
