import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed = 10, onComplete, startTime: propStartTime }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        const startTime = propStartTime || Date.now();
        let timer = null;

        const updateText = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const charCount = Math.floor(elapsed / speed);

            if (charCount < text.length) {
                setDisplayedText(text.substring(0, charCount + 1));
            } else {
                setDisplayedText(text);
                if (timer) clearInterval(timer);
                if (onComplete) onComplete();
            }
        };

        // Run immediately
        updateText();

        // Set interval for updates
        timer = setInterval(updateText, speed);

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [text, speed]);

    return <span>{displayedText}</span>;
};

export default Typewriter;
