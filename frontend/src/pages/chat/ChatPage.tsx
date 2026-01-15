import { useState } from 'react';
import { MainLayout } from '../../common/Layout/MainLayout';
import { ChatSourcesPanel } from './components/ChatSourcesPanel';
import { ChatPanel } from './components/ChatPanel';
import { StudioPanel } from './components/StudioPanel';

/**
 * ChatPage 컴포넌트 - 채팅 페이지
 * 
 * 기능:
 * - RAG 기반 AI 채팅 인터페이스
 * - 3단 레이아웃: 소스 패널 + 채팅 패널 + 스튜디오 패널
 * 
 * 구조:
 * - 왼쪽: SourcesPanel (문서 출처 관리)
 * - 가운데: ChatPanel (채팅 인터페이스)
 * - 오른쪽: StudioPanel (RAG 인스펙터 - 검색 결과 및 파이프라인 정보)
 * 
 * 상태 관리:
 * - lastRagData: 최근 RAG 검색 데이터 (ChatPanel에서 업데이트, StudioPanel에서 표시)
 */
const ChatPage = () => {
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
        <MainLayout>
            {/* 왼쪽 패널: 출처 관리 + RAG 파일 목록 */}
            <ChatSourcesPanel />

            {/* 가운데 패널: 채팅 인터페이스 */}
            <ChatPanel onRagDataUpdate={setLastRagData} />

            {/* 오른쪽 패널: 스튜디오 (RAG 인스펙터) */}
            <StudioPanel ragData={lastRagData} />
        </MainLayout>
    );
};

export default ChatPage;