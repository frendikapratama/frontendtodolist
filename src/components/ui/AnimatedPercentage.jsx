import { useEffect, useState } from "react";

const AnimatedPercentage = ({ target = 75 }) => {
    const [value, setValue] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();
        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const result = Math.floor(progress * target);
            setValue(result);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target]);

    return (
        <div className="text-xl font-bold text-teal-600 drop-shadow-sm">
            {value}%
        </div>
    );
};

export default AnimatedPercentage;
