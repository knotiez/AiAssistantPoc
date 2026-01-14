package com.ragassistant.service;

import com.ragassistant.model.DocumentChunk;
import com.ragassistant.provider.chunking.MarkdownHeaderChunker;
import com.ragassistant.provider.embedding.EmbeddingBuilder;
import com.ragassistant.provider.metadata.MetadataProvider;
import com.ragassistant.provider.vectorstore.ChromaVectorStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ragassistant.model.SourceDocument;
import com.ragassistant.repository.SourceDocumentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IngestionService {
    private final MetadataProvider metadataProvider;
    private final MarkdownHeaderChunker chunker;
    private final EmbeddingBuilder embeddingBuilder;
    private final ChromaVectorStore vectorStore;
    private final SourceDocumentRepository sourceRepo;

    public ProcessResult processFile(String filename, String content, String filePath) {
        log.info(">>> Processing single file: [{}]", filename);

        try {
            // 1. Metadata extraction
            DocumentChunk.ChunkMetadata meta = metadataProvider.extract(filePath, content, filename);
            log.info("Step 1: Metadata built for {}", filename);

            // 2. Chunking
            List<DocumentChunk> chunks = chunker.splitDocument(content, meta);
            log.info("Step 2: Split into {} chunks", chunks.size());

            // 3. Embedding
            List<DocumentChunk> embeddedChunks = embeddingBuilder.embed(chunks);
            log.info("Step 3: Embedded {} chunks", embeddedChunks.size());

            // 4. Vector Store
            vectorStore.storeChunks(embeddedChunks);
            log.info("Step 4: Stored {} chunks to vector store", embeddedChunks.size());

            // 5. SQLite Tracking
            SourceDocument doc = sourceRepo.findByFilePath(filePath)
                    .orElse(SourceDocument.builder().filePath(filePath).build());
            doc.setFilename(filename);
            doc.setTitle(meta.getTitle());
            doc.setDocType(meta.getDocType());
            doc.setVersion(meta.getVersion());
            doc.setChunkCount(chunks.size());
            doc.setUpdatedAt(meta.getUpdatedAt());
            doc.setCreatedAt(LocalDateTime.now());
            sourceRepo.save(doc);

            return ProcessResult.builder()
                    .filename(filename)
                    .filePath(filePath)
                    .chunkCount(chunks.size())
                    .title(meta.getTitle())
                    .docType(meta.getDocType())
                    .updatedAt(meta.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            log.error("Failed to process {}: {}", filename, e.getMessage());
            throw new RuntimeException(e);
        }
    }

    public static class ProcessResult {
        private String filename;
        private String filePath;
        private int chunkCount;
        private String title;
        private String docType;
        private String updatedAt;

        public ProcessResult() {
        }

        public static ProcessResultBuilder builder() {
            return new ProcessResultBuilder();
        }

        public String getFilename() {
            return filename;
        }

        public void setFilename(String filename) {
            this.filename = filename;
        }

        public String getFilePath() {
            return filePath;
        }

        public void setFilePath(String filePath) {
            this.filePath = filePath;
        }

        public int getChunkCount() {
            return chunkCount;
        }

        public void setChunkCount(int chunkCount) {
            this.chunkCount = chunkCount;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDocType() {
            return docType;
        }

        public void setDocType(String docType) {
            this.docType = docType;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }

        public static class ProcessResultBuilder {
            private String filename;
            private String filePath;
            private int chunkCount;
            private String title;
            private String docType;
            private String updatedAt;

            public ProcessResultBuilder filename(String f) {
                this.filename = f;
                return this;
            }

            public ProcessResultBuilder filePath(String f) {
                this.filePath = f;
                return this;
            }

            public ProcessResultBuilder chunkCount(int c) {
                this.chunkCount = c;
                return this;
            }

            public ProcessResultBuilder title(String t) {
                this.title = t;
                return this;
            }

            public ProcessResultBuilder docType(String d) {
                this.docType = d;
                return this;
            }

            public ProcessResultBuilder updatedAt(String u) {
                this.updatedAt = u;
                return this;
            }

            public ProcessResult build() {
                ProcessResult r = new ProcessResult();
                r.setFilename(filename);
                r.setFilePath(filePath);
                r.setChunkCount(chunkCount);
                r.setTitle(title);
                r.setDocType(docType);
                r.setUpdatedAt(updatedAt);
                return r;
            }
        }
    }

    public List<SourceDocument> getAllSources() {
        return sourceRepo.findAll();
    }

    public void deleteAllSources() {
        sourceRepo.deleteAll();
        // TODO: Also delete from vector store if needed
        log.info("Deleted all source documents from database");
    }
}
