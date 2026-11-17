import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { createPortal } from "react-dom";
import { Trash } from "lucide-react";
import ProgressBar from "../../components/ui/ProgressBar";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useWorkspaceStats } from "../../hook/useProgress";
import { useMember } from "../../hook/useMember";
import { AuthContext } from "../../context/AuthContext";
import { Trash2 } from "lucide-react";
import { Info } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return `${API_BASE_URL}/uploads/users/${photoPath}`;
};

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

const MemberAvatar = ({ member, index = 0, size = "md", className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const photoUrl = member.user?.photo ? getPhotoUrl(member.user.photo) : null;
  const shouldShowImage = photoUrl && !imageError;
  const fallbackImage = "https://placehold.co/400";

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full overflow-hidden shrink-0
        ${!shouldShowImage ? colors[index % colors.length] : ""}
        flex items-center justify-center text-white font-semibold
        ${className}
      `}
    >
      {shouldShowImage ? (
        <img
          src={photoUrl}
          alt={member.user?.username || "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            setImageError(true);
            if (e.target.src !== fallbackImage) {
              e.target.src = fallbackImage;
            }
          }}
        />
      ) : (
        <span>{member.user?.username?.charAt(0).toUpperCase() || "?"}</span>
      )}
    </div>
  );
};

const WorkspaceCard = ({
  workspace,
  isSelected,
  onCardClick,
  onDetail,
  deleteMutation,
}) => {
  const { workspaceStats } = useWorkspaceStats(workspace._id);
  const progress = workspaceStats.data?.progress ?? 0;

  const { membersWorkspaceQuery, removeMemberMutation } = useMember(
    "workspace",
    workspace._id,
  );

  const { user } = useContext(AuthContext);
  const isAdmin = user?.isSystemAdmin === true;

  const [selectedMember, setSelectedMember] = useState(null);
  const [popoverPos, setPopoverPos] = useState({
    x: 0,
    y: 0,
    placement: "bottom",
    maxHeight: 0,
  });

  const containerRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    workspacesId: null,
  });
  const [confirmDeleteMember, setConfirmDeleteMember] = useState({
    show: false,
    memberId: null,
    userId: null,
    username: null,
  });

  const members = membersWorkspaceQuery.data?.members || [];
  const maxVisible = 5;
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = members.length - maxVisible;

  const handleDelete = useCallback((workspacesId) => {
    setConfirmDelete({ show: true, workspacesId });
  }, []);

  const confirmDeleteWorkspace = useCallback(() => {
    if (confirmDelete.workspacesId) {
      deleteMutation.mutate(confirmDelete.workspacesId);
      setConfirmDelete({ show: false, workspacesId: null });
    }
  }, [confirmDelete.workspacesId, deleteMutation]);

  const getPopoverPosition = (element, preferredHeight) => {
    const rect = element.getBoundingClientRect();
    const halfWidth = Math.min(128, (window.innerWidth - 16) / 2);
    const x = Math.max(
      halfWidth + 8,
      Math.min(rect.left + rect.width / 2, window.innerWidth - halfWidth - 8),
    );
    const spaceAbove = Math.max(0, rect.top - 16);
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - 16);
    const placement =
      spaceBelow >= preferredHeight || spaceBelow >= spaceAbove
        ? "bottom"
        : "top";

    return {
      x,
      // Perbaikan perhitungan posisi y agar akurat dan tidak terlalu jauh
      y: placement === "bottom" ? rect.bottom + 6 : rect.top - 6,
      placement,
      maxHeight: placement === "bottom" ? spaceBelow : spaceAbove,
    };
  };

  const handleAvatarClick = (member, e) => {
    e.stopPropagation();
    setPopoverPos(getPopoverPosition(e.currentTarget, 200));
    setSelectedMember(selectedMember?._id === member._id ? null : member);
  };

  const handleShowAll = (e) => {
    e.stopPropagation();
    setSelectedMember({ showAll: true });
    setPopoverPos(getPopoverPosition(e.currentTarget, 360));
  };

  const handleRemoveMemberClick = (memberId, userId, username) => {
    setConfirmDeleteMember({
      show: true,
      memberId,
      userId,
      username,
    });
  };

  const confirmRemoveMember = async () => {
    try {
      await removeMemberMutation.mutateAsync({
        workspaceId: workspace._id,
        userId: confirmDeleteMember.userId,
      });
      setSelectedMember(null);
      setConfirmDeleteMember({
        show: false,
        memberId: null,
        userId: null,
        username: null,
      });
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setSelectedMember(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <div
        className={`card w-full min-w-0 text-black bg-white/40 shadow-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onCardClick(workspace)}
      >
        <div className="card-body gap-3.5 p-4 sm:p-5">
          {/* BARIS PERTAMA: Title dan Tombol Aksi */}
          <div className="flex items-center justify-between gap-4">
            <h2 className="card-title min-w-0 wrap-break-word text-black/90 text-base sm:text-lg font-bold m-0 leading-snug">
              {workspace.nama}
            </h2>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-xs sm:btn-sm btn-error text-slate-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(workspace._id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-xs sm:btn-sm text-amber-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onDetail(workspace._id);
                }}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BARIS KEDUA: Progress Bar */}
          <div className="w-full flex flex-col justify-center">
            <span className="text-[0.75em] font-semibold text-gray-700 mb-1">
              Total Progress
            </span>
            {workspaceStats.isLoading ? (
              <div className="flex items-center gap-2 py-0.5">
                <span className="loading loading-spinner loading-xs"></span>
                <span className="text-xs text-gray-500">Loading...</span>
              </div>
            ) : (
              <ProgressBar progress={progress} />
            )}
          </div>

          {/* BARIS KETIGA: Member (Label dan Avatar Berjajar Rapi) */}
          <div
            className="w-full flex items-center justify-between pt-1"
            ref={containerRef}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[0.75em] font-semibold text-gray-700">
              Members ({membersWorkspaceQuery.data?.totalMembers || 0})
            </span>

            {membersWorkspaceQuery.isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <div className="flex items-center">
                {visibleMembers.map(
                  (member, index) =>
                    member.user && (
                      <div
                        key={member._id}
                        className="relative group shrink-0"
                        style={{
                          marginLeft: index === 0 ? 0 : "-8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleAvatarClick(member, e)}
                          className={`
                            transform transition-all duration-200 ease-out
                            hover:scale-110 hover:-translate-y-0.5 
                            ring-2 ring-white shadow-sm
                            rounded-full focus:outline-none
                            ${
                              selectedMember?._id === member._id
                                ? "scale-110 -translate-y-0.5 ring-2 ring-blue-400 z-10"
                                : ""
                            }
                          `}
                        >
                          <MemberAvatar
                            member={member}
                            index={index}
                            size="md"
                          />
                        </button>

                        {/* Hover Tooltip */}
                        <div
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 
                          bg-gray-900 text-white text-[10px] rounded whitespace-nowrap
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          pointer-events-none shadow-md z-30"
                        >
                          {member.user.username}
                        </div>
                      </div>
                    ),
                )}

                {remainingCount > 0 && (
                  <button
                    type="button"
                    onClick={handleShowAll}
                    className="
                      w-8 h-8 rounded-full bg-gray-600
                      flex items-center justify-center text-white font-semibold text-[10px]
                      ring-2 ring-white shadow-sm shrink-0
                      transform transition-all duration-200 ease-out
                      hover:scale-110 hover:bg-gray-500 focus:outline-none
                    "
                    style={{ marginLeft: "-8px" }}
                  >
                    +{remainingCount}
                  </button>
                )}
              </div>
            )}
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

      {/* Single Member Popover */}
      {selectedMember &&
        !selectedMember.showAll &&
        createPortal(
          <div
            className="fixed w-64 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl p-3.5 border border-gray-100 z-50"
            style={{
              left: `${popoverPos.x}px`,
              top:
                popoverPos.placement === "bottom"
                  ? `${popoverPos.y}px`
                  : "auto",
              bottom:
                popoverPos.placement === "top"
                  ? `${window.innerHeight - popoverPos.y}px`
                  : "auto",
              transform: "translateX(-50%)",
              animation: "fadeSlideIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center gap-2.5">
              <MemberAvatar
                member={selectedMember}
                index={visibleMembers.findIndex(
                  (m) => m._id === selectedMember._id,
                )}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {selectedMember.user.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {selectedMember.user.email}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2.5 mt-2.5 border-t border-gray-100">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium border ${roleColors[selectedMember.role] || roleColors.viewer}`}
              >
                {selectedMember.role}
              </span>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveMemberClick(
                      selectedMember._id,
                      selectedMember.user._id,
                      selectedMember.user.username,
                    )
                  }
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Remove member"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* All Members Popover */}
      {selectedMember?.showAll &&
        createPortal(
          <div
            className="fixed w-64 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-2xl p-3.5 border border-gray-100 z-50"
            style={{
              left: `${popoverPos.x}px`,
              top:
                popoverPos.placement === "bottom"
                  ? `${popoverPos.y}px`
                  : "auto",
              bottom:
                popoverPos.placement === "top"
                  ? `${window.innerHeight - popoverPos.y}px`
                  : "auto",
              transform: "translateX(-50%)",
              animation: "fadeSlideIn 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold text-gray-900 text-xs mb-2.5">
              All Members ({members.length})
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {members.map(
                (member, index) =>
                  member.user && (
                    <div
                      key={member._id}
                      className="p-2 rounded-lg border border-gray-100 bg-white flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MemberAvatar member={member} index={index} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {member.user.username}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium border uppercase ${roleColors[member.role] || roleColors.viewer}`}
                        >
                          {member.role}
                        </span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMemberClick(
                                member._id,
                                member.user._id,
                                member.user.username,
                              )
                            }
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Hapus"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Konfirmasi Dialog */}
      <ConfirmDialog
        show={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, workspacesId: null })}
        onConfirm={confirmDeleteWorkspace}
        title="Delete Division"
        message="Are you sure want to delete this Division? this action can't be undo"
      />

      <ConfirmDialog
        show={confirmDeleteMember.show}
        onClose={() =>
          setConfirmDeleteMember({
            show: false,
            memberId: null,
            userId: null,
            username: null,
          })
        }
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirmDeleteMember.username || "this member"} from the workspace? This action cannot be undone.`}
      />
    </>
  );
};

export default WorkspaceCard;
