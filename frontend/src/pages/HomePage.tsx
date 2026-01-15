import './HomePage.css';

/**
 * HomePage 컴포넌트 - 홈/대시보드 페이지
 * 
 * 기능:
 * - RAG 시스템 개요 표시
 * - 최근 활동 요약
 * - 빠른 액세스 링크
 */
const HomePage = () => {
    return (
        <div className="home-page">
            <div className="home-container">
                {/* 페이지 헤더 */}
                <header className="page-header">
                    <h1>RAG Assistant 대시보드</h1>
                    <p className="page-description">
                        문서 기반 AI 채팅 시스템에 오신 것을 환영합니다
                    </p>
                </header>

                {/* 통계 카드 섹션 */}
                <div className="stats-grid">
                    {/* 저장된 문서 수 */}
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <div className="stat-content">
                            <h3>저장된 문서</h3>
                            <p className="stat-value">0</p>
                            <p className="stat-label">개의 문서</p>
                        </div>
                    </div>

                    {/* 총 청크 수 */}
                    <div className="stat-card">
                        <div className="stat-icon">🧩</div>
                        <div className="stat-content">
                            <h3>총 청크</h3>
                            <p className="stat-value">0</p>
                            <p className="stat-label">개의 청크</p>
                        </div>
                    </div>

                    {/* 채팅 세션 */}
                    <div className="stat-card">
                        <div className="stat-icon">💬</div>
                        <div className="stat-content">
                            <h3>채팅 세션</h3>
                            <p className="stat-value">0</p>
                            <p className="stat-label">개의 대화</p>
                        </div>
                    </div>

                    {/* 벡터 DB 상태 */}
                    <div className="stat-card">
                        <div className="stat-icon">🗄️</div>
                        <div className="stat-content">
                            <h3>벡터 DB</h3>
                            <p className="stat-value">활성</p>
                            <p className="stat-label">ChromaDB</p>
                        </div>
                    </div>
                </div>

                {/* 빠른 액세스 섹션 */}
                <div className="quick-access">
                    <h2>빠른 시작</h2>
                    <div className="quick-links">
                        <a href="/documents" className="quick-link-card">
                            <div className="quick-link-icon">📄</div>
                            <h3>문서 추가</h3>
                            <p>새로운 문서를 RAG 시스템에 추가하세요</p>
                        </a>

                        <a href="/chat" className="quick-link-card">
                            <div className="quick-link-icon">💭</div>
                            <h3>채팅 시작</h3>
                            <p>AI와 대화를 시작하세요</p>
                        </a>

                        <a href="/settings" className="quick-link-card">
                            <div className="quick-link-icon">⚙️</div>
                            <h3>모델 설정</h3>
                            <p>AI 모델 및 파라미터를 설정하세요</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;