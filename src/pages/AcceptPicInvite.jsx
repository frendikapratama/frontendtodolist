import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/axios";
import toast from "react-hot-toast";

const AcceptPicInvite = () => {
  const [searchParams] = useSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);
  const [inviteType, setInviteType] = useState("task");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    noHp: "",
    // posisi: "",
    departemen: "",
    divisi: "",
  });

  const [loading, setLoading] = useState(false);
  const [itemInfo, setItemInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // FIX: Konsisten gunakan subTaskId (huruf besar T) untuk subtask
  const taskId = searchParams.get("taskId");
  const subTaskId = searchParams.get("subTaskId");
  const token = searchParams.get("token");

  useEffect(() => {
    // Validasi parameter
    if (!taskId && !subTaskId) {
      setError(
        "Link undangan tidak valid. Pastikan Anda mengakses link yang benar.",
      );
      return;
    }

    if (!token) {
      setError("Token tidak ditemukan dalam link undangan.");
      return;
    }

    // Set invite type
    if (subTaskId) {
      setInviteType("subTask");
    } else if (taskId) {
      setInviteType("task");
    }

    // Check if user is registered
    const registered = searchParams.get("registered");
    if (registered === "true") {
      setIsRegistered(true);
    }

    // Verify invitation
    verifyInvitation();
  }, []);

  const verifyInvitation = async () => {
    try {
      // Determine which ID to use
      const id = subTaskId || taskId;
      const type = subTaskId ? "subTask" : "task";

      const endpoint = `${API_URL}/api/${type}/${id}/verify-invite`;

      console.log("Verifying invitation:", { endpoint, token, id, type }); // Debug log

      const response = await axios.get(endpoint, {
        params: { token },
      });

      if (response.data.success) {
        setItemInfo(response.data.data);
        setFormData((prev) => ({
          ...prev,
          email: response.data.data.invitedEmail,
        }));
      }
    } catch (error) {
      console.error("Verification error:", error.response || error); // Tambahkan logging
      setError(
        error.response?.data?.message ||
          "Token tidak valid atau sudah kedaluwarsa",
      );
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isRegistered) {
      if (formData.password !== formData.confirmPassword) {
        setError("Password dan konfirmasi password tidak cocok");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }

      if (!formData.username || !formData.noHp) {
        setError("Username dan No. HP wajib diisi");
        return;
      }
    }

    setLoading(true);

    try {
      // FIX: Gunakan ID dan type yang tepat
      const id = subTaskId || taskId;
      const type = subTaskId ? "subTask" : "task";

      const endpoint = `${API_URL}/api/${type}/${id}/accept-pic-invite?token=${token}`;

      console.log("Submitting to:", endpoint); // Debug log

      const response = await axios.post(endpoint, isRegistered ? {} : formData);

      if (response.data.success) {
        const itemType = inviteType === "subTask" ? "subTask" : "task";
        toast.success(
          isRegistered
            ? `Invitation has been accepted! Now you are the PIC for this ${itemType}.`
            : `Registration successfully! Now you are the PIC for this ${itemType}.`,
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Submit error:", error); // Tambahkan logging
      setError(
        error.response?.data?.message ||
          "Something went wrong during registration",
      );
    } finally {
      setLoading(false);
    }
  };

  if ((!taskId && !subTaskId) || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6">
            This link is invalid or has expired. Please check the email for the
            latest link.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (error && !itemInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            The invitation is invalid
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const pageTitle = inviteType === "subTask" ? "SubTask" : "Task";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-500 text-white p-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold">
            Accept the PIC Invitation {pageTitle}
          </h1>
          <p className="text-blue-100 mt-2">
            Registration as (Person In Charge)
          </p>
        </div>

        {itemInfo && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded">
            <h3 className="font-semibold text-blue-800">Detail {pageTitle}:</h3>
            {inviteType === "subTask" ? (
              <>
                <p className="text-blue-700 font-medium">
                  {itemInfo.subtaskName}
                </p>
                <p className="text-blue-600 text-sm">
                  Task: {itemInfo.taskName}
                </p>
                <p className="text-blue-600 text-sm">
                  Project: {itemInfo.projectName}
                </p>
                <p className="text-blue-600 text-sm">
                  Workspace: {itemInfo.workspaceName}
                </p>
              </>
            ) : (
              <>
                <p className="text-blue-700 font-medium">{itemInfo.taskName}</p>
                <p className="text-blue-600 text-sm">
                  Project: {itemInfo.projectName}
                </p>
                <p className="text-blue-600 text-sm">
                  Workspace: {itemInfo.workspaceName}
                </p>
              </>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {isRegistered ? (
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Click the button below to accept the invitation and be a PIC for
                this
                {inviteType === "subTask" ? " subTask" : " task"} project.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {loading ? "Processing..." : "Accept invitation"}
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                />
                <p className="text-xs text-gray-900 mt-1">
                  This email will be used for the invitation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Required 6 Character"
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Retype the password"
                  />{" "}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Handphone *
                </label>
                <input
                  type="tel"
                  name="noHp"
                  value={formData.noHp}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Example: 081234567890"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position (Optional)
                </label> */}
              {/* <input
                  type="text"
                  name=""
                  value={formData.posisi}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Example: Software Engineer"
                /> */}

              {/* <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  name="posisi"
                  value={formData.posisi}
                  onChange={handleChange}
                >
                  <option value="">Select Position</option>
                  <option value="Admin">Admin</option>
                  <option value="Teknisi">Teknisi</option>
                  <option value="User">User</option>
                </select> */}
              {/* </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                {/* <input
                  type="text"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opsional"
                /> */}
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="PBPG">PBPG</option>
                  <option value="HPC">HPC</option>
                  <option value="PT">PT</option>
                  <option value="OFFICE">OFFICE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                {/* <input
                  type="text"
                  name="divisi"
                  value={formData.divisi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opsional"
                /> */}
                <select
                  name="divisi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  onChange={handleChange}
                  value={formData.divisi}
                  required
                >
                  <option value="">Select Division</option>
                  <option value="IT">IT</option>
                  <option value="Production">Production</option>
                  <option value="Accounting">Accounting</option>
                  <option value="Corporate Secretary">
                    Corporate Secretary
                  </option>
                  <option value="Collector">Collector</option>
                  <option value="Audit Internal">Audit Internal</option>
                  <option value="Administration">Administration</option>
                  <option value="PPIC - PT">PPIC - PT</option>
                  <option value="PPIC - HPC">PPIC - HPC</option>
                  <option value="PPIC - PBPG">PPIC - PBPBG</option>
                  <option value="Designer">Designer</option>
                  <option value="Costing">Costing</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Purchasing">Purchasing</option>
                  <option value="Invoicing">Invoicing</option>
                  <option value="QC - RND">QC - RND</option>
                  <option value="Purchasing">Purchasing</option>
                  <option value="CSD">CSD</option>
                  <option value="HRD">HRD</option>
                  <option value="GA">GA</option>
                  <option value="Finance">Finance</option>
                  <option value="Management Trainee">Management Trainee</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {loading
                  ? "Registering..."
                  : "Register and accept the invitation"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan mendaftar, Anda menyetujui untuk menjadi PIC By
                registering, you agree to be the Person in Charge (PIC) for this{" "}
                {inviteType === "subTask" ? "subTask" : "task"} and join the
                related division.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AcceptPicInvite;
