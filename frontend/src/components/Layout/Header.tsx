// Material Design 아이콘 임포트 (react-icons 라이브러리)
import { MdAdd, MdBarChart, MdShare, MdSettings, MdAccountCircle } from 'react-icons/md';
import './Header.css';

/**
 * Header 컴포넌트 - 애플리케이션 상단 네비게이션 바
 * 
 * 구성:
 * - 왼쪽: 로고 + 노트북 제목
 * - 오른쪽: 액션 버튼들 (노트북 만들기, 분석, 공유, 설정, 프로필)
 * 
 * 높이: 64px 고정
 */
export const Header = () => {
    return (
        <header className="header">
            {/* 왼쪽 영역: 로고 및 제목 */}
            <div className="header-left">
                <div className="logo">
                    {/* 원형 로고 아이콘 (파란색 배경에 'N') */}
                    <div className="logo-icon">N</div>

                    {/* 노트북 제목 */}
                    <span className="logo-text">Untitled notebook</span>
                </div>
            </div>

            {/* 오른쪽 영역: 액션 버튼들 */}
            <div className="header-right">
                {/* 노트북 만들기 버튼 (Primary 스타일) */}
                <button className="btn-primary">
                    <MdAdd size={20} />
                    <span>노트북 만들기</span>
                </button>

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

                {/* 사용자 프로필 버튼 */}
                <button className="btn-icon user-profile" title="프로필">
                    <MdAccountCircle size={32} />
                </button>
            </div>
        </header>
    );
};
