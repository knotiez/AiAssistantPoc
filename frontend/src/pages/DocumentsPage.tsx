import { SourcesPanel } from '../components/Sources/SourcesPanel';
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
 * - 기존 SourcesPanel 컴포넌트를 전체 화면으로 표시
 */
const DocumentsPage = () => {
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

                {/* 문서 관리 패널 */}
                <div className="documents-content">
                    <SourcesPanel />
                </div>
            </div>
        </div>
    );
};

export default DocumentsPage;