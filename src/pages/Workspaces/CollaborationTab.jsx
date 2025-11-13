import { useState } from "react";
import { useCollaboration } from "../../hook/useCollaboration";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate } from "react-router-dom";

const CollaborationTab = ({ workspaceId }) => {
  const {
    useWorkspaceProjects,
    useCollaborationRequests,
    sendRequestMutation,
    approveMutation,
    rejectMutation,
  } = useCollaboration();

  const { workspacesQuery } = useWorkspace();
  const projectsQuery = useWorkspaceProjects(workspaceId);
  const incomingRequests = useCollaborationRequests(
    workspaceId,
    "incoming",
    "pending"
  );
  const outgoingRequests = useCollaborationRequests(workspaceId, "outgoing");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState("");
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

  const availableWorkspaces = workspacesQuery.data?.filter(
    (ws) => ws._id !== workspaceId
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

  return (
    <div className="space-y-6">
      {/* Modal for Sending Request */}
      <dialog id="sendCollabModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Sending Collaboration Request</h3>
          <form onSubmit={handleSendRequest} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Project</span>
              </label>
              <select
                className="select select-bordered w-full"
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
                className="select select-bordered w-full"
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

      {/* New Layout: Grid with 3 sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen lg:h-auto">
        {/* Left Column: Projects */}
        <div
          className={`col-span-1 lg:col-span-2 bg-base-100 p-4 border rounded-lg overflow-y-auto ${isDragOver ? "border-primary border-2" : "border-base-300"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[1em] font-semibold">Projects</h3>
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
                <h4 className="font-semibold mb-3 text-[0.8em] text-gray-600 flex items-center gap-2">
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
                  Individual department project (Without Collaboration)
                </h4>
                {ownedOnlyProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ownedOnlyProjects.map((project) => (
                      <div
                        key={project._id}
                        className="card bg-base-100 shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h4 className="card-title text-[0.8em]">{project.nama}</h4>
                        {project.description && (
                          <p className="text-[0.8em] text-gray-600 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-[0.7em] text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <div className="badge badge-success badge-sm font-bold text-[0.6em]">
                            Owner
                          </div>
                          {/* <div className="badge badge-info badge-sm">
                            {project.id?.length || 0} Group
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                      <p className="text-gray-500 text-[0.8em] italic">
                    There is no project
                  </p>
                )}
              </div>

              {/* Collaboration Projects (Owner) */}
              <div>
                <h4 className="font-semibold mb-3 text-[0.8em] text-gray-600 flex items-center gap-2">
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
                      <div
                        key={project._id}
                        className="card bg-base-100 shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h4 className="card-title text-[0.8em]">{project.nama}</h4>
                        {project.description && (
                          <p className="text-[0.8em] text-gray-600 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-[0.7em] text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <div className="badge badge-success badge-sm font-bold text-[0.6em]">
                            Owner
                          </div>
                          <div className="badge badge-info badge-sm font-bold text-[0.6em]">
                            {project.otherWorkspaces?.length || 0} workspace
                          </div>
                        </div>
                        {project.otherWorkspaces?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Collaboration: </span>
                            {project.otherWorkspaces
                              .map((w) => w.nama)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                      <p className="text-gray-500 text-[0.8em] italic">
                    There is no project for Collaboration
                  </p>
                )}
              </div>

              {/* Collaboration Projects from Others */}
              <div>
                <h4 className="font-semibold mb-3 text-[0.8em] text-gray-600 flex items-center gap-2">
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
                      <div
                        key={project._id}
                        className="card bg-base-100 p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h5 className="font-semibold text-[0.8em]">
                          {project.nama}
                        </h5>
                        {project.description && (
                          <p className="text-gray-600 mb-2 text-[0.8em]">
                            {project.description}
                          </p>
                        )}
                        <p className="text-gray-500 mt-1 text-[0.8em]">
                          <span className="font-medium">Owner: </span>
                          {project.workspace?.nama}
                        </p>
                        <p className="text-gray-500 text-[0.7em]">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="badge badge-warning badge-sm mt-2 font-bold text-[0.6em]">
                          Collaborator
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                      <p className="text-gray-500 text-sm italic text-[0.8em]">
                    Haven't be part of other Collaboration
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Incoming (Top) and Sending (Bottom) */}
        <div className="col-span-1 flex flex-col gap-6">
          {/* Incoming Requests (Top Half) */}
          <div className="flex-1 bg-base-100 p-4 border rounded-lg overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Incoming Requests</h3>
            {incomingRequests.isLoading ? (
              <p>Loading...</p>
            ) : incomingRequests.data?.length > 0 ? (
              <div className="space-y-3">
                {incomingRequests.data.map((request) => (
                  <div
                    key={request._id}
                    className="card bg-base-100 border border-base-300 p-4 cursor-grab hover:shadow-md"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, request._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{request.project?.nama}</h4>
                        <p className="text-sm text-gray-600">
                          From Department: {request.fromWorkspace?.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString("id-ID")}
                        </p>
                        <div className="badge badge-warning badge-sm mt-2">
                          {request.status}
                        </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Drag to Projects to Accept
                      </p>
                      </div>
                      {request.status === "pending" && (
                        <div>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => {rejectMutation.mutate(request._id)}}
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
              <p className="text-gray-500">There is no Incoming Request</p>
            )}
          </div>

          {/* Log Requests (Bottom Half) */}
          <div className="flex-1 bg-base-100 p-4 border rounded-lg overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Log Requests</h3>
            {outgoingRequests.isLoading ? (
              <p>Loading...</p>
            ) : outgoingRequests.data?.length > 0 ? (
              <div className="space-y-3">
                {outgoingRequests.data.map((request) => (
                  <div
                    key={request._id}
                    className="card bg-base-100 border border-base-300 p-4"
                  >
                    <h4 className="font-semibold">{request.project?.nama}</h4>
                    <p className="text-sm text-gray-600">
                      ke: {request.toWorkspace?.nama}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString("id-ID")}
                    </p>
                    <div
                      className={`badge badge-sm mt-2 ${request.status === "approved"
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
              <p className="text-gray-500">There is no Sending Request</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationTab;
