import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AcceptPicInvite = () => {
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
  const [taskInfo, setTaskInfo] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const taskId = searchParams.get("taskId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!taskId || !token) {
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
  }, [taskId, token]);

  const verifyInvitation = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/task/${taskId}/verify-invite`,
        {
          params: { token },
        }
      );

      if (response.data.success) {
        setTaskInfo(response.data.data);
        setFormData((prev) => ({
          ...prev,
          email: response.data.data.invitedEmail,
        }));
      }
    } catch (error) {
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
      const response = await axios.post(
        `http://localhost:5000/api/task/${taskId}/accept-pic-invite?token=${token}`,
        isRegistered ? {} : formData
      );

      if (response.data.success) {
        setSuccess(
          isRegistered
            ? "Undangan berhasil diterima! Anda sekarang menjadi PIC untuk task ini."
            : "Registrasi berhasil! Anda sekarang menjadi PIC untuk task ini."
        );

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Terjadi kesalahan saat mendaftar"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!taskId || !token) {
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

  if (error && !taskInfo) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-500 text-white p-6 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold">Terima Undangan PIC</h1>
          <p className="text-blue-100 mt-2">
            Daftar akun untuk menjadi Person In Charge
          </p>
        </div>

        {taskInfo && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mx-6 mt-6 rounded">
            <h3 className="font-semibold text-blue-800">Detail Task:</h3>
            <p className="text-blue-700 font-medium">{taskInfo.taskName}</p>
            <p className="text-blue-600 text-sm">
              Project: {taskInfo.projectName}
            </p>
            <p className="text-blue-600 text-sm">
              Workspace: {taskInfo.workspaceName}
            </p>
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
                Klik tombol di bawah untuk menerima undangan dan menjadi PIC
                task ini.
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ulangi password"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departemen
                </label>
                <input
                  type="text"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opsional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Divisi
                </label>
                <input
                  type="text"
                  name="divisi"
                  value={formData.divisi}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opsional"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
              >
                {loading ? "Mendaftarkan..." : "Daftar & Terima Undangan"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Dengan mendaftar, Anda menyetujui untuk menjadi PIC task ini dan
                bergabung ke workspace terkait.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default AcceptPicInvite;
