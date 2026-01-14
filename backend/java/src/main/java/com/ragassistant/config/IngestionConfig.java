package com.ragassistant.config;

import com.ragassistant.provider.metadata.LMStudioMetadataProvider;
import com.ragassistant.provider.metadata.MetadataProvider;
import com.ragassistant.provider.metadata.OpenAiMetadataProvider;
import com.ragassistant.provider.metadata.RuleBasedMetadataProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Slf4j
@Configuration
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

    @Value("${METADATA_SYSTEM_PROMPT:You are a professional librarian. Extract metadata from the document in JSON format.}")
    private String metadataSystemPrompt;

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

    /**
     * 메타데이터 프로바이더 팩토리
     * METADATA_STRATEGY 환경 변수에 따라 적절한 프로바이더를 반환합니다.
     */
    @Bean
    @Primary
    public MetadataProvider metadataProvider(
            @Autowired(required = false) RuleBasedMetadataProvider ruleBasedProvider,
            @Autowired(required = false) OpenAiMetadataProvider openAiProvider,
            @Autowired(required = false) LMStudioMetadataProvider lmStudioProvider) {
        log.info("Initializing MetadataProvider with strategy: {}", metadataStrategy);

        switch (metadataStrategy.toUpperCase()) {
            case "OPENAI_BASED":
                log.info("Using OpenAI Metadata Provider with model: {}", metadataAiModel);
                return openAiProvider;
            case "LMSTUDIO_BASED":
                log.info("Using LM Studio Metadata Provider with model: {}", metadataAiModel);
                return lmStudioProvider;
            case "RULE_BASED":
            default:
                log.info("Using Rule-Based Metadata Provider");
                return ruleBasedProvider;
        }
    }
}
