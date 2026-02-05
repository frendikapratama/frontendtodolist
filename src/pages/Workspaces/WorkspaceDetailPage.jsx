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
import toast from "react-hot-toast";

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
          // alert("Member invited successfully!");
          toast.success("Member's Invited!");
        },
        onError: (error) => {
          const message = error.response?.data?.message || "Failed to invite member"
          toast.error(message)
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
      {/* Invite Member Modal */}
      <dialog id="inviteMemberModal" className="modal">
        <div className="modal-box max-w-2xl w-full">
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
              <div className="flex gap-5">
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
                    value="management"
                    checked={inviteRole === "management"}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="radio radio-primary"
                  />
                  <span>Management</span>
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
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(5px)",
            zIndex: 999,
            transition: "opacity 0.3s ease",
          }}
          onClick={toggleChat}
        />
      )}

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
          <div className="flex flex-row gap-2 items-center">
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
        <CollaborationTab workspaceId={id} currentKuarterId={data?.kuarterId} />
      </div>
      {isMember && user && token && (
        <div
          style={{
            position: "fixed",
            bottom: "2.5rem",
            right: "2rem",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "relative",
              width: isChatOpen ? "380px" : "auto",
              height: isChatOpen ? "550px" : "auto",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: isChatOpen ? "-40px" : "0",
                right: isChatOpen ? "9px" : "0",
                background: "linear-gradient(135deg, #6366F1)",
                color: "white",
                padding: "0.6rem 1.5rem",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 -2px 8px rgba(37, 99, 235, 0.2)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: isChatOpen
                  ? "none"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px 12px 0 0",
                zIndex: 1,
              }}
              onClick={toggleChat}
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
              <span>Chat</span>
              <span
                style={{
                  fontSize: "10px",
                  transition: "transform 0.3s ease",
                  transform: isChatOpen ? "rotate(0deg)" : "rotate(180deg)",
                }}
              >
                ▼
              </span>
            </div>

            {/* Expanded Chat Panel */}
            {isChatOpen && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "12px",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  animation: "slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <WorkspaceChat
                    workspaceId={id}
                    currentUser={user}
                    token={token}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default WorkspaceDetailPage;
