package com.ragassistant.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rag_config")
public class RagConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================================================
    // API KEYS - 암호화하여 DB 저장
    // ========================================================================

    @Column(length = 500)
    private String openAiApiKeyEncrypted;

    @Column(length = 500)
    private String unstructuredApiKeyEncrypted;

    // ========================================================================
    // API URLs
    // ========================================================================

    @Column(length = 200)
    private String unstructuredApiUrl;

    @Column(length = 200)
    private String chromaUrl;

    @Column(length = 100)
    private String chromaCollectionName;

    @Column(length = 200)
    private String lmStudioApiUrl;

    // ========================================================================
    // Metadata Configuration
    // ========================================================================

    @Column(nullable = false, length = 50)
    private String metadataStrategy;

    @Column(length = 100)
    private String metadataAiModel;

    @Column(length = 100)
    private String metadataLmStudioModel;

    @Column(columnDefinition = "TEXT")
    private String metadataSystemPrompt;

    // ========================================================================
    // Chunking Configuration
    // ========================================================================

    @Column(nullable = false, length = 50)
    private String chunkingStrategy;

    // Unstructured.io Chunking Options
    @Column
    private Integer unstructuredMaxCharacters = 1000;

    @Column(length = 50)
    private String unstructuredChunkingStrategy = "by_title";

    @Column
    private Integer unstructuredOverlap = 200;

    // LM Studio Chunking Model
    @Column(length = 100)
    private String chunkingLmStudioModel;

    // ========================================================================
    // Embedding Configuration
    // ========================================================================

    @Column(nullable = false, length = 50)
    private String embeddingStrategy;

    @Column(length = 100)
    private String embeddingOpenAiModel;

    @Column(length = 100)
    private String embeddingLmStudioModel;

    // ========================================================================
    // Vector Store Configuration
    // ========================================================================

    @Column(nullable = false, length = 50)
    private String vectorStoreStrategy;

    // ========================================================================
    // Chat Configuration
    // ========================================================================

    @Column(length = 100)
    private String chatOpenAiModel;

    @Column(length = 100)
    private String chatLmStudioModel;

    @Column(nullable = false)
    private Double chatTemperature;

    @Column(nullable = false)
    private Integer chatRetrievalCount;

    @Column(nullable = false)
    private Double chatSimilarityThreshold;

    @Column(columnDefinition = "TEXT")
    private String chatSystemPrompt;

    @Column(nullable = false)
    private Integer maxContextLength;

    // ========================================================================
    // Metadata
    // ========================================================================

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        validate();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        validate();
    }

    // ========================================================================
    // Validation
    // ========================================================================

    public void validate() {
        validateMetadataStrategy();
        validateChunkingStrategy();
        validateEmbeddingStrategy();
        validateVectorStoreStrategy();
        validateChatParameters();
    }

    private void validateMetadataStrategy() {
        if (!List.of("RULE_BASED", "OPENAI_BASED", "LMSTUDIO_BASED").contains(metadataStrategy)) {
            throw new IllegalArgumentException("Invalid metadata strategy: " + metadataStrategy);
        }
    }

    private void validateChunkingStrategy() {
        if (!List.of("MARKDOWN", "UNSTRUCTURED", "LMSTUDIO").contains(chunkingStrategy)) {
            throw new IllegalArgumentException("Invalid chunking strategy: " + chunkingStrategy);
        }
    }

    private void validateEmbeddingStrategy() {
        if (!List.of("OPENAI", "LMSTUDIO").contains(embeddingStrategy)) {
            throw new IllegalArgumentException("Invalid embedding strategy: " + embeddingStrategy);
        }
    }

    private void validateVectorStoreStrategy() {
        if (!List.of("MEMORY", "CHROMA").contains(vectorStoreStrategy)) {
            throw new IllegalArgumentException("Invalid vector store strategy: " + vectorStoreStrategy);
        }
    }

    private void validateChatParameters() {
        if (chatTemperature < 0.0 || chatTemperature > 2.0) {
            throw new IllegalArgumentException("Chat temperature must be between 0.0 and 2.0");
        }
        if (chatRetrievalCount < 1 || chatRetrievalCount > 20) {
            throw new IllegalArgumentException("Chat retrieval count must be between 1 and 20");
        }
        if (chatSimilarityThreshold < 0.0 || chatSimilarityThreshold > 1.0) {
            throw new IllegalArgumentException("Chat similarity threshold must be between 0.0 and 1.0");
        }
    }

    // ========================================================================
    // Getters and Setters
    // ========================================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOpenAiApiKeyEncrypted() {
        return openAiApiKeyEncrypted;
    }

    public void setOpenAiApiKeyEncrypted(String openAiApiKeyEncrypted) {
        this.openAiApiKeyEncrypted = openAiApiKeyEncrypted;
    }

    public String getUnstructuredApiKeyEncrypted() {
        return unstructuredApiKeyEncrypted;
    }

    public void setUnstructuredApiKeyEncrypted(String unstructuredApiKeyEncrypted) {
        this.unstructuredApiKeyEncrypted = unstructuredApiKeyEncrypted;
    }

    public String getUnstructuredApiUrl() {
        return unstructuredApiUrl;
    }

    public void setUnstructuredApiUrl(String unstructuredApiUrl) {
        this.unstructuredApiUrl = unstructuredApiUrl;
    }

    public String getChromaUrl() {
        return chromaUrl;
    }

    public void setChromaUrl(String chromaUrl) {
        this.chromaUrl = chromaUrl;
    }

    public String getChromaCollectionName() {
        return chromaCollectionName;
    }

    public void setChromaCollectionName(String chromaCollectionName) {
        this.chromaCollectionName = chromaCollectionName;
    }

    public String getLmStudioApiUrl() {
        return lmStudioApiUrl;
    }

    public void setLmStudioApiUrl(String lmStudioApiUrl) {
        this.lmStudioApiUrl = lmStudioApiUrl;
    }

    public String getMetadataStrategy() {
        return metadataStrategy;
    }

    public void setMetadataStrategy(String metadataStrategy) {
        this.metadataStrategy = metadataStrategy;
    }

    public String getMetadataAiModel() {
        return metadataAiModel;
    }

    public void setMetadataAiModel(String metadataAiModel) {
        this.metadataAiModel = metadataAiModel;
    }

    public String getMetadataLmStudioModel() {
        return metadataLmStudioModel;
    }

    public void setMetadataLmStudioModel(String metadataLmStudioModel) {
        this.metadataLmStudioModel = metadataLmStudioModel;
    }

    public String getMetadataSystemPrompt() {
        return metadataSystemPrompt;
    }

    public void setMetadataSystemPrompt(String metadataSystemPrompt) {
        this.metadataSystemPrompt = metadataSystemPrompt;
    }

    public String getChunkingStrategy() {
        return chunkingStrategy;
    }

    public void setChunkingStrategy(String chunkingStrategy) {
        this.chunkingStrategy = chunkingStrategy;
    }

    public Integer getUnstructuredMaxCharacters() {
        return unstructuredMaxCharacters;
    }

    public void setUnstructuredMaxCharacters(Integer unstructuredMaxCharacters) {
        this.unstructuredMaxCharacters = unstructuredMaxCharacters;
    }

    public String getUnstructuredChunkingStrategy() {
        return unstructuredChunkingStrategy;
    }

    public void setUnstructuredChunkingStrategy(String unstructuredChunkingStrategy) {
        this.unstructuredChunkingStrategy = unstructuredChunkingStrategy;
    }

    public Integer getUnstructuredOverlap() {
        return unstructuredOverlap;
    }

    public void setUnstructuredOverlap(Integer unstructuredOverlap) {
        this.unstructuredOverlap = unstructuredOverlap;
    }

    public String getChunkingLmStudioModel() {
        return chunkingLmStudioModel;
    }

    public void setChunkingLmStudioModel(String chunkingLmStudioModel) {
        this.chunkingLmStudioModel = chunkingLmStudioModel;
    }

    public String getEmbeddingStrategy() {
        return embeddingStrategy;
    }

    public void setEmbeddingStrategy(String embeddingStrategy) {
        this.embeddingStrategy = embeddingStrategy;
    }

    public String getEmbeddingOpenAiModel() {
        return embeddingOpenAiModel;
    }

    public void setEmbeddingOpenAiModel(String embeddingOpenAiModel) {
        this.embeddingOpenAiModel = embeddingOpenAiModel;
    }

    public String getEmbeddingLmStudioModel() {
        return embeddingLmStudioModel;
    }

    public void setEmbeddingLmStudioModel(String embeddingLmStudioModel) {
        this.embeddingLmStudioModel = embeddingLmStudioModel;
    }

    public String getVectorStoreStrategy() {
        return vectorStoreStrategy;
    }

    public void setVectorStoreStrategy(String vectorStoreStrategy) {
        this.vectorStoreStrategy = vectorStoreStrategy;
    }

    public String getChatOpenAiModel() {
        return chatOpenAiModel;
    }

    public void setChatOpenAiModel(String chatOpenAiModel) {
        this.chatOpenAiModel = chatOpenAiModel;
    }

    public String getChatLmStudioModel() {
        return chatLmStudioModel;
    }

    public void setChatLmStudioModel(String chatLmStudioModel) {
        this.chatLmStudioModel = chatLmStudioModel;
    }

    public Double getChatTemperature() {
        return chatTemperature;
    }

    public void setChatTemperature(Double chatTemperature) {
        this.chatTemperature = chatTemperature;
    }

    public Integer getChatRetrievalCount() {
        return chatRetrievalCount;
    }

    public void setChatRetrievalCount(Integer chatRetrievalCount) {
        this.chatRetrievalCount = chatRetrievalCount;
    }

    public Double getChatSimilarityThreshold() {
        return chatSimilarityThreshold;
    }

    public void setChatSimilarityThreshold(Double chatSimilarityThreshold) {
        this.chatSimilarityThreshold = chatSimilarityThreshold;
    }

    public String getChatSystemPrompt() {
        return chatSystemPrompt;
    }

    public void setChatSystemPrompt(String chatSystemPrompt) {
        this.chatSystemPrompt = chatSystemPrompt;
    }

    public Integer getMaxContextLength() {
        return maxContextLength;
    }

    public void setMaxContextLength(Integer maxContextLength) {
        this.maxContextLength = maxContextLength;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
