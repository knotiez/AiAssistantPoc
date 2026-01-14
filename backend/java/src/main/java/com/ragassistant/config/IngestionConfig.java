package com.ragassistant.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class IngestionConfig {
    @Value("${rag.openai.api-key}")
    private String openAiApiKey;

    @Value("${rag.unstructured.api-key}")
    private String unstructuredApiKey;

    @Value("${rag.unstructured.api-url}")
    private String unstructuredApiUrl;

    @Value("${rag.chroma.url}")
    private String chromaUrl;

    @Value("${rag.chroma.collection-name}")
    private String chromaCollectionName;

    @Value("${rag.lm-studio.api-url}")
    private String lmStudioApiUrl;

    @Value("${rag.embedding.strategy}")
    private String embeddingStrategy;

    @Value("${rag.embedding.model}")
    private String embeddingModel;

    @Value("${rag.chunking.strategy}")
    private String chunkingStrategy;

    @Value("${rag.metadata.strategy}")
    private String metadataStrategy;

    @Value("${rag.metadata.ai-model}")
    private String metadataAiModel;

    @Value("${rag.chat.model}")
    private String chatAiModel;

    @Value("${rag.chat.temperature}")
    private double chatTemperature;

    @Value("${rag.chat.max-context-length}")
    private int maxContextLength;

    @Value("${rag.chat.retrieval-count}")
    private int chatRetrievalCount;

    @Value("${rag.chat.similarity-threshold}")
    private double chatSimilarityThreshold;

    @Value("${rag.chat.system-prompt:You are a helpful assistant.}")
    private String chatSystemPrompt;

    // Getters
    public String getOpenAiApiKey() {
        return openAiApiKey;
    }

    public String getUnstructuredApiKey() {
        return unstructuredApiKey;
    }

    public String getUnstructuredApiUrl() {
        return unstructuredApiUrl;
    }

    public String getChromaUrl() {
        return chromaUrl;
    }

    public String getChromaCollectionName() {
        return chromaCollectionName;
    }

    public String getLmStudioApiUrl() {
        return lmStudioApiUrl;
    }

    public String getEmbeddingStrategy() {
        return embeddingStrategy;
    }

    public String getEmbeddingModel() {
        return embeddingModel;
    }

    public String getChunkingStrategy() {
        return chunkingStrategy;
    }

    public String getMetadataStrategy() {
        return metadataStrategy;
    }

    public String getMetadataAiModel() {
        return metadataAiModel;
    }

    public String getChatAiModel() {
        return chatAiModel;
    }

    public double getChatTemperature() {
        return chatTemperature;
    }

    public int getMaxContextLength() {
        return maxContextLength;
    }

    public int getChatRetrievalCount() {
        return chatRetrievalCount;
    }

    public double getChatSimilarityThreshold() {
        return chatSimilarityThreshold;
    }

    public String getChatSystemPrompt() {
        return chatSystemPrompt;
    }
}
