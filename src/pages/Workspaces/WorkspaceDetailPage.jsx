import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hook/useWorkspace";
import { useMember } from "../../hook/useMember";
import { useEffect, useState, useContext } from "react";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CollaborationTab from "./CollaborationTab";
import WorkspaceChat from "../../components/WorkspaceChat";
import NotificationBell from "../../components/ui/NotificationBell";
import { UserPlus } from "lucide-react";

const WorkspaceDetailPage = () => {
  const { WorkspaceDetail, addProjectMutation } = useWorkspace();
  const { id } = useParams();
  const { inviteMemberMutation } = useMember("workspace", id);
  const workspaceQuery = WorkspaceDetail(id);
  const { data, isLoading, isError } = workspaceQuery;

  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const { setSelectedWorkspaceId } = useSelectedWorkspace();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [isMember, setIsMember] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (id) {
      setSelectedWorkspaceId(id);
    }
  }, [id, setSelectedWorkspaceId]);

  useEffect(() => {
    if (data && user) {
      const isOwner = data.owner?._id === user._id || data.owner === user._id;
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

  const handleInviteMember = (e) => {
    e.preventDefault();
    inviteMemberMutation.mutate(
      {
        workspaceId: id,
        data: {
          email: inviteEmail,
          role: inviteRole,
        },
      },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteRole("member");
          document.getElementById("inviteMemberModal").close();
          alert("Member invited successfully!");
        },
        onError: (error) => {
          alert(`Failed to invite member: ${error.message}`);
        },
      }
    );
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Gagal memuat data</div>;

  return (
    <>
      {/* Add Project Modal */}
      <dialog id="addProjectModal" className="modal">
        <div className="modal-box bg-white text-black">
          <NotificationBell />
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

      {/* Invite Member Modal */}
      <dialog id="inviteMemberModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Invite Member</h3>
          <form onSubmit={handleInviteMember}>
            <div className="form-control mt-4">
              <label className="label pb-2">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="member@example.com"
                className="input input-bordered w-full"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control mt-4">
              <label className="label pb-2">
                <span className="label-text">Role</span>
              </label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={inviteRole === "admin"}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="radio radio-primary"
                  />
                  <span>Admin</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="project_manager"
                    checked={inviteRole === "project_manager"}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="radio radio-primary"
                  />
                  <span>Project Manager</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="member"
                    checked={inviteRole === "member"}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="radio radio-primary"
                  />
                  <span>Member</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={inviteRole === "viewer"}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="radio radio-primary"
                  />
                  <span>Viewer</span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending ? "Inviting..." : "Invite"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  document.getElementById("inviteMemberModal").close();
                  setInviteEmail("");
                  setInviteRole("member");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Chat Component */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 z-50">
          <WorkspaceChat workspaceId={id} onClose={toggleChat} />
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-[0.8em] text-white hover:text-blue-300 active:text-blue-400 font-semibold transition-colors duration-200"
        >
          ← Back
        </button>

        <div className="flex justify-between items-center mt-4">
          <h1 className="text-2xl font-bold">Workspace {data.nama} Division</h1>
          <div className="flex gap-2">
            <button
              onClick={() =>
                document.getElementById("inviteMemberModal").showModal()
              }
              className="p-2 rounded-full hover:bg-gray-200 transition-colors 
             flex items-center justify-center hover:text-black text-white cursor-pointer"
            >
              <UserPlus size={24} />
            </button>

            <NotificationBell />

            <button
              className="btn btn-primary btn-sm"
              onClick={() =>
                document.getElementById("addProjectModal").showModal()
              }
            >
              Add Project
            </button>
          </div>
        </div>

        {/* Chat Button */}
        {isMember && user && token && (
          <button
            onClick={toggleChat}
            className="fixed bottom-4 right-4 z-40"
            style={{
              background: "linear-gradient(135deg, #0D1164 0%, #211832 100%)",
              padding: "12px 24px",
              borderRadius: "8px",
              color: "white",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #0D1164)";
              if (!isChatOpen) {
                e.currentTarget.style.transform = "translateY(-3px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #0D1164 0%, #211832 100%)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Chat ▼
          </button>
        )}

        {isChatOpen && (
          <div className="fixed bottom-20 right-4 z-40">
            <WorkspaceChat workspaceId={id} onClose={toggleChat} />
          </div>
        )}

        <CollaborationTab />
      </div>
    </>
  );
};

export default WorkspaceDetailPage;
