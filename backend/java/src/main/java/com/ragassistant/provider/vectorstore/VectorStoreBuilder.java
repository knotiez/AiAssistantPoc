package com.ragassistant.provider.vectorstore;

import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * VectorStoreBuilder
 * 
 * .env 설정(VECTOR_STORE_STRATEGY)에 따라 적절한 VectorStore를 선택하여 사용합니다.
 * 
 * 지원하는 전략:
 * - CHROMA: ChromaDB 사용
 * - MEMORY: 인메모리 저장소 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VectorStoreBuilder {
    private final IngestionConfig config;
    private final ChromaVectorStore chromaStore;
    private final MemoryVectorStore memoryStore;

    public void storeChunks(List<DocumentChunk> chunks) {
        String strategy = config.getVectorStoreStrategy();
        VectorStore store;

        switch (strategy.toUpperCase()) {
            case "MEMORY":
                log.info("Using MEMORY Vector Store Strategy");
                store = memoryStore;
                break;
            case "CHROMA":
            default:
                log.info("Using CHROMA Vector Store Strategy (URL: {})", config.getChromaUrl());
                store = chromaStore;
                break;
        }

        store.storeChunks(chunks);
    }

    public List<VectorStore.SearchResult> search(List<Double> queryVector, int topK) {
        String strategy = config.getVectorStoreStrategy();
        VectorStore store;

        switch (strategy.toUpperCase()) {
            case "MEMORY":
                store = memoryStore;
                break;
            case "CHROMA":
            default:
                store = chromaStore;
                break;
        }

        return store.search(queryVector, topK);
    }
}
