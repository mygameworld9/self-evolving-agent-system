import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import Typewriter from './Typewriter';

const ExpandableText = ({ text, isTyping, onTypingComplete, startTime }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Initialize showFullText based on isTyping to avoid flash of typing animation
    const [showFullText, setShowFullText] = useState(!isTyping);
    const maxLength = 300; // Characters to show before truncation

    if (!text) return null;

    const shouldTruncate = text.length > maxLength;

    useEffect(() => {
        if (!isTyping) {
            setShowFullText(true);
        } else {
            setShowFullText(false);
        }
    }, [isTyping]);

    if (isTyping && !showFullText) {
        return (
            <div className="expandable-text typing">
                <Typewriter
                    text={text}
                    onComplete={() => {
                        setShowFullText(true);
                        if (onTypingComplete) onTypingComplete();
                    }}
                    startTime={startTime}
                />
            </div>
        );
    }

    // If not typing, or typing is complete (showFullText is true), we handle truncation
    if (!shouldTruncate || showFullText) {
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
