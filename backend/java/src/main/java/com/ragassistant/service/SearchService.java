package com.ragassistant.service;

import com.ragassistant.model.DocumentChunk;
import com.ragassistant.provider.embedding.EmbeddingBuilder;
import com.ragassistant.provider.vectorstore.ChromaVectorStore;
import com.ragassistant.provider.vectorstore.VectorStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {
    private final EmbeddingBuilder embeddingBuilder;
    private final ChromaVectorStore vectorStore;

    public List<VectorStore.SearchResult> execute(String query, int topK) {
        log.info("Searching for: \"{}\"", query);

        // 1. Embedding the query
        DocumentChunk dummy = DocumentChunk.builder()
                .text(query)
                .metadata(DocumentChunk.ChunkMetadata.builder().build())
                .build();

        List<DocumentChunk> embedded = embeddingBuilder.embed(Collections.singletonList(dummy));
        List<Double> vector = embedded.get(0).getMetadata().getEmbedding();

        if (vector == null || vector.isEmpty()) {
            log.error("[Search] Query embedding failed!");
            return Collections.emptyList();
        }

        // 2. Search in Vector Store
        List<VectorStore.SearchResult> results = vectorStore.search(vector, topK);
        log.info("[Search] Found {} results.", results.size());

        for (int i = 0; i < results.size(); i++) {
            log.info(results.get(i).getChunk().getText());
        }

        return results;
    }
}
