import { StrictMode } from 'react'  // 개발 모드에서 잠재적 문제를 감지하는 도구
import { createRoot } from 'react-dom/client'

// 전역 CSS 스타일 임포트 (CSS 변수, 폰트, 배경 등)
import './index.css'

// 메인 App 컴포넌트 임포트
import App from './App.tsx'

// React 애플리케이션 초기화 및 렌더링
// 1. document.getElementById('root')로 HTML의 #root 요소를 찾음
// 2. createRoot()로 React 루트 생성
// 3. render()로 App 컴포넌트를 렌더링
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* StrictMode로 감싸서 개발 중 경고 및 체크 활성화 */}
    <App />
  </StrictMode>,
)
