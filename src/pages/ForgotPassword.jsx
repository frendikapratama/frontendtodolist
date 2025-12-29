// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("users/forget-password", { email });
      setSuccess("OTP has been send to your Email");
      setTimeout(() => {
        navigate("/verify-reset-password", { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forget Password</h1>
        <p className="text-gray-600 mb-6">Enter the email to get the OTP</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-white hover:text-gray-300"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
