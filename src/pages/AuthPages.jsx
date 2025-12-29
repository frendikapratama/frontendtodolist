import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/LogoPlanify.png";
import GradientText from "../components/ui/GradientText";
import "../components/ui/AuthPages.css";
import toast from "react-hot-toast";

export default function AuthCard() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
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
            const res = await api.post("login", { email, password });
            await login(res.data.token);
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
                err.response?.data?.message || "Failed to send feedback OTP"
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
        <div className="w-full h-full flex items-start pt-13 justify-center">
            <div className="space-y-5">
                <div>
                    <label className="block text-lg mb-1 text-slate-700 font-semibold">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-2 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                        placeholder="Enter your email"
                        onKeyDown={handleKey}
                        required
                    />
                </div>
                <div>
                    <label className="block text-lg mb-1 text-slate-700 font-semibold">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 pr-10 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
                            placeholder="Enter your password"
                            onKeyDown={handleKey}
                            required
                            style={{ paddingRight: '2rem' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none p-1"
                        >
                            {showPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-cyan-700"
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
                                    className="h-5 w-5 text-cyan-700"
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
                <button
                    onClick={handleLoginSubmit}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
                >
                    Login
                </button>
                <p
                    className="w-full items-center justify-center flex text-white rounded-lg my-4 sm:my-1 hover:text-blue-700 active:text-blue-800 transition-colors text-sm sm:text-base font-medium cursor-pointer"
                    onClick={handleForgotPasswordClick}
                >
                    Forget Password?
                </p>
            </div>
        </div>
    );

    // Render Forgot Password Form
    const renderForgotPasswordForm = () => (
        <div className="bg-none rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Forget Password</h1>
            <p className="text-gray-600 mb-6">Insert email to receive OTP</p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
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
                    <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
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
                onClick={handleBackToLoginClick}
                className="w-full mt-4 text-white hover:text-blue-800 text-sm"
            >
                Back to login page
            </button>
        </div>
    );

    // Render Reset Password Form
    const renderResetPasswordForm = () => (
        <div className=" rounded-lg -ml-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 mb-4 text-sm">Email: {email}</p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code OTP:
                    </label>
                    <div className="flex gap-1">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password:
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full pr-6 pl-2 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ paddingRight: '2rem' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showNewPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-cyan-700"
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
                                    className="h-5 w-5 text-cyan-700"
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
                        Confirmation Password:
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmNewPassword ? "text" : "password"}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                            className="w-full pr-6 pl-2 py-2 border border-gray-300 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showConfirmNewPassword ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-cyan-700"
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
                                    className="h-5 w-5 text-cyan-700"
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

        {verifyError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {verifyError}
          </div>
        )}
        {verifySuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {verifySuccess}
          </div>
        )}

                <button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? "Processing..." : "Reset Password"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                    Didn't receive the code?
                    {canResend ? (
                        <button
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            resend OTP
                        </button>
                    ) : (
                        <span className="text-gray-500">Resend in {countdown} seconds</span>
                    )}
                </p>
            </div>

            <button
                onClick={handleBackToForgot}
                className="w-full mt-4 text-white hover:text-blue-600 text-sm"
            >
                Back
            </button>
        </div>
    );

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-r from-[#0C2B4E] via-[#1A3D64] to-[#1D546C] p-4">
      <div className="backdrop-blur-xl bg-blue-300 shadow-xl rounded-2xl p-2 sm:p-6 w-2xl max-w-4xl mx-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8">
          {/* Logo Section */}
          <div className="p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-6">
            <div className="mx-auto flex items-center justify-center flex-col">
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

                    {/* Card Container */}
                    <div className="backdrop-blur-lg bg-black/10 shadow-lg rounded-2xl p-4 sm:p-8 w-full min-h-[50vh] max-w-sm sm:max-w-md lg:w-1/2">
                        <div className={`flip-container ${isFlipped ? "flipped" : ""}`}>
                            <div className="flipper">
                                {/* Front - Login atau Reset Password */}
                                <div className="front ">
                                    {currentStep === "login"
                                        ? renderLoginForm()
                                        : renderResetPasswordForm()}
                                </div>

                {/* Back - Forgot Password */}
                <div className="back">{renderForgotPasswordForm()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
