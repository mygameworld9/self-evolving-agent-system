import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import Typewriter from './Typewriter';

const ExpandableText = ({ text, isTyping, onTypingComplete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 300; // Characters to show before truncation
    const shouldTruncate = text.length > maxLength;

    // If typing, we show the Typewriter component
    // We don't truncate while typing to avoid jumping, or we could, but let's keep it simple first.
    // Actually, for typing, we usually want to see it all or auto-scroll.
    // Let's wrap the Typewriter result in this logic? No, Typewriter generates text over time.
    // So we should probably just let Typewriter do its thing, and THEN apply truncation if needed?
    // Or, we can just let Typewriter run, and if it gets long, it just grows.
    // But the user said "current streaming cuts off" which implies overflow:hidden or similar.

    // If isTyping is true, we just render Typewriter.
    if (isTyping) {
        return (
            <div className="expandable-text typing">
                <Typewriter text={text} speed={15} onComplete={onTypingComplete} />
            </div>
        );
    }

    // If not typing, we handle truncation
    if (!shouldTruncate) {
        return <div className="expandable-text">{text}</div>;
    }

    return (
        <div className={`expandable-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="text-content">
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </div>
            <button
                className="expand-btn"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ? (
                    <><ChevronUp size={14} /> Show Less</>
                ) : (
                    <><Maximize2 size={14} /> Show Full Text ({text.length} chars)</>
                )}
            </button>
        </div>
    );
};

export default ExpandableText;
