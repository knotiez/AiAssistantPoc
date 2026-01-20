import React, { useRef, useState, useLayoutEffect } from 'react';

interface CollapsibleOverlayProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

const CollapsibleOverlay: React.FC<CollapsibleOverlayProps> = ({ title, isOpen, onToggle, children, style }) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [direction, setDirection] = useState<'down' | 'up'>('down');

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // 오버레이 예상 최대 높이 (CSS max-height: 400px)
            const ESTIMATED_HEIGHT = 400;

            if (spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow) {
                setDirection('up');
            } else {
                setDirection('down');
            }
        }
    }, [isOpen]);

    return (
        <div className="collapsible-section" style={{ position: 'relative', ...style }}>
            <button
                ref={buttonRef}
                className="collapsible-header"
                onClick={onToggle}
            >
                {title} {isOpen ? '▼' : '▶'}
            </button>
            {isOpen && (
                <div
                    className="overlay-settings"
                    style={direction === 'up'
                        ? { bottom: '100%', top: 'auto', marginBottom: '0.5rem', marginTop: 0 }
                        : { top: '100%', bottom: 'auto', marginTop: '0.5rem', marginBottom: 0 }
                    }
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default CollapsibleOverlay;
