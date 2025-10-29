import { useParams } from "react-router-dom";
import { useProject } from "../../hook/useProject";
import { useGroup } from "../../hook/useGroups";
import { Plus, Star, Users, Calendar, ChevronDown } from "lucide-react";
import GroupCard from "./GroupCard";
const ProjectDetailPage = () => {
  const { projectDetail } = useProject();
  const { id } = useParams();
  const { addGroupMutation } = useGroup();
  const projectQuery = projectDetail(id);
  const { data, isLoading, isError } = projectQuery;

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
    addGroupMutation.mutate({
      projectId: id,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={() => handleAddProject()}
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
              <GroupCard key={group._id} group={group} index={index} />
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
                  onClick={() => handleAddProject()}
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
