import { Injectable, Logger } from '@nestjs/common';
import { DocumentChunk, ChunkMetadata } from "../../models/document-chunk";
import { IngestionConfig } from '../../config/ingestion.config';
import { MarkdownHeaderChunker } from './markdown-header-chunker';
import { UnstructuredChunkingProvider } from './unstructured-chunker';
import { ChunkingProvider } from './chunking.provider';

/**
 * [청커 오케스트레이터]
 * 
 * 이제 이 클래스는 직접 텍스트를 자르지 않습니다.
 * 설정(CHUNKING_STRATEGY)에 따라 적절한 청커 엔진을 부르고 일을 시킵니다.
 */
@Injectable()
export class Chunker {
    private readonly logger = new Logger(Chunker.name);

    constructor(
        private readonly config: IngestionConfig,
        private readonly markdownChunker: MarkdownHeaderChunker,
        private readonly unstructuredChunker: UnstructuredChunkingProvider
    ) { }

    async splitDocument(
        rawText: string,
        commonMeta: Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>
    ): Promise<DocumentChunk[]> {
        // 1. 설정에서 어떤 전략을 쓸지 가져옵니다.
        const strategy = this.config.chunkingStrategy.toUpperCase();
        let provider: ChunkingProvider;

        // 2. 전략에 따라 프로바이더 선택
        if (strategy === 'UNSTRUCTURED') {
            this.logger.log(`Using Unstructured.io API for chunking...`);
            provider = this.unstructuredChunker;
        } else {
            this.logger.log(`Using Markdown Header logic for chunking...`);
            provider = this.markdownChunker;
        }

        // 3. 선택된 프로바이더에게 일 위임 (Delegate)
        return provider.splitDocument(rawText, commonMeta);
    }
}