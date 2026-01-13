import { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './RAGPanel.css';

/**
 * RAGPanel 컴포넌트 - RAG 처리된 문서 목록 패널
 * 
 * 기능:
 * - 접기/펼치기 기능 (320px ↔ 120px)
 * - RAG 처리된 문서 목록 표시
 * 
 * 상태:
 * - isCollapsed: 패널 접힘 여부 (boolean)
 * - ragDocuments: RAG 처리된 문서 목록 (임시 데이터)
 */
export const RAGPanel = () => {
    // 패널 접힘 상태 관리
    const [isCollapsed, setIsCollapsed] = useState(false);

    // 임시 RAG 문서 데이터 (나중에 실제 API에서 가져올 데이터)
    const [ragDocuments] = useState([
        { id: 1, name: 'document1.md', chunks: 15, embeddings: 15 },
        { id: 2, name: 'document2.txt', chunks: 23, embeddings: 23 },
        { id: 3, name: 'document3.pdf', chunks: 45, embeddings: 45 },
    ]);

    return (
        <div className={`rag-panel panel ${isCollapsed ? 'collapsed' : ''}`}>
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>RAG</h2>

                {/* 접기/펼치기 버튼 */}
                <button
                    className="btn-collapse"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? '펼치기' : '접기'}
                >
                    {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                </button>
            </div>

            {/* 패널 본문: 접힌 상태가 아닐 때만 표시 */}
            {!isCollapsed && (
                <div className="panel-body">
                    {/* RAG 문서 목록 */}
                    {ragDocuments.length > 0 ? (
                        <div className="rag-list">
                            <div className="rag-list-header">
                                <span className="doc-count">{ragDocuments.length}개 문서</span>
                            </div>
                            <div className="rag-list-items">
                                {ragDocuments.map((doc) => (
                                    <div key={doc.id} className="rag-item">
                                        <span className="doc-icon">📚</span>
                                        <div className="doc-info">
                                            <span className="doc-name">{doc.name}</span>
                                            <span className="doc-meta">
                                                {doc.chunks} chunks · {doc.embeddings} embeddings
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rag-empty">
                            <p className="empty-text">RAG 문서가 없습니다</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
