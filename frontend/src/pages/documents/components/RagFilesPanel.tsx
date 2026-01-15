import { useState, useEffect } from 'react';
import { MdRefresh, MdDelete } from 'react-icons/md';
import './RagFilesPanel.css';

// RAG 소스 타입 정의
interface RagSource {
    filePath: string;
    title: string;
    docType: string;
    updatedAt: string;
    chunkCount: number;
}

/**
 * RagFilesPanel 컴포넌트 - RAG 파일 관리 패널 (문서 관리 페이지 오른쪽)
 * 
 * 기능:
 * - RAG에 저장된 파일 목록 표시
 * - 목록 새로고침
 * - 전체 파일 삭제
 * 
 * Props:
 * - refreshTrigger: 외부에서 새로고침을 트리거하기 위한 값
 */

interface RagFilesPanelProps {
    refreshTrigger?: number;
}

export const RagFilesPanel = ({ refreshTrigger }: RagFilesPanelProps) => {
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

    // RAG 소스 목록 삭제
    const deleteAllRagSources = async () => {
        const confirmed = window.confirm('모든 RAG 파일을 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            const response = await fetch('http://localhost:3000/api/ingest/DeleteAll', {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                alert('모든 RAG 파일이 삭제되었습니다.');
                await fetchRagSources();
            } else {
                alert('삭제 실패: ' + data.message);
            }
        } catch (error) {
            console.error('RAG 소스 삭제 실패:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    // 컴포넌트 마운트 시 RAG 소스 목록 로드
    useEffect(() => {
        fetchRagSources();
    }, []);

    // refreshTrigger가 변경되면 목록 새로고침
    useEffect(() => {
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            fetchRagSources();
        }
    }, [refreshTrigger]);

    return (
        <div className="rag-files-panel panel">
            {/* 패널 헤더 */}
            <div className="panel-header">
                <h2>RAG에 저장된 파일</h2>

                <div className="panel-header-actions">
                    {/* 새로고침 버튼 */}
                    <button
                        className="btn-refresh"
                        onClick={fetchRagSources}
                        title="목록 새로고침"
                    >
                        <MdRefresh size={20} />
                    </button>

                    {/* 전체 삭제 버튼 */}
                    <button
                        className="btn-delete-all"
                        onClick={deleteAllRagSources}
                        title="전체 삭제"
                    >
                        <MdDelete size={20} />
                    </button>
                </div>
            </div>

            {/* 패널 본문 */}
            <div className="panel-body">
                {/* RAG 파일 헤더 */}
                <div className="rag-files-header">
                    <span className="rag-files-title">📚 파일 목록</span>
                    <span className="file-count">{ragSources.length}개</span>
                </div>

                {/* RAG 파일 목록 */}
                <div className="rag-files-content">
                    {ragSources.length > 0 ? (
                        <div className="rag-files-list">
                            {ragSources.map((source, index) => (
                                <div key={index} className="rag-file-item">
                                    <div className="rag-file-main">
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
                        <div className="empty-state">
                            저장된 파일이 없습니다
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
