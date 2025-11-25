import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hook/useWorkspace";
import { useEffect, useState, useContext } from "react";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CollaborationTab from "./CollaborationTab";
import WorkspaceChat from "../../components/WorkspaceChat";

const WorkspaceDetailPage = () => {
  const { WorkspaceDetail, addProjectMutation } = useWorkspace();
  const { id } = useParams();
  const workspaceQuery = WorkspaceDetail(id);
  const { data, isLoading, isError } = workspaceQuery;
  const [projectName, setProjectName] = useState("");
  const { setSelectedWorkspaceId } = useSelectedWorkspace();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (id) {
      setSelectedWorkspaceId(id);
    }
  }, [id, setSelectedWorkspaceId]);

  useEffect(() => {
    if (data && user) {
      // Cek apakah user adalah owner
      const isOwner = data.owner?._id === user._id || data.owner === user._id;

      // Cek apakah user ada di members array
      const isMemberOfWorkspace = data.members?.some(
        (member) =>
          member.user?._id === user._id ||
          member.user === user._id ||
          member._id === user._id
      );

      setIsMember(isOwner || isMemberOfWorkspace);
    }
  }, [data, user]);

  const handleAddProject = (e) => {
    e.preventDefault();
    addProjectMutation.mutate({
      workspaceId: id,
      data: { nama: projectName },
    });
    setProjectName("");
    document.getElementById("addProjectModal").close();
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Gagal memuat data</p>;

  return (
    <>
      <dialog id="addProjectModal" className="modal">
        <div className="modal-box bg-white text-black">
          <h3 className="font-bold text-lg mb-4">Add Project</h3>
          <form onSubmit={handleAddProject}>
            <input
              type="text"
              placeholder="Nama Project"
              className="input input-bordered w-full bg-gray-300 text-black"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  document.getElementById("addProjectModal").close()
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <div className="card p-3">
        <div className="flex flex-row justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[0.8em] text-white hover:text-blue-300 active:text-blue-400 font-semibold transition-colors duration-200"
          >
            ← Back
          </button>
          <h2 className="card-title text-white font-bold text-[1.3em]">
            Workspace {data.nama} Division
          </h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              document.getElementById("addProjectModal").showModal()
            }
          >
            Add Project
          </button>
        </div>

        <CollaborationTab workspaceId={id} />

        {isMember && user && token && (
          <WorkspaceChat workspaceId={id} currentUser={user} token={token} />
        )}
      </div>
    </>
  );
};

export default WorkspaceDetailPage;
