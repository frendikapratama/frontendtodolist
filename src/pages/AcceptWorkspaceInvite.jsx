import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/axios";
import toast from "react-hot-toast";

const AcceptWorkspaceInvite = () => {
  const [searchParams] = useSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    noHp: "",
    posisi: "",
    departemen: "",
    divisi: "",
  });

  const [loading, setLoading] = useState(false);
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const workspaceId = searchParams.get("workspaceId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!workspaceId || !token) {
      setError(
        "Link undangan tidak valid. Pastikan Anda mengakses link yang benar."
      );
      return;
    }

    const registered = searchParams.get("registered");
    if (registered === "true") {
      setIsRegistered(true);
    }

    verifyInvitation();
  }, []);

  const verifyInvitation = async () => {
    try {
      const endpoint = `${API_URL}/api/workspaces/${workspaceId}/verify-invite`;

      console.log("Verifying workspace invitation:", {
        endpoint,
        token,
        workspaceId,
      });

      const response = await axios.get(endpoint, {
        params: { token },
      });

      if (response.data.success) {
        setWorkspaceInfo(response.data.data);
        setFormData((prev) => ({
          ...prev,
          email: response.data.data.invitedEmail,
        }));
      }
    } catch (error) {
      console.error("Verification error:", error.response || error);
      setError(
        error.response?.data?.message ||
          "Token tidak valid atau sudah kedaluwarsa"
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

      if (!formData.username || !formData.noHp || !formData.posisi) {
        setError("Username, No. HP, dan Posisi wajib diisi");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = `${API_URL}/api/workspaces/${workspaceId}/accept-invite?token=${token}`;

      console.log("Submitting to:", endpoint);

      const response = await axios.post(endpoint, isRegistered ? {} : formData);

      if (response.data.success) {
        toast.success(
          isRegistered
            ? "Undangan berhasil diterima! Anda sekarang menjadi anggota workspace ini."
            : "Registrasi berhasil! Anda sekarang menjadi anggota workspace ini."
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat mendaftar"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!workspaceId || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Link Tidak Valid
          </h2>
          <p className="text-gray-600 mb-6">
            Link undangan tidak valid. Pastikan Anda mengakses link yang benar
            dari email.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }

  if (error && !workspaceInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Undangan Tidak Valid
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Kembali ke Halaman Utama
          </button>
        </div>
      </div>
    );
  }

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: "Admin",
      project_manager: "Project Manager",
      member: "Member",
      viewer: "Viewer",
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-500 text-white p-6 text-center">
          <div className="text-4xl mb-2">🏢</div>
          <h1 className="text-2xl font-bold">Terima Undangan Workspace</h1>
          <p className="text-blue-100 mt-2">
            {isRegistered
              ? "Terima undangan untuk bergabung"
              : "Daftar akun untuk bergabung"}
          </p>
        </div>

        {workspaceInfo && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded">
            <h3 className="font-semibold text-blue-800">Detail Workspace:</h3>
            <p className="text-blue-700 font-medium text-lg">
              {workspaceInfo.workspaceName}
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Role:{" "}
              <span className="font-semibold">
                {getRoleLabel(workspaceInfo.role)}
              </span>
            </p>
            {workspaceInfo.inviterName && (
              <p className="text-blue-600 text-sm">
                Diundang oleh:{" "}
                <span className="font-semibold">
                  {workspaceInfo.inviterName}
                </span>
              </p>
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
                Klik tombol di bawah untuk menerima undangan dan bergabung ke
                workspace ini.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {loading ? "Memproses..." : "Terima Undangan"}
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
                  Email ini digunakan untuk undangan
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
                  placeholder="Masukkan username"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                    placeholder="Minimal 6 karakter"
                  />
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
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 pr-10"
                    placeholder="Ulangi password"
                  />
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
                  placeholder="Contoh: 081234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posisi *
                </label>
                <input
                  type="text"
                  name="posisi"
                  value={formData.posisi}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Contoh: Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departemen
                </label>
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
                  Divisi
                </label>
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
                  <option value="CSD">CSD</option>
                  <option value="HRD">HRD</option>
                  <option value="GA">GA</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {loading ? "Mendaftarkan..." : "Daftar & Terima Undangan"}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan mendaftar, Anda menyetujui untuk bergabung ke workspace
                ini.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AcceptWorkspaceInvite;
