import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/LogoPlanify.png";
import GradientText from "../components/ui/GradientText";
import toast from "react-hot-toast";
import TableMeeting from "./BookingMeeting/MeetingManagement/TableMeeting";
import dayjs from "dayjs";
import { Calendar, Clock, User, Lock, Eye, EyeOff } from "lucide-react";

export default function AuthCard() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState("login");
  const [isFlipped, setIsFlipped] = useState(false);

  // States for verify-reset-password
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Sync currentStep dengan location.pathname
  React.useEffect(() => {
    if (location.pathname === "/forgot-password") {
      if (currentStep === "login") {
        setCurrentStep("forgot");
        setIsFlipped(true);
      }
    } else if (location.pathname === "/login") {
      setCurrentStep("login");
      setIsFlipped(false);
    }
  }, [location.pathname]);

  // Countdown untuk resend OTP
  useEffect(() => {
    if (currentStep === "verify" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, currentStep]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("login", { identifier, password });
      await login(res.data.accessToken);
      navigate("/kuarter");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("users/forget-password", { email });
      toast.success("OTP has been send to your email");

      setTimeout(() => {
        setCurrentStep("verify");
        setIsFlipped(false); // Flip balik untuk tampilkan verify
        setSuccess("");
        setError("");
        setOtp(["", "", "", "", "", ""]);
        setCountdown(60);
        setCanResend(false);
        setTimeout(() => inputRefs.current[0]?.focus(), 700);
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers untuk OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Enter the 6-digit OTP code");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("passwords do not match");
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must a be at 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("users/change-password", {
        email,
        otp: otpCode,
        newPassword,
      });
      toast.success("password reset successfully!");
      setTimeout(() => {
        navigate("/login");
        setCurrentStep("login");
        setIsFlipped(false);
        setEmail("");
        setPassword("");
        setOtp(["", "", "", "", "", ""]);
        setNewPassword("");
        setConfirmNewPassword("");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setVerifyError("");
    try {
      await api.post("users/forget-password", { email });
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || "Failed to send feedback OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setError("");
    setSuccess("");
    setCurrentStep("forgot");
    setIsFlipped(true);
    navigate("/forgot-password");
  };

  const handleBackToLoginClick = () => {
    setCurrentStep("login");
    setIsFlipped(false);
    setError("");
    setSuccess("");
    setVerifyError("");
    setVerifySuccess("");
    navigate("/login");
  };

  const handleBackToForgot = () => {
    setCurrentStep("forgot");
    setIsFlipped(true);
    setVerifyError("");
    setVerifySuccess("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleLoginSubmit(e);
    }
  };

  const renderLoginForm = () => (
    <div className="w-full flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg mb-3">
        <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-0.5 tracking-wide">
        Welcome Back
      </h1>
      <p className="text-xs text-blue-200/50 mb-5">
        Sign in to continue to Planify
      </p>

      <div className="w-full space-y-4">
        <div>
          <label className="block text-xs font-semibold text-blue-200/70 uppercase tracking-wider mb-1.5">
            Email or Username
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40 group-focus-within:text-teal-300 transition-colors" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onKeyDown={handleKey}
              required
              placeholder="Enter your email or username"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#1A3D64]/40 border border-white/10 text-white placeholder-blue-300/30 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:bg-[#1A3D64]/70 transition-all [box-shadow:0_0_0_30px_#16324f_inset] [-webkit-text-fill-color:white]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-blue-200/70 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300/40 group-focus-within:text-teal-300 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
              required
              placeholder="Enter your password"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#1A3D64]/40 border border-white/10 text-white placeholder-blue-300/30 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:bg-[#1A3D64]/70 transition-all [box-shadow:0_0_0_30px_#16324f_inset] [-webkit-text-fill-color:white]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLoginSubmit}
          className="w-full bg-linear-to-r from-[#1A3D64] to-[#1D546C] hover:from-[#1D546C] hover:to-[#1A3D64] text-white py-2.5 rounded-xl font-bold shadow-lg shadow-black/10 active:scale-[0.98] transition-all text-xs mt-2"
        >
          Login
        </button>
      </div>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="w-full flex flex-col justify-center text-white">
      <h1 className="text-2xl font-bold mb-1 tracking-wide">Forget Password</h1>
      <p className="text-blue-200/60 mb-5 text-xs">
        Insert email to receive OTP
      </p>
      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="w-full bg-[#1A3D64]/40 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-teal-400/50 text-xs"
          />
        </div>
        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs">
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-linear-to-r from-[#1A3D64] to-[#1D546C] py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-black/10 hover:from-[#1D546C] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Sending..." : "Send OTP"}
        </button>
      </form>
      <button
        onClick={handleBackToLoginClick}
        className="w-full mt-4 text-center text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
      >
        Back to login page
      </button>
    </div>
  );

  const renderResetPasswordForm = () => (
    <div className="w-full flex flex-col justify-center text-white">
      <h1 className="text-2xl font-bold mb-0.5 tracking-wide">
        Reset Password
      </h1>
      <p className="text-blue-200/60 mb-4 text-xs">Email: {email}</p>
      <form onSubmit={handleVerifySubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-2">
            Code OTP
          </label>
          <div className="flex justify-between gap-1">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-10 text-center text-sm font-bold bg-[#1A3D64]/40 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50"
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#1A3D64]/40 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white placeholder-blue-300/20 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-white"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-blue-200/80 mb-1.5">
            Confirmation Password
          </label>
          <div className="relative">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-[#1A3D64]/40 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-white placeholder-blue-300/20 text-xs focus:outline-none focus:ring-2 focus:ring-teal-400/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/40 hover:text-white"
            >
              {showConfirmNewPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>
        </div>

        {verifyError && (
          <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs">
            {verifyError}
          </div>
        )}
        {verifySuccess && (
          <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-xs">
            {verifySuccess}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          className="w-full bg-linear-to-r from-[#1A3D64] to-[#1D546C] py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-black/10 hover:from-[#1D546C] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-3 text-center">
        <p className="text-[11px] text-blue-200/50">
          Didn't receive the code?{" "}
          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-teal-300 font-semibold hover:underline disabled:opacity-50"
            >
              resend OTP
            </button>
          ) : (
            <span className="text-blue-300/40">Resend in {countdown}s</span>
          )}
        </p>
      </div>

      <button
        onClick={handleBackToForgot}
        className="w-full mt-2 text-center text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
      >
        Back
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-linear-to-tl from-[#1A3D64] to-[#1D546C] p-4 relative select-none">
      {/* Background Neon Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-400/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <h1 className="fixed bottom-4 right-4 text-xs text-blue-300/20 z-50">
        © 2026 Frendika & Marcello. All rights reserved.
      </h1>

      {/* Main Container Glassmorphism */}
      <div className="backdrop-blur-3xl bg-white/2 border border-white/8 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.9)] rounded-4xl p-6 w-full max-w-7xl h-full max-h-[90vh] flex flex-col justify-between overflow-hidden relative z-10">
        {/* Top bar: logo + tanggal/jam */}
        <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={3}
              showBorder={false}
              className="custom-class text-2xl font-black tracking-tight"
            >
              Planify
            </GradientText>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-blue-200/60 tracking-wide">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-teal-300/80" />
              {dayjs().format("DD MMMM YYYY")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-teal-300/80" />
              {dayjs().format("hh:mm A")}
            </span>
          </div>
        </div>

        {/* Content Body Layout */}
        <div className="flex flex-col lg:flex-row gap-6 px-2 pt-4 grow overflow-hidden h-full items-stretch">
          {/* Kiri: Today's Meetings */}
          <div className="grow flex-1 rounded-2xl  p-1 overflow-hidden h-full flex flex-col  m-0">
            <TableMeeting compact />
          </div>

          {/* Kanan: Auth card murni Tailwind 3D Flip */}
          <div className="w-full lg:w-[400px] perspective-[1000px] shrink-0 min-h-[200px] max-h-[520px] lg:h-auto">
            <div
              className={`relative w-full h-full duration-700 transform-3d ${isFlipped ? "transform-[rotateY(180deg)]" : ""}`}
            >
              {/* Sisi Depan */}
              <div className="absolute inset-0 w-full h-full backface-hidden backdrop-blur-md bg-[#16324f]/80  rounded-2xl p-6 flex flex-col justify-center shadow-lg">
                {currentStep === "login"
                  ? renderLoginForm()
                  : renderResetPasswordForm()}
              </div>

              {/* Sisi Belakang */}
              <div className="absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] backdrop-blur-md bg-[#16324f]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-center shadow-lg">
                {renderForgotPasswordForm()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
