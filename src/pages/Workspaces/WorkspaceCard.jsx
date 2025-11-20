import React, { useState } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import { useWorkspaceStats } from "../../hook/useProgress";
import { useMember } from "../../hook/useMember";

const WorkspaceCard = ({
  workspace,
  isSelected,
  onCardClick,
  onEdit,
  onDelete,
  onDetail,
  editing,
  editedName,
  setEditedName,
  handleEditKeyDown,
  updateWorkspaceMutation,
  deleteMutation,
}) => {
  const { workspaceStats } = useWorkspaceStats(workspace._id);
  const progress = workspaceStats.data?.progress ?? 0;

  console.log(`Progress for ${workspace.nama}:`, {
    loading: workspaceStats.isLoading,
    progress: progress,
    rawData: workspaceStats.data,
  });

  const { membersWorkspaceQuery } = useMember("workspace", workspace._id);
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div
      className={`card text-black bg-white/40 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onClick={() => onCardClick(workspace)}
    >
      <div className="card-body">
        {editing === workspace._id ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="text-xl border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500"
              value={editedName}
              autoFocus
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => handleEditKeyDown(e, workspace._id)}
              onClick={(e) => e.stopPropagation()}
              disabled={updateWorkspaceMutation.isPending}
            />
            {updateWorkspaceMutation.isPending && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
          </div>
        ) : (
          <h2
            className="card-title hover:bg-gray-100 px-1 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(workspace._id, workspace.nama);
            }}
          >
            {workspace.nama}
          </h2>
        )}
        <div className="flex justify-between">
          <div className="flex mt-2 items-center w-full">
            <div className="w-40">
              <p className="text-[0.8em] font-semibold mb-1 text-gray-800">
                Total Progress
              </p>
              {workspaceStats.isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="text-xs text-gray-500">Loading...</span>
                </div>
              ) : (
                <ProgressBar progress={progress} />
              )}
            </div>
          </div>

          {/* member */}

          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMembers(!showMembers);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showMembers
                ? "Hide Members"
                : `Show Members (${
                    membersWorkspaceQuery.data?.totalMembers || 0
                  })`}
            </button>

            {showMembers && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {membersWorkspaceQuery.isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    {/* Owner */}
                    {/* {membersWorkspaceQuery.data?.owner && (
                      <div className="mb-2 pb-2 border-b">
                        <p className="text-xs font-semibold text-gray-600">
                          Owner:
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="avatar placeholder">
                            <div className="bg-primary text-white rounded-full w-6">
                              <span className="text-xs">
                                {membersWorkspaceQuery.data.owner.username
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {membersWorkspaceQuery.data.owner.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {membersWorkspaceQuery.data.owner.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Members List */}
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Members:
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {membersWorkspaceQuery.data?.members?.map(
                        (member) =>
                          member.user && (
                            <div
                              key={member._id}
                              className="flex items-center gap-2"
                            >
                              <div className="avatar placeholder">
                                <div className="bg-neutral text-white rounded-full w-6">
                                  <span className="text-xs">
                                    {member.user.username
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  {member.user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.user.email}
                                </p>
                              </div>
                              <span
                                className={`badge badge-xs ${
                                  member.role === "admin"
                                    ? "badge-primary"
                                    : member.role === "member"
                                    ? "badge-secondary"
                                    : "badge-ghost"
                                }`}
                              >
                                {member.role}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* delete & detail */}
          <div className="card-actions justify-end flex flex-row items-center mt-2">
            <button
              className="btn btn-sm w-14 btn-warning text-orange-900"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workspace._id, workspace.nama);
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="loading loading-spinner loading-xs "></span>
              ) : (
                "Delete"
              )}
            </button>
            <button
              className="btn btn-primary btn-sm w-14"
              onClick={(e) => {
                e.stopPropagation();
                onDetail(workspace._id);
              }}
            >
              Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
