import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("login", { email, password });
      await login(res.data.token);
      navigate("/workspaces");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 p-4">
      <div className="backdrop-blur-xl bg-white/20 shadow-lg rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Logo Section */}
          <div className="p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-6">
            <div className=" mx-auto flex items-center justify-center ">
              <img src="../public/logo.png" alt="logo" />
            </div>
          </div>

          {/* Form Section */}
          <div className="backdrop-blur-lg bg-white/5 shadow-lg rounded-2xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-4 sm:space-y-6">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-5">
              <div>
                <label className="block text-sm mb-1 text-white">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-white">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
