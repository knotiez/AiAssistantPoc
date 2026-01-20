package com.ragassistant.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class SourceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String filePath;
    private String title;
    private String docType;
    private String version;
    private int chunkCount;
    private LocalDateTime createdAt;
    private String updatedAt;

    public SourceDocument() {
    }

    public static SourceDocumentBuilder builder() {
        return new SourceDocumentBuilder();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public int getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(int chunkCount) {
        this.chunkCount = chunkCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class SourceDocumentBuilder {
        private String filename;
        private String filePath;
        private String title;
        private String docType;
        private String version;
        private int chunkCount;
        private LocalDateTime createdAt;
        private String updatedAt;

        public SourceDocumentBuilder filename(String filename) {
            this.filename = filename;
            return this;
        }

        public SourceDocumentBuilder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public SourceDocumentBuilder title(String title) {
            this.title = title;
            return this;
        }

        public SourceDocumentBuilder docType(String docType) {
            this.docType = docType;
            return this;
        }

        public SourceDocumentBuilder version(String version) {
            this.version = version;
            return this;
        }

        public SourceDocumentBuilder chunkCount(int chunkCount) {
            this.chunkCount = chunkCount;
            return this;
        }

        public SourceDocumentBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SourceDocumentBuilder updatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public SourceDocument build() {
            SourceDocument doc = new SourceDocument();
            doc.setFilename(filename);
            doc.setFilePath(filePath);
            doc.setTitle(title);
            doc.setDocType(docType);
            doc.setVersion(version);
            doc.setChunkCount(chunkCount);
            doc.setCreatedAt(createdAt);
            doc.setUpdatedAt(updatedAt);
            return doc;
        }
    }
}
