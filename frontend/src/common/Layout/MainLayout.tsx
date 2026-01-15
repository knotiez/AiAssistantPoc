// React의 타입 전용 임포트 (TypeScript의 verbatimModuleSyntax 설정 준수)
import type { ReactNode } from 'react';
import './MainLayout.css';

// Props 타입 정의
interface MainLayoutProps {
    children: ReactNode;  // 3개의 패널 컴포넌트를 children으로 받음
}

/**
 * MainLayout 컴포넌트 - 3단 그리드 레이아웃
 * 
 * Grid 구조:
 * - 첫 번째 열 (auto): SourcesPanel - 320px (펼침) / 80px (접힘)
 * - 두 번째 열 (3fr): ChatPanel - 가변 너비 (3 비율)
 * - 세 번째 열 (2fr): StudioPanel - 가변 너비 (2 비율)
 * 
 * 동작:
 * - SourcesPanel이 접히면 auto 열이 80px로 줄어들고
 * - ChatPanel이 자동으로 확장되어 빈 공간을 채움
 * - ChatPanel과 StudioPanel은 항상 3:2 비율 유지
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="main-layout">
            {/* Grid 컨테이너: 3개의 children을 자동으로 3열에 배치 */}
            <div className="layout-content">
                {children}
            </div>
        </div>
    );
};
