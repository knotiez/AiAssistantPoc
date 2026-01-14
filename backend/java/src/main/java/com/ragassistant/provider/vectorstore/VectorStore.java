package com.ragassistant.provider.vectorstore;

import com.ragassistant.model.DocumentChunk;
import java.util.List;

public interface VectorStore {
    void storeChunk(DocumentChunk chunk);

    void storeChunks(List<DocumentChunk> chunks);

    List<SearchResult> search(List<Double> queryVector, int topK);

    List<StoredFileInfo> getStoredFiles();

    void clearAll();

    @lombok.Data
    @lombok.Builder
    class SearchResult {
        private DocumentChunk chunk;
        private double score;
    }

    @lombok.Data
    @lombok.Builder
    class StoredFileInfo {
        private String filePath;
        private String title;
        private String docType;
        private String updatedAt;
        private int chunkCount;
    }
}
