package com.ragassistant.config;

import com.ragassistant.service.ConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Slf4j
@Configuration
public class IngestionConfig {
    private final ConfigService configService;

    public IngestionConfig(ConfigService configService) {
        this.configService = configService;
    }

    // ========================================================================
    // API KEYS - DB에서 복호화하여 사용
    // ========================================================================

    public String getOpenAiApiKey() {
        return configService.getOpenAiApiKey();
    }

    public String getUnstructuredApiKey() {
        return configService.getUnstructuredApiKey();
    }

    // ========================================================================
    // DYNAMIC CONFIG - DB에서 관리
    // ========================================================================

    public String getUnstructuredApiUrl() {
        return configService.getConfig().getUnstructuredApiUrl();
    }

    public String getChromaUrl() {
        return configService.getConfig().getChromaUrl();
    }

    public String getChromaCollectionName() {
        return configService.getConfig().getChromaCollectionName();
    }

    public String getLmStudioApiUrl() {
        return configService.getConfig().getLmStudioApiUrl();
    }

    public String getMetadataStrategy() {
        return configService.getConfig().getMetadataStrategy();
    }

    public String getMetadataAiModel() {
        String strategy = getMetadataStrategy();
        if ("OPENAI_BASED".equals(strategy)) {
            return configService.getConfig().getMetadataAiModel();
        } else if ("LMSTUDIO_BASED".equals(strategy)) {
            return configService.getConfig().getMetadataLmStudioModel();
        }
        return null;
    }

    public String getMetadataSystemPrompt() {
        return configService.getConfig().getMetadataSystemPrompt();
    }

    public String getChunkingStrategy() {
        return configService.getConfig().getChunkingStrategy();
    }

    public Integer getUnstructuredMaxCharacters() {
        Integer val = configService.getConfig().getUnstructuredMaxCharacters();
        return val != null ? val : 1000;
    }

    public String getUnstructuredChunkingStrategy() {
        String val = configService.getConfig().getUnstructuredChunkingStrategy();
        return val != null ? val : "by_title";
    }

    public Integer getUnstructuredOverlap() {
        Integer val = configService.getConfig().getUnstructuredOverlap();
        return val != null ? val : 200;
    }

    public String getChunkingLmStudioModel() {
        String val = configService.getConfig().getChunkingLmStudioModel();
        return val != null && !val.isEmpty() ? val : "qwen2.5-7b-instruct-1m";
    }

    public String getEmbeddingStrategy() {
        return configService.getConfig().getEmbeddingStrategy();
    }

    public String getEmbeddingModel() {
        String strategy = getEmbeddingStrategy();
        if ("OPENAI".equals(strategy)) {
            return configService.getConfig().getEmbeddingOpenAiModel();
        } else if ("LMSTUDIO".equals(strategy)) {
            return configService.getConfig().getEmbeddingLmStudioModel();
        }
        return "text-embedding-3-small";
    }

    public String getVectorStoreStrategy() {
        return configService.getConfig().getVectorStoreStrategy();
    }

    public String getChatAiModel() {
        return configService.getConfig().getChatOpenAiModel();
    }

    public double getChatTemperature() {
        return configService.getConfig().getChatTemperature();
    }

    public int getChatRetrievalCount() {
        return configService.getConfig().getChatRetrievalCount();
    }

    public double getChatSimilarityThreshold() {
        return configService.getConfig().getChatSimilarityThreshold();
    }

    public String getChatSystemPrompt() {
        return configService.getConfig().getChatSystemPrompt();
    }

    public int getMaxContextLength() {
        return configService.getConfig().getMaxContextLength();
    }

    // Deprecated - 호환성 유지
    public String getLmStudioModelName() {
        return configService.getConfig().getMetadataLmStudioModel();
    }

    @PostConstruct
    public void logConfiguration() {
        log.info("=".repeat(80));
        log.info("RAG Configuration (DB-based with Encryption)");
        log.info("=".repeat(80));
        log.info("Metadata Strategy: {}", getMetadataStrategy());
        log.info("Chunking Strategy: {}", getChunkingStrategy());
        log.info("Embedding Strategy: {}", getEmbeddingStrategy());
        log.info("Vector Store Strategy: {}", getVectorStoreStrategy());
        log.info("Chat AI Model: {}", getChatAiModel());
        log.info("=".repeat(80));
    }
}
