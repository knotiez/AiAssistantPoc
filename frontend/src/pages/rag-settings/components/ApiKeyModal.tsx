import React, { useState, useEffect } from 'react';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (openAiKey: string, unstructuredKey: string) => Promise<void>;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
    const [openAiKey, setOpenAiKey] = useState('');
    const [unstructuredKey, setUnstructuredKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // 모달이 닫힐 때 입력값 즉시 클리어 (보안)
    useEffect(() => {
        if (!isOpen) {
            setOpenAiKey('');
            setUnstructuredKey('');
            setError('');
        }
    }, [isOpen]);

    const handleSave = async () => {
        // 최소 검증
        if (!openAiKey.trim()) {
            setError('OpenAI API 키는 필수입니다');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await onSave(openAiKey, unstructuredKey);

            // 저장 성공 후 즉시 메모리에서 제거 (보안)
            setOpenAiKey('');
            setUnstructuredKey('');

            onClose();
        } catch (err: any) {
            setError(err.message || 'API 키 저장에 실패했습니다');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // 취소 시에도 입력값 즉시 클리어 (보안)
        setOpenAiKey('');
        setUnstructuredKey('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🔐 API 키 설정</h2>
                    <button className="close-button" onClick={handleCancel}>×</button>
                </div>

                <div className="modal-body">
                    <div className="modal-info">
                        <p>⚠️ API 키는 암호화되어 안전하게 저장됩니다</p>
                        <p>입력 후 즉시 메모리에서 제거되며, 저장된 키는 마스킹되어 표시됩니다</p>
                    </div>

                    <div className="form-group">
                        <label>OpenAI API 키 *</label>
                        <input
                            type="password"
                            value={openAiKey}
                            onChange={(e) => setOpenAiKey(e.target.value)}
                            placeholder="sk-p..."
                            autoComplete="off"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                        <small>채팅 및 메타데이터 추출에 사용됩니다</small>
                    </div>

                    <div className="form-group">
                        <label>Unstructured API 키 (선택사항)</label>
                        <input
                            type="password"
                            value={unstructuredKey}
                            onChange={(e) => setUnstructuredKey(e.target.value)}
                            placeholder="선택사항"
                            autoComplete="off"
                            data-lpignore="true"
                            data-form-type="other"
                        />
                        <small>Unstructured 청킹 전략 사용 시 필요합니다</small>
                    </div>

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className="cancel-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        취소
                    </button>
                    <button
                        className="save-button"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? '저장 중...' : 'API 키 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
