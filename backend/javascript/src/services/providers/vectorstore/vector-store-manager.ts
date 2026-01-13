import { Injectable, Logger } from '@nestjs/common';
import { IngestionConfig } from '../../config/ingestion.config';
import { DocumentChunk } from "../../models/document-chunk";
import { SearchResult, StoredFileInfo, VectorStore } from './vector-store';
import { MemoryVectorStore } from './memory.store';
import { ChromaVectorStore } from './chroma.store';

/**
 * [벡터 저장소 매니저 - 오케스트레이터]
 * 
 * 설정(VECTOR_STORE_STRATEGY)에 따라 Memory 또는 ChromaDB 저장소를 선택하고
 * 모든 작업을 해당 저장소로 위임합니다.
 */
@Injectable()
export class VectorStoreManager extends VectorStore {
    private readonly logger = new Logger(VectorStoreManager.name);

    constructor(
        private readonly config: IngestionConfig,
        private readonly memoryStore: MemoryVectorStore,
        private readonly chromaStore: ChromaVectorStore
    ) {
        super();
    }

    /**
     * 현재 설정된 전략에 따른 저장소를 반환합니다.
     */
    private get activeStore(): VectorStore {
        const strategy = this.config.vectorStoreStrategy.toUpperCase();
        if (strategy === 'CHROMA') {
            return this.chromaStore;
        }
        return this.memoryStore;
    }

    // --- VectorStore 추상 클래스 메서드 구현 (위임) ---

    async storeChunk(chunk: DocumentChunk): Promise<void> {
        return this.activeStore.storeChunk(chunk);
    }

    async storeChunks(chunks: DocumentChunk[]): Promise<void> {
        return this.activeStore.storeChunks(chunks);
    }

    async search(queryVector: number[], topK?: number): Promise<SearchResult[]> {
        return this.activeStore.search(queryVector, topK);
    }

    async getStoredFiles(): Promise<StoredFileInfo[]> {
        return this.activeStore.getStoredFiles();
    }

    async clearAll(): Promise<void> {
        return this.activeStore.clearAll();
    }
}
