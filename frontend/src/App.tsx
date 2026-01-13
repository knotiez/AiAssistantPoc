// App 컴포넌트의 스타일 임포트
import './App.css';

// 레이아웃 컴포넌트
import { Header } from './components/Layout/Header';           // 상단 헤더
import { MainLayout } from './components/Layout/MainLayout';   // 3단 그리드 레이아웃

// 패널 컴포넌트
import { SourcesPanel } from './components/Sources/SourcesPanel';   // 왼쪽: 소스 관리 패널
// RAGPanel 제거 - SourcesPanel에 통합
import { ChatPanel } from './components/Chat/ChatPanel';             // 가운데: 채팅 인터페이스
import { StudioPanel } from './components/Studio/StudioPanel';       // 오른쪽: AI 도구 스튜디오

// 공통 컴포넌트
import { FloatingActionButton } from './components/common/FloatingActionButton';  // 우측 하단 FAB

import { useState } from 'react';

/**
 * App 컴포넌트 - 애플리케이션의 최상위 컴포넌트
 */
function App() {
  // 최근 RAG 검색 데이터 상태 (채팅 패널에서 업데이트하고 스튜디오 패널에서 표시)
  const [lastRagData, setLastRagData] = useState<{
    chunks: any[];
    fullPrompt: string;
    pipelineInfo?: {
      metadataStrategy: string;
      metadataModel: string;
      chunkingStrategy: string;
      embeddingStrategy: string;
      embeddingModel: string;
      vectorStoreStrategy: string;
      chatModel: string;
      chatRetrievalCount: number;
      chatSimilarityThreshold: number;
    };
  } | null>(null);

  return (
    <div className="app">
      {/* 상단 네비게이션 바 */}
      <Header />

      {/* 메인 3단 레이아웃 */}
      <MainLayout>
        {/* 왼쪽 패널: 출처 관리 + RAG 파일 목록 */}
        <SourcesPanel />

        {/* 가운데 패널: 채팅 */}
        <ChatPanel onRagDataUpdate={setLastRagData} />

        {/* 오른쪽 패널: 스튜디오 (RAG 인스펙터) */}
        <StudioPanel ragData={lastRagData} />
      </MainLayout>

      {/* 우측 하단 플로팅 버튼 */}
      <FloatingActionButton />
    </div>
  );
}

export default App;
