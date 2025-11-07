import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, DoorClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (isClicked) return;
        setIsClicked(true);
        setTimeout(() => {
            sessionStorage.removeItem("token");
            navigate("/login");
        }, 1200);
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isClicked}
            className="relative w-50 h-13 bg-gray-800 text-white font-semibold rounded-2xl overflow-hidden flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-300"
        >
            <span
                className={`transition-all duration-300 ${isClicked ? "opacity-0" : "opacity-100"
                    }`}
            >
                Logout
            </span>

            <motion.div
                className="absolute left-5 flex items-center"
                initial={{ x: 0 }}
                animate={{ x: isClicked ? 150 : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            >
                <AnimatePresence mode="wait">
                    {!isClicked ? (
                        <motion.div
                            key="open"
                            initial={{ rotateY: 0 }}
                            exit={{ rotateY: 90, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DoorOpen size={26} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="closed"
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DoorClosed size={26} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isClicked ? "0%" : "-100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 bg-linear-to-r from-red-500 to-orange-500 z-[-1]"
            />
        </button>
    );
}
