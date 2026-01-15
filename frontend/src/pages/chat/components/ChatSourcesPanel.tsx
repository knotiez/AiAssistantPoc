import { useState, useEffect } from 'react';
import { MdRefresh, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import './ChatSourcesPanel.css';

// RAG 소스 타입 정의
interface RagSource {
    filePath: string;
    title: string;
    docType: string;
    updatedAt: string;
    chunkCount: number;
}

/**
 * ChatSourcesPanel 컴포넌트 - 채팅 페이지 전용 출처 패널
 * 
 * 기능:
 * - RAG에 저장된 파일 목록 표시 (읽기 전용)
 * - 목록 새로고침 기능
 * 
 * SourcesPanel과의 차이점:
 * - 새로고침 버튼만 제공
 * 
 * 상태:
 * - ragSources: RAG에 저장된 파일 목록
 */
export const ChatSourcesPanel = () => {
    // 패널 접힘 상태 관리 (기본값: false = 펼쳐진 상태)
    const [isCollapsed, setIsCollapsed] = useState(false);

    // RAG에 저장된 파일 목록
    const [ragSources, setRagSources] = useState<RagSource[]>([]);

    // RAG 소스 목록 가져오기
    const fetchRagSources = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/ingest/sources');
            const data = await response.json();
            if (data.success) {
                setRagSources(data.sources);
            }
        } catch (error) {
            console.error('RAG 소스 로드 실패:', error);
        }
    };

    // 컴포넌트 마운트 시 RAG 소스 목록 로드
    useEffect(() => {
        fetchRagSources();
    }, []);

    return (
        <div className={`chat-sources-panel panel ${isCollapsed ? 'collapsed' : ''}`}>
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>출처</h2>

                <div className="panel-header-actions">
                    {/* 새로고침 버튼 */}
                    {!isCollapsed && (
                        <button
                            className="btn-refresh"
                            onClick={fetchRagSources}
                            title="목록 새로고침"
                        >
                            <MdRefresh size={20} />
                        </button>
                    )}

                    {/* 접기/펼치기 버튼 */}
                    <button
                        className="btn-collapse"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? '펼치기' : '접기'}
                    >
                        {isCollapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
                    </button>
                </div>
            </div>

            {/* 패널 본문: 접힌 상태가 아닐 때만 표시 */}
            {!isCollapsed && (
                <div className="panel-body">
                    {/* RAG 저장된 파일 헤더 */}
                    <div className="rag-sources-header">
                        <span className="rag-sources-title">📚 RAG에 저장된 파일</span>
                        <span className="rag-file-count">{ragSources.length}개</span>
                    </div>

                    {/* RAG 저장된 파일 목록 */}
                    <div className="rag-sources-content">
                        {
                            ragSources.length > 0 ? (
                                <div className="rag-sources-list">
                                    {ragSources.map((source, index) => (
                                        <div key={index} className="rag-source-item">
                                            <div className="rag-source-main">
                                                <span className="file-icon">📄</span>
                                                <span className="rag-file-name" title={source.title}>
                                                    {source.title}
                                                </span>
                                                <span className="rag-chunk-count">
                                                    {source.chunkCount} chunks
                                                </span>
                                                <span>•</span>
                                                <span className="rag-updated-date">
                                                    {source.updatedAt}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rag-sources-empty">
                                    저장된 파일이 없습니다
                                </div>
                            )
                        }
                    </div>
                </div>
            )}
        </div>
    );
};