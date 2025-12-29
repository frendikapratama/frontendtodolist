import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function untuk animasi yang smooth
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
            setCount(Math.floor(value * easeOutQuart));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(value);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{count}</span>;
};

export default AnimatedNumber;