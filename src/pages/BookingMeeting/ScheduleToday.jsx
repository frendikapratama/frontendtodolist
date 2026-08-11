import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/LogoPlanify.png";
import GradientText from "../../components/ui/GradientText";
import toast from "react-hot-toast";
import TableMeeting from "./MeetingManagement/TableMeeting";
import TableMeetingToday from "./MeetingManagement/Tablemeetingtoday";
import dayjs from "dayjs";
import {
  Calendar,
  Clock,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function ScheduleToday() {
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
  const [time, setTime] = useState(dayjs().format("HH:mm:ss"));
  const navigate = useNavigate();
  const location = useLocation();

  // Handlers untuk OTP input

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      handleLoginSubmit(e);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex items-center justify-center bg-linear-to-tl from-[#1A3D64] to-[#1D546C] p-4 relative select-none">
      {/* Background Neon Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-400/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <h1 className="fixed bottom-4 right-4 text-xs text-blue-300 z-50">
        © 2026 Developed by IT Aldo | PT. Alkindo Naratama Tbk. | All rights
        reserved.
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
              {time}
            </span>
          </div>
        </div>

        {/* Content Body Layout */}
        <div className="flex flex-col lg:flex-row gap-6 px-2 pt-4 grow overflow-hidden h-full items-stretch">
          {/* Kiri: Today's Meetings */}
          <div className="grow flex-1 rounded-2xl  p-1 overflow-hidden h-full flex flex-col  m-0">
            <TableMeetingToday compact />
          </div>
        </div>
      </div>
    </div>
  );
}
