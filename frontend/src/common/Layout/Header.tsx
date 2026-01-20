// Material Design 아이콘 임포트 (react-icons 라이브러리)
import { MdBarChart, MdShare, MdSettings, MdAccountCircle, MdAdminPanelSettings } from 'react-icons/md';
// React Router의 NavLink 임포트 - 네비게이션 링크용
import { NavLink } from 'react-router-dom';
import './Header.css';

/**
 * Header 컴포넌트 - 애플리케이션 상단 네비게이션 바
 * 
 * 구성:
 * - 왼쪽: 로고 + 노트북 제목
 * - 중앙: 네비게이션 메뉴 (홈, RAG 문서 관리, 채팅, 모델 설정)
 * - 오른쪽: 액션 버튼들 (분석, 공유, 설정, 프로필)
 * 
 * 높이: 64px 고정
 * 
 * NavLink 사용:
 * - to: 이동할 경로
 * - className: 함수로 전달하여 isActive 상태에 따라 'active' 클래스 추가
 *   예: className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
 *   - isActive가 true면 'nav-item active' 클래스 적용
 *   - isActive가 false면 'nav-item' 클래스만 적용
 */
export const Header = () => {
    return (
        <header className="header">
            {/* 왼쪽 영역: 로고 및 제목 */}
            <div className="header-left">
                <NavLink to="/home" className="logo">
                    {/* 원형 로고 아이콘 (파란색 배경에 'N') */}
                    <div className="logo-icon">N</div>

                    {/* 노트북 제목 */}
                    <span className="logo-text">Rag Ai Assistant</span>
                </NavLink>
            </div>

            {/* 중앙 영역: 네비게이션 메뉴 */}
            <nav className="header-nav">
                {/* 홈 - /home 경로로 이동 */}
                <NavLink
                    to="/home"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    홈
                </NavLink>

                {/* RAG 문서 관리 - /documents 경로로 이동 */}
                <NavLink
                    to="/documents"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    RAG 문서 관리
                </NavLink>

                {/* 채팅 - /chat 경로로 이동 */}
                <NavLink
                    to="/chat"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    채팅
                </NavLink>

                {/* 모델 설정 - /settings 경로로 이동 (추후 페이지 추가 예정) */}
                <NavLink
                    to="/rag-settings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    RAG Setting
                </NavLink>
            </nav>

            {/* 오른쪽 영역: 액션 버튼들 */}
            <div className="header-right">
                {/* 분석 버튼 */}
                <button className="btn-icon" title="분석">
                    <MdBarChart size={20} />
                </button>

                {/* 공유 버튼 */}
                <button className="btn-icon" title="공유">
                    <MdShare size={20} />
                </button>

                {/* 설정 버튼 */}
                <button className="btn-icon" title="설정">
                    <MdSettings size={20} />
                </button>

                {/* 사용자 관리 버튼 */}
                <NavLink to="/manage-user" className="btn-icon" title="사용자 관리">
                    <MdAdminPanelSettings size={24} />
                </NavLink>

                {/* 로그인 버튼 */}
                <NavLink to="/login" className="btn-icon user-profile" title="로그인">
                    <MdAccountCircle size={32} />
                </NavLink>
            </div>
        </header>
    );
};