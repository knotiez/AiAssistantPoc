package com.ragassistant.model;

import java.util.ArrayList;
import java.util.List;

public class DocumentChunk {
    private String id;
    private String text;
    private ChunkMetadata metadata;

    public DocumentChunk() {
    }

    public DocumentChunk(String id, String text, ChunkMetadata metadata) {
        this.id = id;
        this.text = text;
        this.metadata = metadata;
    }

    public static DocumentChunkBuilder builder() {
        return new DocumentChunkBuilder();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public ChunkMetadata getMetadata() {
        return metadata;
    }

    public void setMetadata(ChunkMetadata metadata) {
        this.metadata = metadata;
    }

    public static class ChunkMetadata {
        private String title;
        private String docType;
        private List<String> permission = new ArrayList<>();
        private String summary;
        private String version;
        private String updatedAt;
        private String sectionTitle;
        private String filePath;
        private int chunkIndex;
        private List<Double> embedding = new ArrayList<>();

        public ChunkMetadata() {
        }

        public static ChunkMetadataBuilder builder() {
            return new ChunkMetadataBuilder();
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

        public List<String> getPermission() {
            return permission;
        }

        public void setPermission(List<String> permission) {
            this.permission = permission;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }

        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }

        public String getSectionTitle() {
            return sectionTitle;
        }

        public void setSectionTitle(String sectionTitle) {
            this.sectionTitle = sectionTitle;
        }

        public String getFilePath() {
            return filePath;
        }

        public void setFilePath(String filePath) {
            this.filePath = filePath;
        }

        public int getChunkIndex() {
            return chunkIndex;
        }

        public void setChunkIndex(int chunkIndex) {
            this.chunkIndex = chunkIndex;
        }

        public List<Double> getEmbedding() {
            return embedding;
        }

        public void setEmbedding(List<Double> embedding) {
            this.embedding = embedding;
        }
    }

    public static class DocumentChunkBuilder {
        private String id;
        private String text;
        private ChunkMetadata metadata;

        public DocumentChunkBuilder id(String id) {
            this.id = id;
            return this;
        }

        public DocumentChunkBuilder text(String text) {
            this.text = text;
            return this;
        }

        public DocumentChunkBuilder metadata(ChunkMetadata metadata) {
            this.metadata = metadata;
            return this;
        }

        public DocumentChunk build() {
            return new DocumentChunk(id, text, metadata);
        }
    }

    public static class ChunkMetadataBuilder {
        private String title;
        private String docType;
        private List<String> permission;
        private String summary;
        private String version;
        private String updatedAt;
        private String sectionTitle;
        private String filePath;
        private int chunkIndex;
        private List<Double> embedding;

        public ChunkMetadataBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ChunkMetadataBuilder docType(String docType) {
            this.docType = docType;
            return this;
        }

        public ChunkMetadataBuilder permission(List<String> permission) {
            this.permission = permission;
            return this;
        }

        public ChunkMetadataBuilder summary(String summary) {
            this.summary = summary;
            return this;
        }

        public ChunkMetadataBuilder version(String version) {
            this.version = version;
            return this;
        }

        public ChunkMetadataBuilder updatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ChunkMetadataBuilder sectionTitle(String sectionTitle) {
            this.sectionTitle = sectionTitle;
            return this;
        }

        public ChunkMetadataBuilder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public ChunkMetadataBuilder chunkIndex(int chunkIndex) {
            this.chunkIndex = chunkIndex;
            return this;
        }

        public ChunkMetadataBuilder embedding(List<Double> embedding) {
            this.embedding = embedding;
            return this;
        }

        public ChunkMetadata build() {
            ChunkMetadata m = new ChunkMetadata();
            m.setTitle(title);
            m.setDocType(docType);
            m.setPermission(permission);
            m.setSummary(summary);
            m.setVersion(version);
            m.setUpdatedAt(updatedAt);
            m.setSectionTitle(sectionTitle);
            m.setFilePath(filePath);
            m.setChunkIndex(chunkIndex);
            m.setEmbedding(embedding);
            return m;
        }
    }
}
