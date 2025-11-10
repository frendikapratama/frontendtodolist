// import React, { useState, useContext } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import logo from "../assets/LogoPlanify.png";
// import GradientText from "../components/ui/GradientText";
// import "../components/ui/AuthPages.css"

// export default function AuthCard() {
//     const { login } = useContext(AuthContext);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [success, setSuccess] = useState("");
//     const [isForgotPassword, setIsForgotPassword] = useState(false);
//     const navigate = useNavigate();
//     const location = useLocation();

//     React.useEffect(() => {
//         setIsForgotPassword(location.pathname === "/forgot-password");
//     }, [location.pathname]);

//     const handleLoginSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         try {
//             const res = await api.post("login", { email, password });
//             await login(res.data.token);
//             navigate("/kuarter");
//         } catch (err) {
//             setError(err.response?.data?.message || "Login gagal");
//         }
//     };

//     const handleForgotPasswordSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError("");
//         setSuccess("");
//         try {
//             await api.post("users/forget-password", { email });
//             setSuccess("OTP telah dikirim ke email Anda");
//             setTimeout(() => {
//                 navigate("/verify-reset-password", { state: { email } });
//             }, 2000);
//         } catch (err) {
//             setError(err.response?.data?.message || "Gagal mengirim OTP");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleForgotPasswordClick = () => {
//         setIsForgotPassword(true);
//         navigate("/forgot-password");
//     };

//     const handleBackToLoginClick = () => {
//         setIsForgotPassword(false);
//         navigate("/login");
//     };

//     const handleKey = (e) => {
//         if (e.key === "Enter") {
//             handleLoginSubmit(e);
//         }
//     };

//     return (
//         <div className="h-screen flex items-center justify-center bg-linear-to-r from-[#0C2B4E] via-[#1A3D64] to-[#1D546C] p-4">
//             <div className="backdrop-blur-xl bg-blue-300 shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4">
//                 <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8">
//                     <div className="p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-6">
//                         <div className="mx-auto flex items-center justify-center flex-col">
//                             <img src={logo} alt="logo" />
//                             <GradientText
//                                 colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
//                                 animationSpeed={3}
//                                 showBorder={false}
//                                 className="custom-class text-[4em] transition-opacity duration-300"
//                             >
//                                 Planify
//                             </GradientText>
//                         </div>
//                     </div>
//                     <div className="backdrop-blur-lg bg-black/10 shadow-lg rounded-2xl p-4 sm:p-8 w-full min-h-[50vh] max-w-sm sm:max-w-md lg:w-1/2 space-y-4 sm:space-y-6">
//                         <div className={`flip-container ${isForgotPassword ? "flipped" : ""}`}>
//                             <div className=" flipper">
//                                 {/* Login Form (Front) */}
//                                 <div className="front">
//                                     {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
//                                     <div className="space-y-5">
//                                         <div>
//                                             <label className="block text-lg mb-1 text-slate-700 font-semibold">Email</label>
//                                             <input
//                                                 type="email"
//                                                 value={email}
//                                                 onChange={(e) => setEmail(e.target.value)}  
//                                                 className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
//                                                 placeholder="Enter your email"
//                                                 onKeyDown={handleKey}
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-lg mb-1 text-slate-700 font-semibold">Password</label>
//                                             <input
//                                                 type="password"
//                                                 value={password}
//                                                 onChange={(e) => setPassword(e.target.value)}
//                                                 className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
//                                                 placeholder="Enter your password"
//                                                 onKeyDown={handleKey}
//                                                 required
//                                             />
//                                         </div>
//                                         <button
//                                             onClick={handleLoginSubmit}
//                                             className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
//                                         >
//                                             Login
//                                         </button>
//                                         <p
//                                             className="w-full items-center justify-center flex text-white rounded-lg my-4 sm:my-5 hover:text-blue-700 active:text-blue-800 transition-colors text-sm sm:text-base font-medium cursor-pointer"
//                                             onClick={handleForgotPasswordClick}
//                                         >
//                                             Forget Password?
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Forgot Password Form (middle) */}
//                                 <div className="middle">
//                                     <h1 className="text-2xl font-bold text-gray-900 mb-2">OTP Card</h1>
//                                     <p className="text-gray-600 mb-6">Fill in your email and you will get the OTP</p>
//                                     <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
//                                             <input
//                                                 type="email"
//                                                 value={email}
//                                                 onChange={(e) => setEmail(e.target.value)}
//                                                 required
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             />
//                                         </div>
//                                         {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
//                                         {success && <div className="p-3 bg-green-50 text-green-700 rounded-md">{success}</div>}
//                                         <button
//                                             type="submit"
//                                             disabled={isLoading}
//                                             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                                         >
//                                             {isLoading ? "Mengirim..." : "Kirim OTP"}
//                                         </button>
//                                     </form>
//                                     <button
//                                         onClick={handleBackToLoginClick}
//                                         className="w-full mt-4 text-gray-600 hover:text-gray-800"
//                                     >
//                                         Kembali ke Login
//                                     </button>
//                                 </div>

//                                 {/* Forgot Password Form (Back) */}
//                                 <div className="back">
//                                     <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
//                                     <p className="text-gray-600 mb-6">Fill in your email and you will get the OTP</p>
//                                     <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
//                                             <input
//                                                 type="email"
//                                                 value={email}
//                                                 onChange={(e) => setEmail(e.target.value)}
//                                                 required
//                                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                             />
//                                         </div>
//                                         {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
//                                         {success && <div className="p-3 bg-green-50 text-green-700 rounded-md">{success}</div>}
//                                         <button
//                                             type="submit"
//                                             disabled={isLoading}
//                                             className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                                         >
//                                             {isLoading ? "Mengirim..." : "Kirim OTP"}
//                                         </button>
//                                     </form>
//                                     <button
//                                         onClick={handleBackToLoginClick}
//                                         className="w-full mt-4 text-gray-600 hover:text-gray-800"
//                                     >
//                                         Kembali ke Login
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// import React, { useState, useRef, useEffect, useContext } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";
// import logo from "../assets/LogoPlanify.png";
// import GradientText from "../components/ui/GradientText";
// import "../components/ui/AuthPages.css";

// export default function AuthCard() {
//     const { login } = useContext(AuthContext);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [success, setSuccess] = useState("");
//     const [currentStep, setCurrentStep] = useState('login');
//     const [isFlipped, setIsFlipped] = useState(false);

//     // States for verify-reset-password
//     const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//     const [newPassword, setNewPassword] = useState("");
//     const [confirmNewPassword, setConfirmNewPassword] = useState("");
//     const [verifyError, setVerifyError] = useState("");
//     const [verifySuccess, setVerifySuccess] = useState("");
//     const [countdown, setCountdown] = useState(60);
//     const [canResend, setCanResend] = useState(false);
//     const inputRefs = useRef([]);

//     const navigate = useNavigate();
//     const location = useLocation();

//     // Sync currentStep dengan location.pathname
//     React.useEffect(() => {
//         if (location.pathname === "/forgot-password") {
//             if (currentStep === 'login') {
//                 setCurrentStep('forgot');
//                 setIsFlipped(true);
//             }
//         } else if (location.pathname === "/login") {
//             setCurrentStep('login');
//             setIsFlipped(false);
//         }
//     }, [location.pathname]);

//     useEffect(() => {
//         if (currentStep === 'verify' && countdown > 0) {
//             const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//             return () => clearTimeout(timer);
//         } else if (countdown === 0) {
//             setCanResend(true);
//         }
//     }, [countdown, currentStep]);

//     const handleLoginSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         try {
//             const res = await api.post("login", { email, password });
//             await login(res.data.token);
//             navigate("/kuarter");
//         } catch (err) {
//             setError(err.response?.data?.message || "Login gagal");
//         }
//     };

//     const handleForgotPasswordSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError("");
//         setSuccess("");
//         try {
//             await api.post("users/forget-password", { email });
//             setSuccess("OTP telah dikirim ke email Anda");

//             // Setelah berhasil kirim OTP, flip ke verify
//             setTimeout(() => {
//                 setCurrentStep('verify');
//                 setIsFlipped(false); // Flip balik untuk tampilkan verify
//                 setSuccess("");
//                 setError("");
//                 setOtp(["", "", "", "", "", ""]);
//                 setCountdown(60);
//                 setCanResend(false);
//                 setTimeout(() => inputRefs.current[0]?.focus(), 700);
//             }, 2000);
//         } catch (err) {
//             setError(err.response?.data?.message || "Gagal mengirim OTP");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handlers untuk OTP input
//     const handleOtpChange = (index, value) => {
//         if (!/^\d*$/.test(value)) return;
//         const newOtp = [...otp];
//         newOtp[index] = value;
//         setOtp(newOtp);
//         if (value && index < 5) {
//             inputRefs.current[index + 1]?.focus();
//         }
//     };

//     const handleKeyDown = (index, e) => {
//         if (e.key === "Backspace" && !otp[index] && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         }
//     };

//     const handleVerifySubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setVerifyError("");
//         const otpCode = otp.join("");

//         if (otpCode.length !== 6) {
//             setVerifyError("Masukkan 6 digit OTP");
//             setIsLoading(false);
//             return;
//         }
//         if (newPassword !== confirmNewPassword) {
//             setVerifyError("Password tidak cocok");
//             setIsLoading(false);
//             return;
//         }
//         if (newPassword.length < 6) {
//             setVerifyError("Password minimal 6 karakter");
//             setIsLoading(false);
//             return;
//         }

//         try {
//             await api.post("users/change-password", {
//                 email,
//                 otp: otpCode,
//                 newPassword,
//             });
//             setVerifySuccess("Password berhasil direset!");
//             setTimeout(() => {
//                 navigate("/login");
//                 setCurrentStep('login');
//                 setIsFlipped(false);
//                 setEmail("");
//                 setPassword("");
//                 setOtp(["", "", "", "", "", ""]);
//                 setNewPassword("");
//                 setConfirmNewPassword("");
//             }, 2000);
//         } catch (err) {
//             setVerifyError(err.response?.data?.message || "Gagal reset password");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleResendOTP = async () => {
//         setIsLoading(true);
//         setVerifyError("");
//         try {
//             await api.post("users/forget-password", { email });
//             setCountdown(60);
//             setCanResend(false);
//             setOtp(["", "", "", "", "", ""]);
//             inputRefs.current[0]?.focus();
//         } catch (err) {
//             setVerifyError(err.response?.data?.message || "Gagal mengirim ulang OTP");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleForgotPasswordClick = () => {
//         setError("");
//         setSuccess("");
//         setCurrentStep('forgot');
//         setIsFlipped(true);
//         navigate("/forgot-password");
//     };

//     const handleBackToLoginClick = () => {
//         setCurrentStep('login');
//         setIsFlipped(false);
//         setError("");
//         setSuccess("");
//         setVerifyError("");
//         setVerifySuccess("");
//         navigate("/login");
//     };

//     const handleBackToForgot = () => {
//         setCurrentStep('forgot');
//         setIsFlipped(true);
//         setVerifyError("");
//         setVerifySuccess("");
//         setOtp(["", "", "", "", "", ""]);
//         setNewPassword("");
//         setConfirmNewPassword("");
//     };

//     const handleKey = (e) => {
//         if (e.key === "Enter") {
//             handleLoginSubmit(e);
//         }
//     };

//     // Render Login Form
//     const renderLoginForm = () => (
//         <>
//             {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
//             <div className="space-y-5">
//                 <div>
//                     <label className="block text-lg mb-1 text-slate-700 font-semibold">Email</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
//                         placeholder="Enter your email"
//                         onKeyDown={handleKey}
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-lg mb-1 text-slate-700 font-semibold">Password</label>
//                     <input
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full border-b-2 border-b-blue-500 focus:border-b-blue-300 focus:ring-0 focus:outline-none px-2 sm:px-3 py-2 bg-transparent text-white placeholder-gray-300 text-sm sm:text-base"
//                         placeholder="Enter your password"
//                         onKeyDown={handleKey}
//                         required
//                     />
//                 </div>
//                 <button
//                     onClick={handleLoginSubmit}
//                     className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
//                 >
//                     Login
//                 </button>
//                 <p
//                     className="w-full items-center justify-center flex text-white rounded-lg my-4 sm:my-5 hover:text-blue-700 active:text-blue-800 transition-colors text-sm sm:text-base font-medium cursor-pointer"
//                     onClick={handleForgotPasswordClick}
//                 >
//                     Forget Password?
//                 </p>
//             </div>
//         </>
//     );

//     // Render Forgot Password Form
//     const renderForgotPasswordForm = () => (
//         <div className="bg-none rounded-lg p-6">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Lupa Password</h1>
//             <p className="text-gray-600 mb-6">Masukkan email untuk menerima OTP</p>
//             <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
//                     <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>
//                 {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
//                 {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
//                 <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                 >
//                     {isLoading ? "Mengirim..." : "Kirim OTP"}
//                 </button>
//             </form>
//             <button
//                 onClick={handleBackToLoginClick}
//                 className="w-full mt-4 text-white hover:text-blue-600 text-sm"
//             >
//                 Kembali ke Login
//             </button>
//         </div>
//     );

//     // Render Reset Password Form
//     const renderResetPasswordForm = () => (
//         <div className="bg-none rounded-lg p-6">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
//             <p className="text-gray-600 mb-4 text-sm">Email: {email}</p>
//             <form onSubmit={handleVerifySubmit} className="space-y-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Kode OTP:</label>
//                     <div className="flex justify-between gap-2">
//                         {otp.map((digit, index) => (
//                             <input
//                                 key={index}
//                                 ref={(el) => (inputRefs.current[index] = el)}
//                                 type="text"
//                                 maxLength="1"
//                                 value={digit}
//                                 onChange={(e) => handleOtpChange(index, e.target.value)}
//                                 onKeyDown={(e) => handleKeyDown(index, e)}
//                                 className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                         ))}
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru:</label>
//                     <input
//                         type="password"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password:</label>
//                     <input
//                         type="password"
//                         value={confirmNewPassword}
//                         onChange={(e) => setConfirmNewPassword(e.target.value)}
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 {verifyError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{verifyError}</div>}
//                 {verifySuccess && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{verifySuccess}</div>}

//                 <button
//                     type="submit"
//                     disabled={isLoading || otp.join("").length !== 6}
//                     className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//                 >
//                     {isLoading ? "Memproses..." : "Reset Password"}
//                 </button>
//             </form>

//             <div className="mt-4 text-center">
//                 <p className="text-xs text-gray-600">
//                     Tidak menerima kode?{" "}
//                     {canResend ? (
//                         <button
//                             onClick={handleResendOTP}
//                             disabled={isLoading}
//                             className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
//                         >
//                             Kirim ulang OTP
//                         </button>
//                     ) : (
//                         <span className="text-gray-500">Kirim ulang dalam {countdown} detik</span>
//                     )}
//                 </p>
//             </div>

//             <button
//                 onClick={handleBackToForgot}
//                 className="w-full mt-4 text-white hover:text-blue-600 text-sm"
//             >
//                 Kembali
//             </button>
//         </div>
//     );

//     return (
//         <div className="h-screen flex items-center justify-center bg-linear-to-r from-[#0C2B4E] via-[#1A3D64] to-[#1D546C] p-4">
//             <div className="backdrop-blur-xl bg-blue-300 shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4">
//                 <div className="flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8">
//                     {/* Logo Section */}
//                     <div className="p-4 sm:p-8 w-full max-w-sm sm:max-w-md lg:w-1/2 space-y-6">
//                         <div className="mx-auto flex items-center justify-center flex-col">
//                             <img src={logo} alt="logo" />
//                             <GradientText
//                                 colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
//                                 animationSpeed={3}
//                                 showBorder={false}
//                                 className="custom-class text-[4em] transition-opacity duration-300"
//                             >
//                                 Planify
//                             </GradientText>
//                         </div>
//                     </div>

//                     {/* Card Container */}
//                     <div className="backdrop-blur-lg bg-black/10 shadow-lg rounded-2xl p-4 sm:p-8 w-full min-h-[50vh] max-w-sm sm:max-w-md lg:w-1/2">
//                         <div className={`flip-container ${isFlipped ? 'flipped' : ''}`}>
//                             <div className="flipper">
//                                 {/* Front - Login atau Reset Password */}
//                                 <div className="front">
//                                     {currentStep === 'login' ? renderLoginForm() : renderResetPasswordForm()}
//                                 </div>

//                                 {/* Back - Forgot Password */}
//                                 <div className="back">
//                                     {renderForgotPasswordForm()}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/LogoPlanify.png";
import GradientText from "../components/ui/GradientText";
import "../components/ui/AuthPages.css";

export default function AuthCard() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [currentStep, setCurrentStep] = useState('login'); // 'login', 'forgot', 'verify'
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

    const navigate = useNavigate();
    const location = useLocation();

    // Sync currentStep dengan location.pathname
    React.useEffect(() => {
        if (location.pathname === "/forgot-password") {
            if (currentStep === 'login') {
                setCurrentStep('forgot');
                setIsFlipped(true);
            }
        } else if (location.pathname === "/login") {
            setCurrentStep('login');
            setIsFlipped(false);
        }
    }, [location.pathname]);

    // Countdown untuk resend OTP
    useEffect(() => {
        if (currentStep === 'verify' && countdown > 0) {
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
            setError(err.response?.data?.message || "Login gagal");
        }
    };

    const handleForgotPasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            await api.post("users/forget-password", { email });
            setSuccess("OTP telah dikirim ke email Anda");

            // Setelah berhasil kirim OTP, flip ke verify
            setTimeout(() => {
                setCurrentStep('verify');
                setIsFlipped(false); // Flip balik untuk tampilkan verify
                setSuccess("");
                setError("");
                setOtp(["", "", "", "", "", ""]);
                setCountdown(60);
                setCanResend(false);
                setTimeout(() => inputRefs.current[0]?.focus(), 700);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengirim OTP");
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
        setVerifyError("");
        const otpCode = otp.join("");

        if (otpCode.length !== 6) {
            setVerifyError("Masukkan 6 digit OTP");
            setIsLoading(false);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setVerifyError("Password tidak cocok");
            setIsLoading(false);
            return;
        }
        if (newPassword.length < 6) {
            setVerifyError("Password minimal 6 karakter");
            setIsLoading(false);
            return;
        }

        try {
            await api.post("users/change-password", {
                email,
                otp: otpCode,
                newPassword,
            });
            setVerifySuccess("Password berhasil direset!");
            setTimeout(() => {
                navigate("/login");
                setCurrentStep('login');
                setIsFlipped(false);
                setEmail("");
                setPassword("");
                setOtp(["", "", "", "", "", ""]);
                setNewPassword("");
                setConfirmNewPassword("");
            }, 2000);
        } catch (err) {
            setVerifyError(err.response?.data?.message || "Gagal reset password");
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
            setVerifyError(err.response?.data?.message || "Gagal mengirim ulang OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPasswordClick = () => {
        setError("");
        setSuccess("");
        setCurrentStep('forgot');
        setIsFlipped(true);
        navigate("/forgot-password");
    };

    const handleBackToLoginClick = () => {
        setCurrentStep('login');
        setIsFlipped(false);
        setError("");
        setSuccess("");
        setVerifyError("");
        setVerifySuccess("");
        navigate("/login");
    };

    const handleBackToForgot = () => {
        setCurrentStep('forgot');
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

    // Render Login Form
    const renderLoginForm = () => (
        <div className="w-full h-full">
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="space-y-5">
                <div>
                    <label className="block text-lg mb-1 text-slate-700 font-semibold">Email</label>
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
                    <label className="block text-lg mb-1 text-slate-700 font-semibold">Password</label>
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
                    onClick={handleLoginSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 my-4 sm:my-5 transition-colors text-sm sm:text-base font-medium shadow-lg"
                >
                    Login
                </button>
                <p
                    className="w-full items-center justify-center flex text-white rounded-lg my-4 sm:my-5 hover:text-blue-700 active:text-blue-800 transition-colors text-sm sm:text-base font-medium cursor-pointer"
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Lupa Password</h1>
            <p className="text-gray-600 mb-6">Masukkan email untuk menerima OTP</p>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
                {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? "Mengirim..." : "Kirim OTP"}
                </button>
            </form>
            <button
                onClick={handleBackToLoginClick}
                className="w-full mt-4 text-white hover:text-blue-800 text-sm"
            >
                Kembali ke Login
            </button>
        </div>
    );

    // Render Reset Password Form
    const renderResetPasswordForm = () => (
        <div className="bg-none rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600 mb-4 text-sm">Email: {email}</p>
            <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kode OTP:</label>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-10 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password:</label>
                    <input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {verifyError && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{verifyError}</div>}
                {verifySuccess && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{verifySuccess}</div>}

                <button
                    type="submit"
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? "Memproses..." : "Reset Password"}
                </button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                    Tidak menerima kode?{" "}
                    {canResend ? (
                        <button
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            Kirim ulang OTP
                        </button>
                    ) : (
                        <span className="text-gray-500">Kirim ulang dalam {countdown} detik</span>
                    )}
                </p>
            </div>

            <button
                onClick={handleBackToForgot}
                className="w-full mt-4 text-white hover:text-blue-600 text-sm"
            >
                Kembali
            </button>
        </div>
    );

    return (
        <div className="h-screen flex items-center justify-center bg-linear-to-r from-[#0C2B4E] via-[#1A3D64] to-[#1D546C] p-4">
            <div className="backdrop-blur-xl bg-blue-300 shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4">
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
                        <div className={`flip-container ${isFlipped ? 'flipped' : ''}`}>
                            <div className="flipper">
                                {/* Front - Login atau Reset Password */}
                                <div className="front">
                                    {currentStep === 'login' ? renderLoginForm() : renderResetPasswordForm()}
                                </div>

                                {/* Back - Forgot Password */}
                                <div className="back">
                                    {renderForgotPasswordForm()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}