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

    async ask(query: string): Promise<string> {
        // 1. 지식 검색
        const searchResults = await this.searchService.execute(query, 5);
        if (searchResults.length === 0) return "참고할 지식이 없습니다.";

        // 2. 컨텍스트 구성
        // 검색된 결과가 너무 길어 AI의 '토큰 제한'을 넘지 않도록 관리
        let context = "";
        for (const res of searchResults) {
            const nextFragment = `[출처: ${res.chunk.metadata.title}] ${res.chunk.text}\n\n`;

            // 새로운 조각을 더했을 때 한도를 넘는지 체크 ( 한도 = MAX_CONTEXT_LENGTH)
            if ((context + nextFragment).length > this.config.maxContextLength) {
                this.logger.warn(`Context limit reached. Some search results were truncated.`);
                break; // 한도 도달 시 중단 (상위 순위 결과만 반영됨)
            }
            context += nextFragment;
        }

        // 3. AI 답변 생성 (RAG)
        const response = await this.openai.chat.completions.create({
            model: this.config.chatAiModel,
            messages: [
                { role: 'system', content: `${this.config.chatSystemPrompt}\n\n[지식]\n${context}` },
                { role: 'user', content: query },
            ],
            temperature: this.config.chatTemperature,
        });

        return response.choices[0].message.content || '답변 실패';
    }
}