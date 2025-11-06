import { useState } from "react";
import { useCollaboration } from "../../hook/useCollaboration";
import { useWorkspace } from "../../hook/useWorkspace";
import { useNavigate } from "react-router-dom";

const CollaborationTab = ({ workspaceId }) => {
  const [activeTab, setActiveTab] = useState("projects");
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

  return (
    <div className="space-y-6">
      <dialog id="sendCollabModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Kirim Request Kolaborasi</h3>
          <form onSubmit={handleSendRequest} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Pilih Project</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                required
              >
                <option value="">-- Pilih Project --</option>
                {/* Gabungkan owned dan ownedButCollaborated untuk dropdown */}
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
                <span className="label-text">Kirim ke Workspace</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                required
              >
                <option value="">-- Pilih Workspace --</option>
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
                Batal
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-200">
        <a
          className={`tab ${activeTab === "projects" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </a>
        <a
          className={`tab ${activeTab === "incoming" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("incoming")}
        >
          Request Masuk
          {incomingRequests.data?.length > 0 && (
            <span className="badge badge-primary badge-sm ml-2">
              {incomingRequests.data.length}
            </span>
          )}
        </a>
        <a
          className={`tab ${activeTab === "outgoing" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("outgoing")}
        >
          Request Keluar
        </a>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Daftar Project</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                document.getElementById("sendCollabModal").showModal()
              }
            >
              + Kirim Request
            </button>
          </div>

          {projectsQuery.isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-600 flex items-center gap-2">
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
                  Project Pribadi (Tanpa Kolaborasi)
                </h4>
                {ownedOnlyProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ownedOnlyProjects.map((project) => (
                      <div
                        key={project._id}
                        className="card bg-base-100 shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h4 className="card-title text-lg">{project.nama}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <div className="badge badge-success badge-sm">
                            Owner
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Belum ada project pribadi
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-600 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Project dengan Kolaborasi (Anda sebagai Owner)
                </h4>
                {ownedWithCollaboration.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ownedWithCollaboration.map((project) => (
                      <div
                        key={project._id}
                        className="card bg-base-100 shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h4 className="card-title text-lg">{project.nama}</h4>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <div className="badge badge-success badge-sm">
                            Owner
                          </div>
                          <div className="badge badge-info badge-sm">
                            {project.otherWorkspaces?.length || 0} workspace
                          </div>
                        </div>
                        {/* Tampilkan nama workspace kolaborator */}
                        {project.otherWorkspaces?.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Kolaborator: </span>
                            {project.otherWorkspaces
                              .map((w) => w.nama)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Belum ada project yang dikolaborasikan
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-sm text-gray-600 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Project Kolaborasi dari Workspace Lain
                </h4>
                {collaboratedFromOthers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {collaboratedFromOthers.map((project) => (
                      <div
                        key={project._id}
                        className="card bg-base-100 border border-orange-300 p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <h5 className="font-semibold text-lg">
                          {project.nama}
                        </h5>
                        {project.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {project.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Owner: </span>
                          {project.workspace?.nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(project.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                        <div className="badge badge-warning badge-sm mt-2">
                          Collaborator
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    Belum menjadi collaborator di project manapun
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "incoming" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Request Kolaborasi Masuk
          </h3>
          {incomingRequests.isLoading ? (
            <p>Loading...</p>
          ) : incomingRequests.data?.length > 0 ? (
            <div className="space-y-3">
              {incomingRequests.data.map((request) => (
                <div
                  key={request._id}
                  className="card bg-base-100 border border-base-300 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{request.project?.nama}</h4>
                      <p className="text-sm text-gray-600">
                        dari: {request.fromWorkspace?.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                      <div className="badge badge-warning badge-sm mt-2">
                        {request.status}
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => approveMutation.mutate(request._id)}
                          disabled={approveMutation.isPending}
                        >
                          Terima
                        </button>
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => rejectMutation.mutate(request._id)}
                          disabled={rejectMutation.isPending}
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada request masuk</p>
          )}
        </div>
      )}

      {activeTab === "outgoing" && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Request Kolaborasi Keluar
          </h3>
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
                    className={`badge badge-sm mt-2 ${
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
            <p className="text-gray-500">Tidak ada request keluar</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaborationTab;
