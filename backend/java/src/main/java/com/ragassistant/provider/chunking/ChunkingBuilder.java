package com.ragassistant.provider.chunking;

import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ChunkingBuilder
 * 
 * .env 설정(CHUNKING_STRATEGY)에 따라 적절한 ChunkingProvider를 선택하여 사용합니다.
 * 
 * 지원하는 전략:
 * - MARKDOWN: 마크다운 헤더 기반 청킹
 * - UNSTRUCTURED: Unstructured.io API 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChunkingBuilder {
    private final IngestionConfig config;
    private final MarkdownHeaderChunker markdownChunker;
    private final UnstructuredChunkingProvider unstructuredChunker;

    public List<DocumentChunk> splitDocument(String content, DocumentChunk.ChunkMetadata metadata) {
        String strategy = config.getChunkingStrategy().toUpperCase();
        ChunkingProvider provider;

        switch (strategy) {
            case "UNSTRUCTURED":
                log.info("Using UNSTRUCTURED Chunking Strategy");
                provider = unstructuredChunker;
                break;
            case "MARKDOWN":
            default:
                log.info("Using MARKDOWN Chunking Strategy");
                provider = markdownChunker;
                break;
        }

        return provider.splitDocument(content, metadata);
    }
}
