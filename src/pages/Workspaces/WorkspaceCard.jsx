import React, { useState } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import { useWorkspaceStats } from "../../hook/useProgress";

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
    deleteMutation
}) => {
    const { workspaceStats } = useWorkspaceStats(workspace._id);
    const progress = workspaceStats.data?.progress ?? 0;

    console.log(`Progress for ${workspace.nama}:`, {
        loading: workspaceStats.isLoading,
        progress: progress,
        rawData: workspaceStats.data
    });

    return (
        <div
            className={`card text-black bg-white/40 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${isSelected ? "ring-2 ring-blue-500" : ""
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