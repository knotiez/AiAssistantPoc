import React, { useState, useEffect, useRef } from 'react';
import './MetadataProviderSelect.css';

interface Props {
    value: string;
    onChange: (value: string) => void;
    lmStudioUrl: string;
}

const MetadataProviderSelect: React.FC<Props> = ({ value, onChange, lmStudioUrl }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [healthStatus, setHealthStatus] = useState<Record<string, string>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const options = [
        { value: 'RULE_BASED', label: '규칙 기반 (개발자 정의)' },
        { value: 'OPENAI_BASED', label: 'OpenAI' },
        { value: 'LMSTUDIO_BASED', label: 'LM Studio (local)' }
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setHealthStatus({
                RULE_BASED: 'LOADING',
                OPENAI_BASED: 'LOADING',
                LMSTUDIO_BASED: 'LOADING'
            });
            checkHealth();
        }
    }, [isOpen]);

    const checkHealth = async () => {
        try {
            const response = await fetch('/api/health/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lmStudioUrl })
            });
            const data = await response.json();
            setHealthStatus(data);
        } catch (error) {
            console.error(error);
            // On error, mark all as unknown or fail depending on preference
            setHealthStatus({
                RULE_BASED: 'OK', // Rule based is local code, assume OK
                OPENAI_BASED: 'FAIL',
                LMSTUDIO_BASED: 'FAIL'
            });
        }
    };

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    return (
        <div className="metadata-select-container" ref={containerRef}>
            <div
                className="metadata-select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedLabel}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {isOpen ? '▲' : '▼'}
                </span>
            </div>

            {isOpen && (
                <div className="metadata-dropdown">
                    {options.map(option => {
                        const status = healthStatus[option.value];
                        return (
                            <div
                                key={option.value}
                                className={`metadata-option ${value === option.value ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span>{option.label}</span>
                                <div className="status-indicator">
                                    {status === 'LOADING' && <div className="status-spinner" />}
                                    {status === 'OK' && <div className="status-dot success" title="Connection OK" />}
                                    {status && status.startsWith('FAIL') && (
                                        <div className="status-dot fail" title={status} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MetadataProviderSelect;
