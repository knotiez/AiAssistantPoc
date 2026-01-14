import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { IngestionConfig } from '../config/ingestion.config';
import { SearchService } from '../search/search.service';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private readonly openai: OpenAI;

    constructor(
        private readonly config: IngestionConfig,
        private readonly searchService: SearchService,
    ) {
        this.openai = new OpenAI({ apiKey: this.config.openAiApiKey });
    }

    async ask(query: string): Promise<{
        answer: string;
        chunks: any[];
        fullPrompt: string;
        pipelineInfo: {
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
    }> {
        // 1. 지식 검색
        const allSearchResults = await this.searchService.execute(query, this.config.chatRetrievalCount);

        // 2. 유사도 임계값 필터링 (너무 연관성 낮은 데이터 배제)
        const searchResults = allSearchResults.filter(
            res => res.score >= this.config.chatSimilarityThreshold
        );

        // 3. 컨텍스트 구성
        let context = "";
        if (searchResults.length > 0) {
            for (const res of searchResults) {
                const nextFragment = `[출처: ${res.chunk.metadata.title}] ${res.chunk.text}\n\n`;

                if ((context + nextFragment).length > this.config.maxContextLength) {
                    this.logger.warn(`Context limit reached. Some search results were truncated.`);
                    break;
                }
                context += nextFragment;
            }
        }

        const systemPrompt = searchResults.length > 0
            ? `${this.config.chatSystemPrompt}\n\n[지식]\n${context}`
            : `${this.config.chatSystemPrompt}\n\n(참고할 지식이 없습니다. 해당 내용은 없다고 대답하세요.)`;

        // 4. AI 답변 생성 (RAG)
        const response = await this.openai.chat.completions.create({
            model: this.config.chatAiModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query },
            ],
            temperature: this.config.chatTemperature,
        });

        const answer = response.choices[0].message.content || '답변 실패';

        // 5. 응답 최적화: 임베딩 등 대용량 데이터 제거 및 필드 선별
        const optimizedChunks = searchResults.map(res => ({
            score: res.score,
            chunk: {
                id: res.chunk.id,
                text: res.chunk.text,
                metadata: {
                    title: res.chunk.metadata.title,
                    filePath: res.chunk.metadata.filePath,
                    // embedding 등 대용량 배열은 의도적으로 제외
                }
            }
        }));

        return {
            answer,
            chunks: optimizedChunks,
            fullPrompt: `--- SYSTEM PROMPT ---\n${systemPrompt}\n\n--- USER QUERY ---\n${query}`,
            pipelineInfo: {
                metadataStrategy: this.config.metadataStrategy,
                metadataModel: this.config.metadataAiModel,
                chunkingStrategy: this.config.chunkingStrategy,
                embeddingStrategy: this.config.embeddingStrategy,
                embeddingModel: this.config.embeddingModel,
                vectorStoreStrategy: this.config.vectorStoreStrategy,
                chatModel: this.config.chatAiModel,
                chatRetrievalCount: this.config.chatRetrievalCount,
                chatSimilarityThreshold: this.config.chatSimilarityThreshold,
            }
        };
    }
}