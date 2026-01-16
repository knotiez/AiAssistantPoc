import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import ApiKeyModal from './components/ApiKeyModal';
import CollapsibleOverlay from './components/CollapsibleOverlay';
import MetadataProviderSelect from './components/MetadataProviderSelect';

interface RagConfig {
    // API Keys
    openAiApiKeyEncrypted: string;
    unstructuredApiKeyEncrypted: string;

    // URLs
    unstructuredApiUrl: string;
    chromaUrl: string;
    chromaCollectionName: string;
    lmStudioApiUrl: string;

    // Metadata
    metadataStrategy: string;
    metadataAiModel: string;
    metadataLmStudioModel: string;
    metadataSystemPrompt: string;

    // Chunking
    chunkingStrategy: string;
    unstructuredMaxCharacters: number;
    unstructuredChunkingStrategy: string;
    unstructuredOverlap: number;
    chunkingLmStudioModel: string;

    // Embedding
    embeddingStrategy: string;
    embeddingOpenAiModel: string;
    embeddingLmStudioModel: string;

    // Vector Store
    vectorStoreStrategy: string;

    // Chat
    chatOpenAiModel: string;
    chatLmStudioModel: string;
    chatTemperature: number;
    chatRetrievalCount: number;
    chatSimilarityThreshold: number;
    chatSystemPrompt: string;
    maxContextLength: number;
}

const SettingsPage: React.FC = () => {
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [config, setConfig] = useState<RagConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showMetadataPrompt, setShowMetadataPrompt] = useState(false);
    const [showChatPrompt, setShowChatPrompt] = useState(false);
    const [showChatDetailSettings, setShowChatDetailSettings] = useState(false);
    const [showUnstructuredOptions, setShowUnstructuredOptions] = useState(false);
    const [showLmStudioChunkingOptions, setShowLmStudioChunkingOptions] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

    // API 키 마스킹 함수 (처음 4자 + ... + 마지막 4자)
    const maskApiKey = (key: string | null): string => {
        if (!key || key.length < 8) return key || '';
        const first4 = key.substring(0, 4);
        const last4 = key.substring(key.length - 4);
        return `${first4}...${last4}`;
    };

    // Exclusive Toggle Handlers
    const toggleChatDetail = () => {
        if (!showChatDetailSettings) setShowChatPrompt(false);
        setShowChatDetailSettings(!showChatDetailSettings);
    };

    const toggleChatPrompt = () => {
        if (!showChatPrompt) setShowChatDetailSettings(false);
        setShowChatPrompt(!showChatPrompt);
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        setSaving(true);
        try {
            const response = await fetch('/api/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (response.ok) {
                showToast('저장이 완료 되었습니다', 'success');
            } else {
                showToast('Failed to save configuration', 'error');
            }
        } catch (error) {
            console.error('Failed to save config:', error);
            showToast('Failed to save configuration', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (field: keyof RagConfig, value: any) => {
        if (!config) return;
        setConfig({ ...config, [field]: value });
    };

    const handleApiKeySave = async (openAiKey: string, unstructuredKey: string) => {
        if (!config) return;

        // 평문 API 키를 직접 설정 (백엔드에서 암호화)
        const updatedConfig = {
            ...config,
            openAiApiKeyEncrypted: openAiKey,
            unstructuredApiKeyEncrypted: unstructuredKey
        };

        const response = await fetch('/api/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedConfig)
        });

        if (!response.ok) {
            throw new Error('API 키 저장에 실패했습니다');
        }

        // 저장 성공 후 설정 다시 로드
        await loadConfig();
    };

    const getMetadataModelOptions = () => {
        if (config?.metadataStrategy === 'OPENAI_BASED') {
            return [
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
                { value: 'gpt-4o', label: 'GPT-4o (Best)' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' }
            ];
        } else if (config?.metadataStrategy === 'LMSTUDIO_BASED') {
            return [
                { value: 'qwen2.5-7b-instruct-1m', label: 'Qwen 2.5 7B Instruct' },
                { value: 'qwen2.5-vl-3b-instruct', label: 'Qwen 2.5 VL 3B' }
            ];
        }
        return [];
    };

    const getEmbeddingModelOptions = () => {
        if (config?.embeddingStrategy === 'OPENAI') {
            return [
                { value: 'text-embedding-3-small', label: 'text-embedding-3-small (Recommended)' },
                { value: 'text-embedding-3-large', label: 'text-embedding-3-large (High Quality)' },
                { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002 (Legacy)' }
            ];
        } else {
            return [
                { value: 'nomic-embed-text', label: 'nomic-embed-text' },
                { value: 'bge-m3', label: 'bge-m3' }
            ];
        }
    };

    if (loading) {
        return <div className="settings-loading">설정을 불러오는 중...</div>;
    }

    if (!config) {
        return <div className="settings-error">설정을 불러오는데 실패했습니다</div>;
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>⚙️ RAG Setting</h1>
                <button
                    className="save-button"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? '저장 중...' : '설정 저장'}
                </button>
            </div>

            <div className="settings-content">
                {/* API Keys Section */}
                <section className="settings-section">
                    <h2>API Key</h2>
                    <div className="form-group">
                        <label>OpenAI API</label>
                        <input
                            type="text"
                            value={maskApiKey(config.openAiApiKeyEncrypted)}
                            readOnly
                            placeholder="설정되지 않음"
                            style={{ cursor: 'not-allowed', backgroundColor: 'var(--surface-variant)' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Unstructured API (선택사항)</label>
                        <input
                            type="text"
                            value={maskApiKey(config.unstructuredApiKeyEncrypted)}
                            readOnly
                            placeholder="설정되지 않음"
                            style={{ cursor: 'not-allowed', backgroundColor: 'var(--surface-variant)' }}
                        />
                    </div>
                    <button
                        className="edit-api-key-button"
                        onClick={() => setIsApiKeyModalOpen(true)}
                    >
                        🔑 API 키 설정
                    </button>
                </section>

                {/* Metadata Extraction Section */}
                <section className="settings-section" style={{ position: 'relative', zIndex: showMetadataPrompt ? 20 : 1 }}>
                    <h2>메타데이터 생성</h2>
                    <div className="form-group">
                        <label>제공자</label>
                        <MetadataProviderSelect
                            value={config.metadataStrategy}
                            onChange={(val) => updateConfig('metadataStrategy', val)}
                            lmStudioUrl={config.lmStudioApiUrl}
                        />
                    </div>

                    {config.metadataStrategy !== 'RULE_BASED' && (
                        <div className="form-group">
                            <label>모델</label>
                            <select
                                value={config.metadataStrategy === 'OPENAI_BASED' ? config.metadataAiModel : config.metadataLmStudioModel}
                                onChange={(e) => updateConfig(
                                    config.metadataStrategy === 'OPENAI_BASED' ? 'metadataAiModel' : 'metadataLmStudioModel',
                                    e.target.value
                                )}
                            >
                                {getMetadataModelOptions().map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {config.metadataStrategy !== 'RULE_BASED' && (
                        <CollapsibleOverlay
                            title="⚙️ 시스템 프롬프트 설정"
                            isOpen={showMetadataPrompt}
                            onToggle={() => setShowMetadataPrompt(!showMetadataPrompt)}
                        >
                            <div className="form-group">
                                <textarea
                                    value={config.metadataSystemPrompt}
                                    onChange={(e) => updateConfig('metadataSystemPrompt', e.target.value)}
                                    rows={4}
                                    placeholder="Configure system prompt for metadata extraction..."
                                />
                            </div>
                        </CollapsibleOverlay>
                    )}
                </section>

                {/* Chunking Strategy Section */}
                <section className="settings-section" style={{ position: 'relative', zIndex: (showUnstructuredOptions || showLmStudioChunkingOptions) ? 20 : 1 }}>
                    <h2>Chunking 전략</h2>
                    <div className="radio-group">
                        <label className="radio-option">
                            <input
                                type="radio"
                                value="MARKDOWN"
                                checked={config.chunkingStrategy === 'MARKDOWN'}
                                onChange={(e) => updateConfig('chunkingStrategy', e.target.value)}
                            />
                            <div>
                                <strong>Markdown</strong>
                                <p>빠른 헤딩 기반 분할 ( .MD 파일에 적합)</p>
                            </div>
                        </label>
                        <label className="radio-option">
                            <input
                                type="radio"
                                value="UNSTRUCTURED"
                                checked={config.chunkingStrategy === 'UNSTRUCTURED'}
                                onChange={(e) => updateConfig('chunkingStrategy', e.target.value)}
                            />
                            <div>
                                <strong>Unstructured.io</strong>
                                <p>AI 기반 의미론적 chunking</p>
                            </div>
                        </label>

                        {/* Unstructured.io Options */}
                        {config.chunkingStrategy === 'UNSTRUCTURED' && (
                            <CollapsibleOverlay
                                title="⚙️ Unstructured 상세 설정"
                                isOpen={showUnstructuredOptions}
                                onToggle={() => setShowUnstructuredOptions(!showUnstructuredOptions)}
                            >
                                <div className="form-group">
                                    <label>Max Characters: {config.unstructuredMaxCharacters}</label>
                                    <input
                                        type="range"
                                        min="500"
                                        max="3000"
                                        step="100"
                                        value={config.unstructuredMaxCharacters}
                                        onChange={(e) => updateConfig('unstructuredMaxCharacters', parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Chunking Strategy</label>
                                    <select
                                        value={config.unstructuredChunkingStrategy}
                                        onChange={(e) => updateConfig('unstructuredChunkingStrategy', e.target.value)}
                                    >
                                        <option value="by_title">By Title</option>
                                        <option value="basic">Basic</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Overlap: {config.unstructuredOverlap}</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="50"
                                        value={config.unstructuredOverlap}
                                        onChange={(e) => updateConfig('unstructuredOverlap', parseInt(e.target.value))}
                                    />
                                </div>
                            </CollapsibleOverlay>
                        )}
                        <label className="radio-option">
                            <input
                                type="radio"
                                value="LMSTUDIO"
                                checked={config.chunkingStrategy === 'LMSTUDIO'}
                                onChange={(e) => updateConfig('chunkingStrategy', e.target.value)}
                            />
                            <div>
                                <strong>LM Studio</strong>
                                <p>로컬 AI 기반 의미론적 chunking</p>
                            </div>
                        </label>

                        {/* LM Studio Chunking Options */}
                        {config.chunkingStrategy === 'LMSTUDIO' && (
                            <CollapsibleOverlay
                                title="⚙️ LM Studio 모델 설정"
                                isOpen={showLmStudioChunkingOptions}
                                onToggle={() => setShowLmStudioChunkingOptions(!showLmStudioChunkingOptions)}
                            >
                                <div className="form-group">
                                    <label>모델</label>
                                    <select
                                        value={config.chunkingLmStudioModel || ''}
                                        onChange={(e) => updateConfig('chunkingLmStudioModel', e.target.value)}
                                    >
                                        <option value="qwen2.5-7b-instruct-1m">Qwen 2.5 7B Instruct</option>
                                        <option value="qwen2.5-vl-3b-instruct">Qwen 2.5 VL 3B</option>
                                    </select>
                                </div>
                            </CollapsibleOverlay>
                        )}
                    </div>


                </section>

                {/* Embedding Section */}
                <section className="settings-section">
                    <h2>Embedding</h2>
                    <div className="form-group">
                        <label>제공자</label>
                        <select
                            value={config.embeddingStrategy}
                            onChange={(e) => updateConfig('embeddingStrategy', e.target.value)}
                        >
                            <option value="OPENAI">OpenAI</option>
                            <option value="LMSTUDIO">LM Studio (Local)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>모델</label>
                        <select
                            value={config.embeddingStrategy === 'OPENAI' ? config.embeddingOpenAiModel : config.embeddingLmStudioModel}
                            onChange={(e) => updateConfig(
                                config.embeddingStrategy === 'OPENAI' ? 'embeddingOpenAiModel' : 'embeddingLmStudioModel',
                                e.target.value
                            )}
                        >
                            {getEmbeddingModelOptions().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Vector Store Section */}
                <section className="settings-section">
                    <h2>Vector Store</h2>
                    <div className="form-group">
                        <label>유형</label>
                        <select
                            value={config.vectorStoreStrategy}
                            onChange={(e) => updateConfig('vectorStoreStrategy', e.target.value)}
                        >
                            <option value="MEMORY">로컬 메모리 기반(테스트)</option>
                            <option value="CHROMA">ChromaDB</option>
                        </select>
                    </div>

                    {config.vectorStoreStrategy === 'CHROMA' && (
                        <>
                            <div className="form-group">
                                <label>ChromaDB URL</label>
                                <input
                                    type="text"
                                    value={config.chromaUrl}
                                    onChange={(e) => updateConfig('chromaUrl', e.target.value)}
                                    placeholder="http://localhost:8000"
                                />
                            </div>
                            <div className="form-group">
                                <label>컬렉션 이름</label>
                                <input
                                    type="text"
                                    value={config.chromaCollectionName}
                                    onChange={(e) => updateConfig('chromaCollectionName', e.target.value)}
                                    placeholder="rag_collection"
                                />
                            </div>
                        </>
                    )}
                </section>

                {/* Chat & Retrieval Section */}
                <section className="settings-section" style={{ position: 'relative', zIndex: (showChatDetailSettings || showChatPrompt) ? 20 : 1 }}>
                    <h2>채팅 및 검색</h2>
                    <div className="form-group">
                        <label>LLM 모델</label>
                        <select
                            value={config.chatOpenAiModel}
                            onChange={(e) => updateConfig('chatOpenAiModel', e.target.value)}
                        >
                            <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                            <option value="gpt-4o">GPT-4o (Best)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
                    </div>

                    <CollapsibleOverlay
                        title="⚙️ 채팅 상세 설정"
                        isOpen={showChatDetailSettings}
                        onToggle={toggleChatDetail}
                    >
                        <div className="form-group">
                            <label>{`Temperature: ${config.chatTemperature.toFixed(1)}  (0 - 보수적, 1 - 창의적)`}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.chatTemperature}
                                onChange={(e) => updateConfig('chatTemperature', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="form-group">
                            <label>최대 컨텍스트 길이</label>
                            <input
                                type="number"
                                value={config.maxContextLength}
                                onChange={(e) => updateConfig('maxContextLength', parseInt(e.target.value))}
                                min="500"
                                max="8000"
                            />
                        </div>

                        <div className="form-group">
                            <label>검색 chunk 개수: {config.chatRetrievalCount}</label>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={config.chatRetrievalCount}
                                onChange={(e) => updateConfig('chatRetrievalCount', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="form-group">
                            <label>유사도 임계값: {config.chatSimilarityThreshold.toFixed(2)}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={config.chatSimilarityThreshold}
                                onChange={(e) => updateConfig('chatSimilarityThreshold', parseFloat(e.target.value))}
                            />
                        </div>
                    </CollapsibleOverlay>

                    <CollapsibleOverlay
                        title="⚙️ 시스템 프롬프트"
                        isOpen={showChatPrompt}
                        onToggle={toggleChatPrompt}
                    >
                        <div className="form-group">
                            <textarea
                                value={config.chatSystemPrompt}
                                onChange={(e) => updateConfig('chatSystemPrompt', e.target.value)}
                                rows={4}
                                placeholder="You are a helpful assistant..."
                            />
                        </div>
                    </CollapsibleOverlay>
                </section>
            </div>

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '⚠️'}
                    {toast.message}
                </div>
            )}

            {/* API 키 입력 모달 */}
            <ApiKeyModal
                isOpen={isApiKeyModalOpen}
                onClose={() => setIsApiKeyModalOpen(false)}
                onSave={handleApiKeySave}
            />
        </div>
    );
};

export default SettingsPage;
