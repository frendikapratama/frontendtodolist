import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hook/useWorkspace";
import { useMember } from "../../hook/useMember";
import { useEffect, useState, useContext } from "react";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NewCollaborationTab from "./NewCollaborationTab";
import CollaborationTab from "./CollaborationTab";
import NotificationBell from "../../components/ui/NotificationBell";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { PROJECT_STATUS_OPTIONS } from "../../config/option";

const initialProjectForm = {
  nama: "",
  startedAt: "",
  dueDate: "",
  status: "draft",
};

const WorkspaceDetailPage = () => {
  const { WorkspaceDetail, addProjectMutation } = useWorkspace();
  const { id } = useParams();
  const { inviteMemberMutation } = useMember("workspace", id);
  const workspaceQuery = WorkspaceDetail(id);
  const { data, isLoading, isError } = workspaceQuery;

  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

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
      const isOwner = data.owner?._id === user._id || data.owner === user._id;
      const isMemberOfWorkspace = data.members?.some(
        (member) =>
          member.user?._id === user._id ||
          member.user === user._id ||
          member._id === user._id,
      );
      setIsMember(isOwner || isMemberOfWorkspace);
    }
  }, [data, user]);

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    addProjectMutation.mutate(
      {
        workspaceId: id,
        data: projectForm,
      },
      {
        onSuccess: () => {
          setProjectForm(initialProjectForm);
          document.getElementById("addProjectModal").close();
        },
      },
    );
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
          toast.success("Member's Invited!");
        },
        onError: (error) => {
          const message =
            error.response?.data?.message || "Failed to invite member";
          toast.error(message);
        },
      },
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Gagal memuat data</div>;

  return (
    <>
      <dialog id="addProjectModal" className="modal">
        <div className="modal-box bg-white text-gray-800">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Add Project</h3>
          <form onSubmit={handleAddProject}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Nama Project</span>
              </label>
              <input
                type="text"
                name="nama"
                placeholder="Nama Project"
                className="input input-bordered w-full bg-gray-300 text-black"
                value={projectForm.nama}
                onChange={handleProjectFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Started Date</span>
                </label>
                <input
                  type="date"
                  name="startedAt"
                  className="input input-bordered w-full bg-gray-300 text-black"
                  value={projectForm.startedAt}
                  onChange={handleProjectFormChange}
                />
              </div>

              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Due Date</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  className="input input-bordered w-full bg-gray-300 text-black"
                  value={projectForm.dueDate}
                  onChange={handleProjectFormChange}
                />
              </div>
            </div>

            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                name="status"
                className="text-black p-2 bg-gray-300 rounded-sm w-full capitalize"
                value={projectForm.status}
                onChange={handleProjectFormChange}
              >
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.trim()}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={addProjectMutation.isPending}
              >
                {addProjectMutation.isPending ? "Menyimpan..." : "Save"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setProjectForm(initialProjectForm);
                  document.getElementById("addProjectModal").close();
                }}
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
