import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/LogoPlanify.png";
import GradientText from "../components/ui/GradientText";
import toast from "react-hot-toast";

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
      navigate("/kuarter");
    } catch (err) {
      // setError(err.response?.data?.message || "Login gagal");
      toast.error(err.response?.data?.message || "Login Failed")
    }
  };
  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };
  const handleForgotPassword = async (e) => {
    navigate("/forgot-password");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-r from-[#0C2B4E] via-[#1A3D64]-200 to-[#1D546C] p-4">
      <div className="backdrop-blur-xl bg-blue-300 shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-6">
            <div className=" mx-auto flex items-center justify-center flex-col">
              <img src={logo} alt="logo" />
              <GradientText
                colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
                animationSpeed={3}
                showBorder={false}
                className="custom-class text-[4em] transition-opacity duration-300"
              >
                Planify
              </GradientText>
            </div>
          </div>

          <div className="backdrop-blur-lg bg-black/10 shadow-lg rounded-2xl p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-4 sm:space-y-6">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-5">
              <div>
                <label className="block text-lg mb-1 text-slate-700 font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Enter your email"
                  onKeyDown={handleKey}
                  required
                />
              </div>
              <div>
                <label className="block text-lg mb-1 text-slate-700 font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                  placeholder="Enter your password"
                  onKeyDown={handleKey}
                  required
                />
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
              >
                Login
              </button>
              <p
                className="w-full items-center justify-center flex text-white rounded-lg my-4 sm:my-5 hover:text-blue-700 active:text-blue-800 transition-colors text-sm sm:text-base font-medium"
                onClick={handleForgotPassword}
              >
                Forget Password?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
