// Material Design 아이콘 임포트
import { MdSend } from 'react-icons/md';
import './ChatPanel.css';
import { useState, useRef, useEffect } from 'react';

/**
 * ChatPanel 컴포넌트 - 가운데 채팅 인터페이스
 * 
 * 구성:
 * - 빈 상태 메시지 (소스가 없을 때)
 * - 소스 업로드 버튼
 * - 채팅 입력창 (현재 비활성화)
 * - 소스 카운터 (0 sources)
 * 
 * 현재 상태:
 * - 소스가 없어서 빈 상태 표시
 * - 입력창 비활성화 (disabled)
 */
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatPanelProps {
    onRagDataUpdate?: (data: {
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
    } | null) => void;
}

export const ChatPanel = ({ onRagDataUpdate }: ChatPanelProps) => {
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 새 메시지가 추가될 때마다 하단으로 스크롤
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = message.trim();
        if (!trimmed || isLoading) return;

        // 사용자 메시지 추가
        const newUserMessage: ChatMessage = { role: 'user', content: trimmed };
        setChatHistory(prev => [...prev, newUserMessage]);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // AI 답변 추가
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: result.answer || '답변을 가져오지 못했습니다.'
            };
            setChatHistory(prev => [...prev, assistantMessage]);

            // RAG 메타데이터 업데이트 (Studio 패널용)
            if (onRagDataUpdate) {
                onRagDataUpdate({
                    chunks: result.chunks || [],
                    fullPrompt: result.fullPrompt || "",
                    pipelineInfo: result.pipelineInfo
                });
            }
        } catch (error) {
            console.error('질문에 대한 답변 조회 실패:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: '⚠️ 오류가 발생했습니다. 서버 상태를 확인해주세요.'
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-panel panel">
            {/* 채팅 내용 영역 */}
            <div className="chat-content" ref={scrollRef}>
                {chatHistory.length === 0 ? (
                    <div className="chat-empty">
                        <h3>질문을 입력해 주세요</h3>
                        <p>RAG에 저장된 문서를 바탕으로 답변해 드립니다.</p>
                    </div>
                ) : (
                    <div className="chat-messages">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`chat-bubble-wrapper ${chat.role}`}>
                                <div className="chat-bubble">
                                    {chat.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-bubble-wrapper assistant">
                                <div className="chat-bubble loading">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 하단 입력 영역 */}
            <div className="chat-input-container">
                <form className="chat-input-wrapper" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder={isLoading ? "답변을 생성 중입니다..." : "질문을 입력하세요..."}
                        className="chat-input"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn-send" disabled={isLoading || !message.trim()}>
                        <MdSend size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};
