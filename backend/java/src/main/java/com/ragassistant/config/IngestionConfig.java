package com.ragassistant.config;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration
public class IngestionConfig {
    @Value("${rag.openai.api-key}")
    private String openAiApiKey;

    // METADATA
    // =======================================================================
    // 메타데이터 추출 방식: RULE_BASED | AI_BASED | LMSTUDIO_BASED |
    @Value("${rag.metadata.strategy}")
    private String metadataStrategy;

    // 메타 데이터 추출에 사용한 AI Model
    @Value("${rag.metadata.ai-model}")
    private String metadataAiModel;

    // LM Studio API URL
    @Value("${rag.lm-studio.api-url}")
    private String lmStudioApiUrl;

    // 메타 데이터 추출에 사용한 System Prompt
    @Value("${rag.metadata.system-prompt}")
    private String metadataSystemPrompt;

    // CHUNKING
    // =======================================================================
    // 사용할 CHUNKING 방식: UNSTRUCTURED | MARKDOWN |
    @Value("${rag.chunking.strategy}")
    private String chunkingStrategy;

    // UNSTRUCTURED api key
    @Value("${rag.unstructured.api-key:}")
    private String unstructuredApiKey;

    // UNSTRUCTURED api url
    @Value("${rag.unstructured.api-url:http://localhost:8000}")
    private String unstructuredApiUrl;

    // Embedding
    // =======================================================================
    // 사용할 EMBEDDING 방식:OPENAI|LMSTUDIO|
    @Value("${rag.embedding.strategy}")
    private String embeddingStrategy;

    // Embedding Model
    @Value("${rag.embedding.model}")
    private String embeddingModel;

    // Vector DB 설정
    // =======================================================================
    // Vector DB 전략 선택: MEMORY | CHROMA |
    @Value("${rag.vector-store.strategy:CHROMA}")
    private String vectorStoreStrategy;

    // Chroma DB Url
    @Value("${rag.chroma.url}")
    private String chromaUrl;

    // Chroma Collection Name
    @Value("${rag.chroma.collection-name}")
    private String chromaCollectionName;

    // CHAT =======================================================================

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

    public String getMetadataSystemPrompt() {
        return metadataSystemPrompt;
    }

    public String getVectorStoreStrategy() {
        return vectorStoreStrategy;
    }

    // build 시 현재 설정된 config를 로깅
    @PostConstruct
    public void logConfiguration() {
        log.info("=".repeat(80));
        log.info("RAG Configuration");
        log.info("=".repeat(80));
        log.info("Metadata Strategy: {}", metadataStrategy);
        log.info("Chunking Strategy: {}", chunkingStrategy);
        log.info("Embedding Strategy: {}", embeddingStrategy);
        log.info("Vector Store Strategy: {}", vectorStoreStrategy);
        log.info("Chat AI Model: {}", chatAiModel);
        log.info("=".repeat(80));
    }
}
