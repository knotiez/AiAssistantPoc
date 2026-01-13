import { useState } from 'react';
import './StudioPanel.css';

interface StudioPanelProps {
    ragData: {
        chunks: any[];
        fullPrompt: string;
        pipelineInfo?: {
            metadataStrategy: string;
            metadataModel: string;
            chunkingStrategy: string;
            embeddingStrategy: string;
            embeddingModel: string;
            vectorStoreStrategy: string;
            chatModel: string;
            chatRetrievalCount: number;
            chatSimilarityThreshold: number;
        };
    } | null;
}

export const StudioPanel = ({ ragData }: StudioPanelProps) => {
    const [activeTab, setActiveTab] = useState<'chunks' | 'prompt' | 'info'>('chunks');

    return (
        <div className="studio-panel panel">
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>RAG 인스펙터</h2>
            </div>

            {/* 패널 본문 */}
            <div className="panel-body">
                {/* 탭 네비게이션 */}
                <div className="studio-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'chunks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chunks')}
                    >
                        Retrieved Chunks
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'prompt' ? 'active' : ''}`}
                        onClick={() => setActiveTab('prompt')}
                    >
                        Full Prompt
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                        onClick={() => setActiveTab('info')}
                    >
                        API Info
                    </button>
                </div>

                {/* 탭 컨텐츠 */}
                <div className="studio-content">
                    {!ragData ? (
                        <div className="inspector-empty">
                            <div className="icon">🔍</div>
                            <p>채팅 답변이 생성되면<br />여기에 RAG 데이터가 표시됩니다.</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'chunks' && (
                                <div className="chunks-list">
                                    {ragData.chunks.length === 0 ? (
                                        <p className="inspector-empty">조회된 청크가 없습니다.</p>
                                    ) : (
                                        ragData.chunks.map((res: any, index: number) => (
                                            <div key={index} className="chunk-item">
                                                <div className="chunk-header">
                                                    <span className="chunk-source">📄 {res.chunk.metadata.title}</span>
                                                    <span className="chunk-score">Score: {(res.score * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="chunk-text">
                                                    {res.chunk.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'prompt' && (
                                <div className="prompt-viewer">
                                    <pre className="prompt-container">
                                        {ragData.fullPrompt}
                                    </pre>
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="pipeline-info">
                                    <h3 className="info-group-title">Metadata & Ingestion</h3>
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <div className="info-label">Metadata Strategy</div>
                                            <div className="info-value">{ragData.pipelineInfo?.metadataStrategy}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Metadata Model</div>
                                            <div className="info-value">{ragData.pipelineInfo?.metadataModel}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Chunking Strategy</div>
                                            <div className="info-value">{ragData.pipelineInfo?.chunkingStrategy}</div>
                                        </div>
                                    </div>

                                    <h3 className="info-group-title">Embedding & Vector DB</h3>
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <div className="info-label">Embedding Strategy</div>
                                            <div className="info-value">{ragData.pipelineInfo?.embeddingStrategy}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Embedding Model</div>
                                            <div className="info-value">{ragData.pipelineInfo?.embeddingModel}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Vector DB Strategy</div>
                                            <div className="info-value">{ragData.pipelineInfo?.vectorStoreStrategy}</div>
                                        </div>
                                    </div>

                                    <h3 className="info-group-title">Chat & Retrieval</h3>
                                    <div className="info-grid">
                                        <div className="info-card">
                                            <div className="info-label">Chat AI Model</div>
                                            <div className="info-value">{ragData.pipelineInfo?.chatModel}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Retrieval Count (Top-K)</div>
                                            <div className="info-value">{ragData.pipelineInfo?.chatRetrievalCount}</div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-label">Similarity Threshold</div>
                                            <div className="info-value">{ragData.pipelineInfo?.chatSimilarityThreshold}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
