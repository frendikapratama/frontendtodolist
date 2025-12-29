import { useState } from "react";
import { useCollaboration } from "../../hook/useCollaboration";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate } from "react-router-dom";
import AnimatedPercentage from "../../components/ui/AnimatedPercentage";
import { useProgressProject } from "../../hook/useProgress";
import { useProject } from "../../hook/useProject";

const ProjectCard = ({
  project,
  workspaceId,
  isOwner,
  borderColor,
  badgeColor,
  badgeText,
  collaborationInfo,
  ownerInfo,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { progressByProject } = useProgressProject(project._id);
  const progress = progressByProject.data?.progress ?? 0;
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(project.nama);
  const { updateProjectMutation } = useProject();

  const handleNameEdit = (e) => {
    e.preventDefault();
    const newName = editedName.trim();
    if (!newName || newName === project.nama) {
      setIsEditing(false);
      setEditedName(project.nama);
      return;
    }

    updateProjectMutation.mutate(
      {
        projectId: project._id,
        data: {
          nama: newName,
          workspaceId: workspaceId,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: () => {
          setEditedName(project.nama);
          setIsEditing(false);
        },
      }
    );
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/project/${project._id}`);
    }
  };

  const handleStartEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditedName(project.nama);
  };

  return (
    <div
      className={`card bg-white/50 text-black shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${borderColor} relative`}
      onClick={handleCardClick}
    >
      {isOwner && onDelete && (
        <button
          className="btn btn-error btn-xs absolute top-2 right-2"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project._id, project.nama);
          }}
        >
          Delete
        </button>
      )}
      <div className="mt-2 grid grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-1">
          {isEditing ? (
            <input
              type="text"
              className="card-title text-[0.9em] bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editedName}
              autoFocus
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameEdit(e);
                else if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditedName(project.nama);
                }
              }}
            />
          ) : (
            <h4
              className="card-title text-[0.9em] cursor-pointer hover:underline"
              onClick={handleStartEdit}
            >
              {project.nama}
            </h4>
          )}
          {project.description && (
            <p className="text-[0.8em] text-gray-600 mb-2">
              {project.description}
            </p>
          )}
          <p className="text-[0.7em] text-gray-500">
            {new Date(project.createdAt).toLocaleDateString("id-ID")}
          </p>
          <div className="flex gap-2 mt-2 flex-col">
            <div
              className={`badge ${badgeColor} badge-sm font-bold text-[0.6em]`}
            >
              {badgeText}
            </div>

            {collaborationInfo && (
              <p className="text-black/60 font-semibold text-[0.8em]">
                <span className="font-medium text-gray-600">
                  Collaboration:{" "}
                </span>
                {collaborationInfo}
              </p>
            )}

            {ownerInfo && (
              <p className="text-black/60 font-semibold text-[0.8em]">
                <span className="font-medium text-gray-600">Owner: </span>
                {ownerInfo}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-end justify-center flex-col">
          <h5 className="text-[0.8em] font-semibold text-gray-700">
            Total Progress
          </h5>
          {progressByProject.isLoading ? (
            <span className="text-[0.7em] text-gray-400">Loading...</span>
          ) : (
            <AnimatedPercentage target={progress} />
          )}
        </div>
      </div>
    </div>
  );
};

const CollaborationTab = ({ workspaceId, currentKuarterId }) => {
  const {
    useWorkspaceProjects,
    useCollaborationRequests,
    sendRequestMutation,
    approveMutation,
    rejectMutation,
  } = useCollaboration();

  const { workspacesQuery } = useWorkspace();
  const { deleteProjectMutation } = useProject();
  const projectsQuery = useWorkspaceProjects(workspaceId);
  const incomingRequests = useCollaborationRequests(
    workspaceId,
    "incoming",
    "pending"
  );
  const outgoingRequests = useCollaborationRequests(workspaceId, "outgoing");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");

  const [toDelete, setToDelete] = useState(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedWorkspace) {
      return;
    }

    sendRequestMutation.mutate({
      projectId: selectedProject,
      fromWorkspaceId: workspaceId,
      toWorkspaceId: selectedWorkspace,
    });

    setSelectedProject("");
    setSelectedWorkspace("");
    document.getElementById("sendCollabModal").close();
  };

  const handleDeleteProject = (projectId, projectName) => {
    setToDelete(projectId);
    document.getElementById("ConfirmationModal").showModal();
  };

  const availableWorkspaces = workspacesQuery.data?.filter(
    (ws) => ws._id !== workspaceId && ws.kuarterId === currentKuarterId
  );

  const ownedOnlyProjects = projectsQuery.data?.owned || [];
  const ownedWithCollaboration = projectsQuery.data?.ownedButCollaborated || [];
  const collaboratedFromOthers =
    projectsQuery.data?.collaboratedFromOthers || [];

  const handleDragStart = (e, requestId) => {
    e.dataTransfer.setData("text/plain", requestId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const requestId = e.dataTransfer.getData("text/plain");
    if (requestId) {
      approveMutation.mutate(requestId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const closeModalDelete = () => {
    document.getElementById("ConfirmationModal").close();
  };
  console.log("CollaborationTab received workspaceId:", workspaceId);
  console.log("CollaborationTab received currentKuarterId:", currentKuarterId);

  // Debug: Check what workspaces are available
  console.log("All workspaces:", workspacesQuery.data);
  console.log("Available workspaces after filter:", availableWorkspaces);
  return (
    <div className="space-y-6 h-screen">
      <dialog id="ConfirmationModal" className="modal">
        <div className="modal-box w-11/12 max-w-xl bg-white text-black rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <h3 className="font-bold text-lg">
              Are you sure want to delete this project? This action can't be
              undone.
            </h3>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-all duration-200"
              onClick={closeModalDelete}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
              onClick={() => {
                if (toDelete) {
                  deleteProjectMutation.mutate(toDelete, {
                    onSuccess: () => {
                      setToDelete(null);
                      document.getElementById("ConfirmationModal").close();
                    },
                  });
                }
              }}
              disabled={deleteProjectMutation.isLoading}
            >
              {deleteProjectMutation.isLoading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModalDelete}>close</button>
        </form>
      </dialog>

      {/* Modal for Sending Request */}
      <dialog id="sendCollabModal" className="modal">
        <div className="modal-box bg-white text-black">
          <h3 className="font-bold text-lg mb-4">
            Sending Collaboration Request
          </h3>
          <form onSubmit={handleSendRequest} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text ">Project</span>
              </label>
              <select
                className="select select-bordered w-full text-black bg-gray-300"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
              >
                <option value="">-- Choose the Project --</option>
                {[...ownedOnlyProjects, ...ownedWithCollaboration].map(
                  (project) => (
                    <option key={project._id} value={project._id}>
                      {project.nama}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Sending to department</span>
              </label>
              <select
                className="select select-bordered w-full  text-black bg-gray-300"
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                required
              >
                <option value="">-- Choose the Department --</option>
                {availableWorkspaces?.map((ws) => (
                  <option key={ws._id} value={ws._id}>
                    {ws.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendRequestMutation.isPending}
              >
                {sendRequestMutation.isPending ? "Mengirim..." : "Kirim"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  document.getElementById("sendCollabModal").close();
                  setSelectedProject("");
                  setSelectedWorkspace("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Grid with 3 sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen lg:h-screen ">
        {/* Left Column: Projects */}
        <div
          className={`col-span-1 lg:col-span-2 p-4 bg-white/40 borde-none rounded-lg overflow-y-auto ${
            isDragOver ? "border-primary border-2" : "border-base-300"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[1.1em] font-semibold text-[#EFECE3]">
              Projects
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                document.getElementById("sendCollabModal").showModal()
              }
            >
              + Sending Request
            </button>
          </div>
          {projectsQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              {/* Individual Projects */}
              <div>
                <h4 className="font-semibold mb-3 text-[0.9em] text-[#EFECE3] flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Individual division project (Without Collaboration)
                </h4>
                {ownedOnlyProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ownedOnlyProjects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        workspaceId={workspaceId}
                        isOwner={true}
                        borderColor="border-green-500"
                        badgeColor="badge-success"
                        badgeText="Owner"
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#EFECE3] text-[0.8em] italic">
                    There is no project
                  </p>
                )}
              </div>

              {/* Collaboration Projects (Owner) */}
              <div>
                <h4 className="font-semibold mb-3 text-[0.9em] text-[#EFECE3] flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Project Collaboration (You are the Owner)
                </h4>
                {ownedWithCollaboration.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ownedWithCollaboration.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        isOwner={true}
                        workspaceId={workspaceId}
                        borderColor="border-blue-500"
                        badgeColor="badge-success"
                        badgeText="Owner"
                        collaborationInfo={
                          project.otherWorkspaces?.length > 0
                            ? project.otherWorkspaces
                                .map((w) => w.nama)
                                .join(", ")
                            : null
                        }
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#EFECE3] text-[0.8em] italic">
                    There is no project for Collaboration
                  </p>
                )}
              </div>

              {/* Collaboration Projects from Others */}
              <div>
                <h4 className="font-semibold mb-3 text-[0.9em] text-[#EFECE3] flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Collaboration Project from another division.
                </h4>
                {collaboratedFromOthers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {collaboratedFromOthers.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        isOwner={false}
                        workspaceId={workspaceId}
                        borderColor="border-orange-500"
                        badgeColor="badge-warning"
                        badgeText="Collaborator"
                        ownerInfo={project.workspace?.nama}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-[#EFECE3] text-sm italic text-[0.8em]">
                    Haven't be part of other Collaboration
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Incoming (Top) and Log (Bottom) */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Incoming Requests (Top Half) */}
          <div className="flex-1 bg-white/40 p-4 border-none rounded-lg overflow-y-auto">
            <h3 className="text-[1em] font-semibold mb-4 text-[#EFECE3]">
              Incoming Requests
            </h3>
            {incomingRequests.isLoading ? (
              <p>Loading...</p>
            ) : incomingRequests.data?.length > 0 ? (
              <div className="space-y-3">
                {incomingRequests.data.map((request) => (
                  <div
                    key={request._id}
                    className="card bg-white/60 text-black border-none p-4 cursor-grab hover:shadow-md"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, request._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-[0.9em] ">
                          {request.project?.nama}
                        </h4>
                        <p className="text-[0.8em] font-medium text-gray-600">
                          From Department:{" "}
                          <span className=" text-black/60 font-semibold">
                            {request.fromWorkspace?.nama}
                          </span>
                        </p>
                        <p className="text-[0.7em] text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="badge badge-warning text-[0.7em] font-bold  badge-sm mt-2">
                          {request.status}
                        </div>
                        <p className="text-[0.8em] text-gray-400 mt-2">
                          Drag to Projects Section to Accept
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div>
                          <button
                            className="btn btn-error btn-sm text-[0.7em]"
                            onClick={() => {
                              rejectMutation.mutate(request._id);
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-[0.8em]">
                There is no Incoming Request
              </p>
            )}
          </div>

          {/* Log Requests (Bottom Half) */}
          <div className="flex-1 bg-white/40 p-4 border-none rounded-lg overflow-y-auto">
            <h3 className="text-[1em] font-semibold mb-4 text-[#EFECE3]">
              Log Requests
            </h3>
            {outgoingRequests.isLoading ? (
              <p>Loading...</p>
            ) : outgoingRequests.data?.length > 0 ? (
              <div className="space-y-3">
                {outgoingRequests.data.map((request) => (
                  <div
                    key={request._id}
                    className="card bg-white/60 text-black border border-none p-4"
                  >
                    <h4 className="font-semibold text-[0.9em]">
                      {request.project?.nama}
                    </h4>
                    <p className="text-[0.8em] font-medium text-gray-600">
                      To Division:{" "}
                      <span className="text-black/60 font-semibold">
                        {request.toWorkspace?.nama}
                      </span>
                    </p>
                    <p className="text-[0.6em] text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    <div
                      className={`badge badge-sm mt-2 text-[0.7em] font-bold ${
                        request.status === "approved"
                          ? "badge-success"
                          : request.status === "rejected"
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {request.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-[0.8em]">
                There is no Sending Request
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationTab;
