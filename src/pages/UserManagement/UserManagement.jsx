import React, { useState, useEffect } from "react";
import { useUsersState, useDebounce } from "../../hook/useUsers";
import { DEPARTEMEN_DIVISI } from "../../config/departemenDivisi";
import { getWorkspaces } from "../../services/workspace";
import { 
  addUserToWorkspace, 
  removeUserFromWorkspace, 
  updateUserWorkspaceRole,
  getUserById
} from "../../services/userServices";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Briefcase, 
  X, 
  UserPlus, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, Eye, EyeOff
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function UserManagement() {
  const {
    formData,
    setFormData,
    filters,
    setFilters,
    userQuery,
    mutation,
    deleteMutation,
    resetForm
  } = useUsersState();
  
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showPassword, setShowPassword] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (debouncedSearch === filters.search) return;

    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
  }, [debouncedSearch]);

  const { data: usersData, isLoading: isUsersLoading, refetch } = userQuery;
  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 1;
  const currentPage = filters.page || 1;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [workspaceUser, setWorkspaceUser] = useState(null);
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [isWorkspacesLoading, setIsWorkspacesLoading] = useState(false);
  const [newWorkspaceId, setNewWorkspaceId] = useState("");
  const [newWorkspaceRole, setNewWorkspaceRole] = useState("member");
  const [userWorkspacesList, setUserWorkspacesList] = useState([]);

  const selectedDepartemen = DEPARTEMEN_DIVISI.find(
    (d) => d.departemenId === formData.departemen
  );
  const availableDivisi = selectedDepartemen ? selectedDepartemen.divisi : [];

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        const wsList = response?.data || response || [];
        setAllWorkspaces(Array.isArray(wsList) ? wsList : []);
      } catch (err) {
        console.error("Failed to load workspaces:", err);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      username: user.username || "",
      email: user.email || "",
      password: "", 
      noHp: user.noHp || "",
      departemen: user.departemen || "",
      divisi: user.divisi || "",
      isSystemAdmin: user.isSystemAdmin || false
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

   

    if (!isEditMode && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    const payload = { ...formData };
    if (isEditMode && !payload.password) {
      delete payload.password;
    }

    mutation.mutate(
      { id: selectedUserId, data: payload, isEdit: isEditMode },
      {
        onSuccess: () => {
          setIsFormModalOpen(false);
          resetForm();
        }
      }
    );
  };

const handleOpenDeleteConfirm = (user) => {
  setUserToDelete(user);
  setIsConfirmOpen(true);
  console.log("isConfirmOpen set to true");
};

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete._id, {
        onSuccess: () => {
          setIsConfirmOpen(false);
          setUserToDelete(null);
        }
      });
    }
  };

  const handleOpenWorkspaceModal = async (user) => {
    setWorkspaceUser(user);
    setIsWorkspaceModalOpen(true);
    setIsWorkspacesLoading(true);
    setNewWorkspaceId("");
    setNewWorkspaceRole("member");
    
    try {
      const response = await getUserById(user._id);
      if (response?.success && response?.data) {
        setUserWorkspacesList(response.data.workspaces || []);
      }
    } catch (err) {
      toast.error("Failed to load user workspaces");
    } finally {
      setIsWorkspacesLoading(false);
    }
  };

  const handleAddUserWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceId) {
      toast.error("Please select a workspace");
      return;
    }

    try {
      const res = await addUserToWorkspace(workspaceUser._id, newWorkspaceId, newWorkspaceRole);
      if (res.success) {
        toast.success("User added to workspace successfully");
        handleOpenWorkspaceModal(workspaceUser);
        refetch();
      } else {
        toast.error(res.message || "Failed to add user to workspace");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user to workspace");
    }
  };

  const handleRemoveUserWorkspace = async (workspaceId) => {
    try {
      const res = await removeUserFromWorkspace(workspaceUser._id, workspaceId);
      if (res.success) {
        toast.success("User removed from workspace successfully");
        handleOpenWorkspaceModal(workspaceUser);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  const handleUpdateRoleUserWorkspace = async (workspaceId, role) => {
    try {
      const res = await updateUserWorkspaceRole(workspaceUser._id, workspaceId, role);
      if (res.success) {
        toast.success("Workspace role updated successfully");
        handleOpenWorkspaceModal(workspaceUser);
        refetch();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

return (
    <div className="p-6 min-h-screen text-gray-900">
      <div className="bg-[#EFECE3] border border-gray-300 rounded-xl shadow-md p-6 mb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="text-cyan-700 w-7 h-7" /> User Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Add, edit, delete users, make them System Admin, and manage workspace memberships.
            </p>
          </div>
          <button onClick={handleOpenCreateModal} className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 border-none cursor-pointer hover:shadow-lg">
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6 bg-white/50 p-4 rounded-lg border border-dashed border-slate-300">
          <input
            type="text"
            placeholder="Search by username, email"
            className="flex-1 min-w-[200px] px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            onClick={() => refetch()}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* User Table */}
        {isUsersLoading ? (
          <div className="py-20 text-center font-semibold text-slate-500">
            Loading users data...
          </div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-slate-500 bg-white border rounded-lg">
            No users found matching current filters.
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-lg bg-white border border-slate-200">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-slate-50 text-slate-500 font-semibold px-4 py-3 border-b-2 border-slate-200">User Details</th>
                  <th className="bg-slate-50 text-slate-500 font-semibold px-4 py-3 border-b-2 border-slate-200">Department / Division</th>
                  <th className="bg-slate-50 text-slate-500 font-semibold px-4 py-3 border-b-2 border-slate-200">Phone Number</th>
                  <th className="bg-slate-50 text-slate-500 font-semibold px-4 py-3 border-b-2 border-slate-200">System Status</th>
                  <th className="bg-slate-50 text-slate-500 font-semibold px-4 py-3 border-b-2 border-slate-200 w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 border-b border-slate-100 align-middle">
                      <div className="flex items-center gap-3">
                        {u.photo ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/uploads/users/${u.photo}`}
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800">{u.username}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b border-slate-100 align-middle">
                      <div className="text-sm font-medium text-slate-700">
                        {u.departemen ? u.departemen.toUpperCase() : "-"}
                      </div>
                      <div className="text-xs text-slate-500">{u.divisi || "-"}</div>
                    </td>
                    <td className="px-4 py-4 border-b border-slate-100 align-middle text-sm text-slate-700">{u.noHp || "-"}</td>
                    <td className="px-4 py-4 border-b border-slate-100 align-middle">
                      {u.isSystemAdmin ? (
                        <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded-full text-xs font-semibold">System Admin</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-medium">User</span>
                      )}
                    </td>
                    <td className="px-4 py-4 border-b border-slate-100 align-middle">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors border-none cursor-pointer flex items-center justify-center"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenWorkspaceModal(u)}
                          className="p-1.5 rounded-md bg-green-50 text-green-800 hover:bg-green-100 transition-colors border-none cursor-pointer flex items-center justify-center"
                          title="Manage Workspaces"
                        >
                          <Briefcase className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteConfirm(u)}
                          className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors border-none cursor-pointer flex items-center justify-center"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <span className="text-sm text-slate-600">
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: currentPage - 1 }))}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-500 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 inline" /> Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: currentPage + 1 }))}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-500 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? "Edit User Profile" : "Create New User"}
              </h2>
              <button onClick={() => setIsFormModalOpen(false)} className="bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6">
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-500">Username *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="e.g. johndoe"
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-500">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="e.g. john@example.com"
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-500">
      {isEditMode ? "New Password (optional)" : "Password *"}
    </label>
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        required={!isEditMode}
        value={formData.password}
        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
        placeholder={isEditMode ? "Leave blank to keep current password" : "Min. 6 characters"}
        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 bg-transparent border-none cursor-pointer p-1 rounded flex items-center justify-center"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
    {isEditMode && (
      <p className="text-xs text-slate-400 mt-1">
        * Only fill this field if you want to change the password
      </p>
    )}
  </div>
  
  {/* Phone Number field */}
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-500">Phone Number *</label>
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      required
      value={formData.noHp}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          noHp: e.target.value.replace(/\D/g, ""),
        }))
      }
      placeholder="e.g. 08123456789"
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
    />
  </div>
</div>  

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-500">Department</label>
                      <input
                        type="text"
                        required
                        value={formData.departemen}
                        onChange={(e) => setFormData((prev) => ({ ...prev, departemen: e.target.value }))}
                        placeholder="e.g. HPC, PBPG"
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-500">Division</label>
                      <input
                        type="text"
                        required
                        value={formData.divisi}
                        onChange={(e) => setFormData((prev) => ({ ...prev, divisi: e.target.value }))}
                        placeholder="e.g. IT, HRD, EXT"
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-500">System Privilege</label>
                      <div className="flex items-center gap-3 py-2">
                        <label className="relative inline-block w-12 h-6 cursor-pointer">
                          <input
                            type="checkbox"
                            className="opacity-0 w-0 h-0 absolute"
                            checked={formData.isSystemAdmin}
                            onChange={(e) => setFormData((prev) => ({ ...prev, isSystemAdmin: e.target.checked }))}
                          />
                          <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${formData.isSystemAdmin ? "bg-cyan-700" : "bg-slate-300"}`}>
                            <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-300 ${formData.isSystemAdmin ? "translate-x-6" : "translate-x-0"}`} />
                          </span>
                        </label>
                        <span className="text-sm font-medium text-slate-700">
                          {formData.isSystemAdmin ? "System Admin (Full Access)" : "Regular User"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                <button type="button" onClick={() => setIsFormModalOpen(false)} className="bg-white border border-slate-300 text-slate-500 px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={mutation.isPending} className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 border-none cursor-pointer disabled:opacity-70">
                  {mutation.isPending ? "Saving..." : isEditMode ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WORKSPACE MEMBERSHIP MODAL */}
      {isWorkspaceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-800" /> Workspace Membership: {workspaceUser?.username}
              </h2>
              <button onClick={() => setIsWorkspaceModalOpen(false)} className="bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                  <UserPlus className="w-4 h-4" /> Add to Workspace
                </h3>
                <form onSubmit={handleAddUserWorkspace} className="flex flex-wrap gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    required
                    value={newWorkspaceId}
                    onChange={(e) => setNewWorkspaceId(e.target.value)}
                  >
                    <option value="">Select a Workspace...</option>
                    {allWorkspaces.map((ws) => (
                      <option key={ws._id} value={ws._id}>{ws.nama}</option>
                    ))}
                  </select>
                  <select
                    className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 min-w-[150px] focus:outline-none focus:ring-2 focus:ring-cyan-700"
                    value={newWorkspaceRole}
                    onChange={(e) => setNewWorkspaceRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="project_manager">Project Manager</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                    <option value="management">Management</option>
                  </select>
                  <button type="submit" className="bg-cyan-700 hover:bg-cyan-500 text-white px-4 py-2 rounded-md font-medium transition-all duration-200 border-none cursor-pointer">
                    Add
                  </button>
                </form>
              </div>

              <h3 className="text-sm font-bold text-slate-700 mb-2">Current Memberships</h3>

              {isWorkspacesLoading ? (
                <div className="text-center py-6 text-slate-500 font-semibold">
                  Loading user memberships...
                </div>
              ) : userWorkspacesList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border">
                  User is not currently a member of any workspaces.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {userWorkspacesList.map((wsItem) => {
                    const workspaceDetails = wsItem;
                    const isOwner = wsItem.userRole === "owner";
                    return (
                      <div key={workspaceDetails._id || Math.random()} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-slate-800">{workspaceDetails.nama || "Unknown Workspace"}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-2">
                            Role: {isOwner ? (
                              <strong className="text-red-700">Owner (Bypasses controls)</strong>
                            ) : (
                              <select
                                className="p-1 rounded border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700"
                                value={wsItem.userRole || "member"}
                                onChange={(e) => handleUpdateRoleUserWorkspace(workspaceDetails._id, e.target.value)}
                              >
                                <option value="member">Member</option>
                                <option value="project_manager">Project Manager</option>
                                <option value="admin">Admin</option>
                                <option value="viewer">Viewer</option>
                                <option value="management">Management</option>
                              </select>
                            )}
                          </span>
                        </div>
                        {!isOwner && (
                          <button
                            onClick={() => handleRemoveUserWorkspace(workspaceDetails._id)}
                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            title="Remove from Workspace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <button onClick={() => setIsWorkspaceModalOpen(false)} className="bg-white border border-slate-300 text-slate-500 px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        show={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username}"? This action is permanent and will remove them from all workspaces, tasks, and history.`}
      />
    </div>
  );
}
