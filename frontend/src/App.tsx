// App 컴포넌트의 스타일 임포트
import './App.css';

// React Router 임포트
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 레이아웃 컴포넌트
import { Header } from './common/Layout/Header';

// 페이지 컴포넌트
import HomePage from './pages/home';
import DocumentsPage from './pages/documents';
import ChatPage from './pages/chat';

// 공통 컴포넌트
import { FloatingActionButton } from './common/FloatingActionButton/FloatingActionButton';

/**
 * App 컴포넌트 - 애플리케이션의 최상위 컴포넌트
 * 
 * React Router를 사용한 멀티 페이지 구조:
 * - / : 홈으로 리다이렉트
 * - /home : 홈 페이지 (대시보드)
 * - /documents : RAG 문서 관리 페이지
 * - /chat : 채팅 페이지
 * - /settings : 모델 설정 페이지 (추후 추가)
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* 상단 네비게이션 바 - 모든 페이지에 공통으로 표시 */}
        <Header />

        {/* 라우트 설정 - URL에 따라 다른 페이지 표시 */}
        <Routes>
          {/* 루트 경로(/)는 /home으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* 홈 페이지 */}
          <Route path="/home" element={<HomePage />} />

          {/* RAG 문서 관리 페이지 */}
          <Route path="/documents" element={<DocumentsPage />} />

          {/* 채팅 페이지 - 3단 레이아웃 */}
          <Route path="/chat" element={<ChatPage />} />

          {/* 모델 설정 페이지 (추후 추가) */}
          {/* <Route path="/settings" element={<SettingsPage />} /> */}
        </Routes>

        {/* 우측 하단 플로팅 버튼 - 모든 페이지에 공통으로 표시 */}
        <FloatingActionButton />
      </div>
    </BrowserRouter>
  );
}

export default App;