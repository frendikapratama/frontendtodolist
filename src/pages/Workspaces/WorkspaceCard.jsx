import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ProgressBar from "../../components/ui/ProgressBar";
import { useWorkspaceStats } from "../../hook/useProgress";
import { useMember } from "../../hook/useMember";

const WorkspaceCard = ({
  workspace,
  isSelected,
  onCardClick,
  onDelete,
  onDetail,
  deleteMutation,
}) => {
  const { workspaceStats } = useWorkspaceStats(workspace._id);
  const progress = workspaceStats.data?.progress ?? 0;
  const { membersWorkspaceQuery } = useMember("workspace", workspace._id);

  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const members = membersWorkspaceQuery.data?.members || [];
  const maxVisible = 5;
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  const colors = [
    "bg-gradient-to-br from-violet-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-cyan-500",
    "bg-gradient-to-br from-emerald-500 to-teal-500",
    "bg-gradient-to-br from-orange-500 to-amber-500",
    "bg-gradient-to-br from-pink-500 to-rose-500",
  ];

  const roleColors = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    member: "bg-blue-100 text-blue-700 border-blue-200",
    viewer: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const handleAvatarClick = (member, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setSelectedMember(selectedMember?._id === member._id ? null : member);
  };

  const handleShowAll = (e) => {
    e.stopPropagation();
    setSelectedMember({ showAll: true });
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPos({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
  };

  useEffect(() => {
    const handleClickOutside = () => setSelectedMember(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Popover component untuk single member
  const SingleMemberPopover = () =>
    selectedMember &&
    !selectedMember.showAll &&
    createPortal(
      <div
        className="fixed bg-white rounded-xl shadow-2xl p-4 min-w-52 border border-gray-100 z-50"
        style={{
          left: `${popoverPos.x}px`,
          top: `${popoverPos.y}px`,
          transform: "translateX(-50%)",
          animation: "fadeSlideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 
          w-4 h-4 bg-white rotate-45 rounded-sm border-l border-t border-gray-100"
        />

        <div className="relative flex items-center gap-3">
          <div
            className={`
            w-11 h-11 rounded-full ${
              colors[
                visibleMembers.findIndex((m) => m._id === selectedMember._id) %
                  colors.length
              ]
            }
            flex items-center justify-center text-white font-bold text-lg
          `}
          >
            {selectedMember.user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {selectedMember.user.username}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {selectedMember.user.email}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              roleColors[selectedMember.role] || roleColors.viewer
            }`}
          >
            {selectedMember.role?.charAt(0).toUpperCase() +
              selectedMember.role?.slice(1)}
          </span>
        </div>
      </div>,
      document.body
    );

  // Popover component untuk all members
  const AllMembersPopover = () =>
    selectedMember?.showAll &&
    createPortal(
      <div
        className="fixed bg-white rounded-xl shadow-2xl p-4 w-64 border border-gray-100 z-50"
        style={{
          left: `${popoverPos.x}px`,
          top: `${popoverPos.y}px`,
          transform: "translateX(-50%)",
          animation: "fadeSlideIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 
          w-4 h-4 bg-white rotate-45 rounded-sm border-l border-t border-gray-100"
        />

        <h4 className="font-semibold text-gray-900 mb-3 relative">
          All Members ({members.length})
        </h4>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {members.map(
            (member, index) =>
              member.user && (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 
                  transition-colors duration-150"
                >
                  <div
                    className={`
                  w-8 h-8 rounded-full ${colors[index % colors.length]}
                  flex items-center justify-center text-white font-semibold text-sm
                `}
                  >
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {member.user.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      roleColors[member.role] || roleColors.viewer
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              )
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div
        className={`card text-black bg-white/40 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onCardClick(workspace)}
      >
        <div className="card-body">
          <h2 className="card-title text-black/90">{workspace.nama}</h2>

          <div className="flex justify-between items-start">
            {/* Progress Section */}
            <div className="flex mt-2 items-center">
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

            {/* Member Avatar Stack */}
            <div className="mt-2 relative z-20" ref={containerRef}>
              <p className="text-[0.8em] font-semibold mb-2 text-gray-800">
                Members ({membersWorkspaceQuery.data?.totalMembers || 0})
              </p>

              {membersWorkspaceQuery.isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <div className="relative">
                  <div className="flex items-center">
                    {visibleMembers.map(
                      (member, index) =>
                        member.user && (
                          <div
                            key={member._id}
                            className="relative group"
                            style={{
                              marginLeft: index === 0 ? 0 : "-10px",
                            }}
                          >
                            <button
                              onClick={(e) => handleAvatarClick(member, e)}
                              className={`
                              w-9 h-9 rounded-full ${
                                colors[index % colors.length]
                              }
                              flex items-center justify-center text-white font-semibold text-sm
                              ring-2 ring-white shadow-md
                              transform transition-all duration-300 ease-out
                              hover:scale-110 hover:-translate-y-1 
                              hover:ring-2 hover:ring-blue-400
                              ${
                                selectedMember?._id === member._id
                                  ? "scale-110 -translate-y-1 ring-2 ring-blue-400"
                                  : ""
                              }
                            `}
                            >
                              {member.user.username.charAt(0).toUpperCase()}
                            </button>

                            {/* Hover tooltip */}
                            <div
                              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                            bg-gray-900 text-white text-xs rounded-md whitespace-nowrap
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            pointer-events-none shadow-lg "
                            >
                              {member.user.username}
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 
                              border-4 border-transparent border-t-gray-900"
                              />
                            </div>
                          </div>
                        )
                    )}

                    {remainingCount > 0 && (
                      <button
                        onClick={handleShowAll}
                        className="
                          w-9 h-9 rounded-full bg-gray-600
                          flex items-center justify-center text-white font-semibold text-xs
                          ring-2 ring-white shadow-md
                          transform transition-all duration-300 ease-out
                          hover:scale-110 hover:-translate-y-1 hover:bg-gray-500
                        "
                        style={{ marginLeft: "-10px" }}
                      >
                        +{remainingCount}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete & Detail buttons */}
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
                  <span className="loading loading-spinner loading-xs"></span>
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

        <style>{`
          @keyframes fadeSlideIn {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}</style>
      </div>

      {/* Render popovers di luar card */}
      <SingleMemberPopover />
      <AllMembersPopover />
    </>
  );
};

export default WorkspaceCard;
