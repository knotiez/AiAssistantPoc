import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingBuilder } from '../ingestion/processors/embedding.builder';
import { VectorStoreManager } from '../providers/vectorstore/vector-store-manager';
import { SearchResult } from '../providers/vectorstore/vector-store';

/**
 * [검색 서비스]
 * 
 * 사용자의 질문을 임베딩하고 벡터 저장소에서 유사한 조각을 찾아주는 
 * 비즈니스 로직을 담당합니다.
 */
@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly embeddingBuilder: EmbeddingBuilder,
        private readonly vectorStore: VectorStoreManager,
    ) { }

    /**
     * 사용자의 질문을 받아 가장 유사한 문서 조각들을 찾아 반환합니다.
     */
    async execute(query: string, topK: number = 3): Promise<SearchResult[]> {
        this.logger.log(`Searching for: "${query}"`);

        // 1. 질문(문장)을 임베딩(숫자)으로 변환합니다.
        // 우리 시스템의 embed 메소드는 배열을 받으므로 임시 객체를 만들어 전달합니다.
        const dummyChunk: any = { text: query, metadata: {} };
        const [embeddedQuery] = await this.embeddingBuilder.embed([dummyChunk]);

        const vector = embeddedQuery.metadata.embedding;
        if (!vector) {
            this.logger.error("[Search] Query embedding failed! Vector is null.");
            return [];
        }

        // 2. 변환된 숫자 좌표를 가지고 벡터 저장소에서 검색합니다.
        const results = await this.vectorStore.search(
            vector,
            topK
        );

        this.logger.log(`[Search] Found ${results.length} results. Top score: ${results[0]?.score ?? 'N/A'}.`);
        return results;
    }
}