import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ToggleButtonExit({ isOpen, setIsOpen }) {
    const handleClick = () => {
        setIsOpen((prev) => !prev);
    };

    const texts = isOpen ? ["Close"] : ["Menu"];

    return (
        <button
            onClick={handleClick}
            className="flex items-center px-3 py-2 bg-gray-300 text-black rounded-xl overflow-hidden relative"
        >
            <motion.div
                key={isOpen ? "icon-close" : "icon-menu"}
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
            <div className="overflow-hidden relative h-6">
                <AnimatePresence>
                    {texts.map((text, idx) => (
                        <motion.span
                            key={text}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{
                                delay: idx * 0.1,
                                duration: 0.3
                            }}
                            className="absolute left-0 right-0 text-right font-semibold"
                        >
                            {text}
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>
        </button>
    );
}
