import { useState } from 'react';
import { FileUploadPanel } from './components/FileUploadPanel';
import { RagFilesPanel } from './components/RagFilesPanel';
import './DocumentsPage.css';

/**
 * DocumentsPage 컴포넌트 - RAG 문서 관리 페이지
 * 
 * 기능:
 * - 문서 업로드 및 관리
 * - RAG 시스템에 저장된 문서 목록 표시
 * - 문서 삭제 및 새로고침
 * 
 * 구조:
 * - 왼쪽 (50%): FileUploadPanel - 폴더 선택 및 RAG 업로드
 * - 오른쪽 (50%): RagFilesPanel - RAG 저장된 파일 목록 및 관리
 */
const DocumentsPage = () => {
    // RAG 파일 목록 새로고침 트리거
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 업로드 성공 시 호출되는 핸들러
    const handleUploadSuccess = () => {
        // refreshTrigger를 증가시켜 RagFilesPanel에서 목록을 새로고침하도록 함
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="documents-page">
            <div className="documents-container">
                {/* 페이지 헤더 */}
                <header className="page-header">
                    <h1>RAG 문서 관리</h1>
                    <p className="page-description">
                        문서를 업로드하고 RAG 시스템에서 관리하세요
                    </p>
                </header>

                {/* 2단 레이아웃: 왼쪽 파일 업로드, 오른쪽 RAG 파일 목록 */}
                <div className="documents-content">
                    <FileUploadPanel onUploadSuccess={handleUploadSuccess} />
                    <RagFilesPanel refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default DocumentsPage;