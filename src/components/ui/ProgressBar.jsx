import { useEffect, useState } from "react";

export default function ProgressBar({ progress = 0 }) {
    const [width, setWidth] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(progress);
        }, 200);
        return () => clearTimeout(timer);
    }, [progress]);

    useEffect(() => {
        if (progress === 0) {
            setDisplayProgress(0);
            return;
        }
        const duration = 1000;
        const steps = 60; 
        const increment = progress / steps;
        const stepDuration = duration / steps;
        let currentStep = 0;
        const counter = setInterval(() => {
            currentStep++;
            const newValue = Math.min(increment * currentStep, progress);
            setDisplayProgress(Math.round(newValue));
            if (currentStep >= steps) {
                clearInterval(counter);
                setDisplayProgress(progress);
            }
        }, stepDuration);

        return () => clearInterval(counter);
    }, [progress]);

    return (
        <div className="relative w-full h-[2.5vh] bg-gray-300 rounded-full overflow-hidden">
            <div
                className="h-full bg-blue-400 transition-all duration-1000 ease-out"
                style={{ width: `${width}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-end pr-2">
                <span
                    className="text-xs font-semibold"
                    style={{
                        color: width > 15 ? 'black' : '#374151'
                    }}
                >
                    {displayProgress}%
                </span>
            </div>
        </div>
    );
}