package com.ragassistant.provider.vectorstore;

import com.ragassistant.model.DocumentChunk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MemoryVectorStore implements VectorStore {

    private final Map<String, DocumentChunk> store = new ConcurrentHashMap<>();

    @Override
    public void storeChunk(DocumentChunk chunk) {
        if (chunk.getMetadata().getEmbedding() == null) {
            log.warn("Chunk {} has no embedding. Skipping storage.", chunk.getId());
            return;
        }
        store.put(chunk.getId(), chunk);
    }

    @Override
    public void storeChunks(List<DocumentChunk> chunks) {
        for (DocumentChunk chunk : chunks) {
            storeChunk(chunk);
        }
    }

    @Override
    public List<SearchResult> search(List<Double> queryVector, int topK) {
        log.info("Searching memory store with {} chunks for top {}", store.size(), topK);

        return store.values().stream()
                .filter(chunk -> chunk.getMetadata().getEmbedding() != null)
                .map(chunk -> {
                    double score = cosineSimilarity(queryVector, chunk.getMetadata().getEmbedding());
                    return SearchResult.builder()
                            .chunk(chunk)
                            .score(score)
                            .build();
                })
                .sorted(Comparator.comparingDouble(SearchResult::getScore).reversed())
                .limit(topK)
                .collect(Collectors.toList());
    }

    @Override
    public List<StoredFileInfo> getStoredFiles() {
        Map<String, StoredFileInfo> fileMap = new HashMap<>();

        for (DocumentChunk chunk : store.values()) {
            String filePath = chunk.getMetadata().getFilePath();
            if (filePath == null)
                continue;

            fileMap.compute(filePath, (k, v) -> {
                if (v == null) {
                    return StoredFileInfo.builder()
                            .filePath(filePath)
                            .title(chunk.getMetadata().getTitle())
                            .docType(chunk.getMetadata().getDocType())
                            .updatedAt(chunk.getMetadata().getUpdatedAt())
                            .chunkCount(1)
                            .build();
                } else {
                    v.setChunkCount(v.getChunkCount() + 1);
                    return v;
                }
            });
        }
        return new ArrayList<>(fileMap.values());
    }

    @Override
    public void clearAll() {
        store.clear();
        log.info("Memory vector store cleared.");
    }

    private double cosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA.size() != vecB.size()) {
            // Handle error or mismatch - effectively 0 similarity
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.size(); i++) {
            dotProduct += vecA.get(i) * vecB.get(i);
            normA += vecA.get(i) * vecA.get(i);
            normB += vecB.get(i) * vecB.get(i);
        }

        if (normA == 0 || normB == 0)
            return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
