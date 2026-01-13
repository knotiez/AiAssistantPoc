import { Injectable, Logger } from '@nestjs/common';
import { IngestionConfig } from '../../config/ingestion.config';
import { DocumentChunk } from "../../models/document-chunk";
import { EmbeddingProvider } from '../../providers/embeddings/embedding.provider';
import { OpenAIEmbeddingProvider } from '../../providers/embeddings/openai-embedding.provider';

/**
 * [임베딩 빌더 - 오케스트레이터]
 * 
 * 설정(EMBEDDING_STRATEGY 등)에 따라 적합한 임베딩 프로바이더를 선택하고
 * 실제 작업을 위임(Delegate)하는 역할을 합니다.
 */
@Injectable()
export class EmbeddingBuilder {
    private readonly logger = new Logger(EmbeddingBuilder.name);

    constructor(
        private readonly config: IngestionConfig,
        private readonly openAiProvider: OpenAIEmbeddingProvider,
        // 추후에 GoogleEmbeddingProvider, localEmbeddingProvider 등을 여기에 추가
    ) { }

    /**
     * 설정된 전략에 따라 임베딩 작업을 수행합니다.
     */
    async embed(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
        // 현재는 구현체가 OpenAI 하나뿐이지만, 구조 확장을 위해 분기를 태웁니다.
        // (필요 시 Config에 EMBEDDING_STRATEGY 등을 추가하여 분기 가능)
        const strategy = this.config.embeddingStrategy.toUpperCase(); // 기본값
        let provider: EmbeddingProvider;

        if (strategy === "OPENAI") {
            provider = this.openAiProvider;
        } else {
            this.logger.warn(`No specific embedding strategy found. defaulting to OpenAI.`);
            provider = this.openAiProvider;
        }

        return provider.embed(chunks);
    }
}
