package com.ragassistant.service;

import com.ragassistant.model.entity.ConfigHistory;
import com.ragassistant.model.entity.RagConfig;
import com.ragassistant.repository.ConfigHistoryRepository;
import com.ragassistant.repository.RagConfigRepository;
import com.ragassistant.util.EncryptionUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigService {
    private final RagConfigRepository configRepo;
    private final ConfigHistoryRepository historyRepo;
    private final Environment env;

    @Value("${ENCRYPTION_KEY}")
    private String encryptionKey;

    private volatile RagConfig cachedConfig;

    @PostConstruct
    public void initialize() {
        try {
            List<RagConfig> configs = configRepo.findAll();

            if (configs.isEmpty()) {
                log.warn("No configuration found in database.");
                log.info("Creating default configuration...");
                createDefaultConfig();
                reloadConfig();
            } else {
                log.info("Loaded configuration from database (ID={})", configs.get(0).getId());
                log.info("Found {} configurations in database", configs.size());
            }

        } catch (Exception e) {
            log.error("Failed to initialize configuration: {}", e.getMessage());
            throw new RuntimeException("Configuration initialization failed", e);
        }
    }

    @Transactional
    protected void createDefaultConfig() {
        RagConfig config = new RagConfig();

        // API 키는 빈 값으로 초기화 (설정 페이지에서 입력)
        config.setOpenAiApiKeyEncrypted(null);
        config.setUnstructuredApiKeyEncrypted(null);

        // URLs
        config.setUnstructuredApiUrl(env.getProperty("UNSTRUCTURED_API_URL", "https://api.unstructuredapp.io"));
        config.setChromaUrl(env.getProperty("CHROMA_URL", "http://localhost:8000"));
        config.setChromaCollectionName(env.getProperty("CHROMA_COLLECTION_NAME", "rag_collection"));
        config.setLmStudioApiUrl(env.getProperty("LMSTUDIO_API_URL", "http://localhost:1234/v1"));

        // Metadata
        config.setMetadataStrategy("RULE_BASED");
        config.setMetadataAiModel("gpt-4o-mini");
        config.setMetadataLmStudioModel("qwen2.5-7b-instruct-1m");
        config.setMetadataSystemPrompt(
                "You are a professional librarian. Extract metadata from the document in JSON format.");

        // Chunking
        config.setChunkingStrategy("MARKDOWN");
        config.setUnstructuredMaxCharacters(1000);
        config.setUnstructuredChunkingStrategy("by_title");
        config.setUnstructuredOverlap(200);
        config.setChunkingLmStudioModel("qwen2.5-7b-instruct-1m");

        // Embedding
        config.setEmbeddingStrategy("OPENAI");
        config.setEmbeddingOpenAiModel("text-embedding-3-small");
        config.setEmbeddingLmStudioModel("nomic-embed-text");

        // Vector Store
        config.setVectorStoreStrategy("CHROMA");

        // Chat
        config.setChatOpenAiModel("gpt-4o-mini");
        config.setChatLmStudioModel("qwen2.5-7b-instruct-1m");
        config.setChatTemperature(0.0);
        config.setChatRetrievalCount(5);
        config.setChatSimilarityThreshold(0.5);
        config.setChatSystemPrompt("You are a helpful assistant.");
        config.setMaxContextLength(2000);

        config.setIsActive(true);

        configRepo.save(config);
        log.info("Default configuration created. Please set API keys via Settings page.");
    }

    public RagConfig getConfig() {
        if (cachedConfig == null) {
            reloadConfig();
        }
        log.info("==========================================================");
        log.info("Get Config Data : metadataStrategy ({})", cachedConfig.getMetadataStrategy());
        log.info("Get Config Data : metadataAiModel ({})", cachedConfig.getMetadataAiModel());
        log.info("Get Config Data : metadataLmStudioModel ({})", cachedConfig.getMetadataLmStudioModel());
        log.info("==========================================================");
        log.info("Get Config Data : chunkingStrategy ({})", cachedConfig.getChunkingStrategy());
        log.info("==========================================================");
        log.info("Get Config Data : embeddingStrategy ({})", cachedConfig.getEmbeddingStrategy());
        log.info("Get Config Data : embeddingOpenAiModel ({})", cachedConfig.getEmbeddingOpenAiModel());
        log.info("==========================================================");
        log.info("Get Config Data : vectorStoreStrategy ({})", cachedConfig.getVectorStoreStrategy());
        log.info("Get Config Data : chromaCollectionName ({})", cachedConfig.getChromaCollectionName());
        log.info("==========================================================");

        return cachedConfig;
    }

    public String getOpenAiApiKey() {
        try {
            String encrypted = getConfig().getOpenAiApiKeyEncrypted();
            return encrypted != null ? EncryptionUtil.decrypt(encrypted, encryptionKey) : null;
        } catch (Exception e) {
            log.error("Failed to decrypt OpenAI API key: {}", e.getMessage());
            return null;
        }
    }

    public String getUnstructuredApiKey() {
        try {
            String encrypted = getConfig().getUnstructuredApiKeyEncrypted();
            return encrypted != null ? EncryptionUtil.decrypt(encrypted, encryptionKey) : null;
        } catch (Exception e) {
            log.error("Failed to decrypt Unstructured API key: {}", e.getMessage());
            return null;
        }
    }

    @Transactional
    public void updateConfig(RagConfig newConfig, String updatedBy) {
        try {
            List<RagConfig> configs = configRepo.findAll();
            if (configs.isEmpty()) {
                throw new RuntimeException("No configuration found to update");
            }
            RagConfig oldConfig = configs.get(0);

            // API 키 암호화 (변경된 경우만)
            if (newConfig.getOpenAiApiKeyEncrypted() != null &&
                    !newConfig.getOpenAiApiKeyEncrypted().equals(oldConfig.getOpenAiApiKeyEncrypted())) {
                String encrypted = EncryptionUtil.encrypt(newConfig.getOpenAiApiKeyEncrypted(), encryptionKey);
                newConfig.setOpenAiApiKeyEncrypted(encrypted);
            }

            if (newConfig.getUnstructuredApiKeyEncrypted() != null &&
                    !newConfig.getUnstructuredApiKeyEncrypted().equals(oldConfig.getUnstructuredApiKeyEncrypted())) {
                String encrypted = EncryptionUtil.encrypt(newConfig.getUnstructuredApiKeyEncrypted(), encryptionKey);
                newConfig.setUnstructuredApiKeyEncrypted(encrypted);
            }

            // 변경 이력 기록
            recordChanges(oldConfig, newConfig, updatedBy);

            // 설정 업데이트 (기존 ID 유지)
            newConfig.setId(oldConfig.getId());
            newConfig.setUpdatedAt(LocalDateTime.now());
            newConfig.setUpdatedBy(updatedBy);

            configRepo.save(newConfig);
            reloadConfig();

            log.info("Configuration updated by: {}", updatedBy);
        } catch (Exception e) {
            log.error("Failed to update configuration: {}", e.getMessage());
            throw new RuntimeException("Configuration update failed", e);
        }
    }

    private void recordChanges(RagConfig oldConfig, RagConfig newConfig, String updatedBy) {
        try {
            Field[] fields = RagConfig.class.getDeclaredFields();

            for (Field field : fields) {
                field.setAccessible(true);
                Object oldValue = field.get(oldConfig);
                Object newValue = field.get(newConfig);

                // API 키 필드는 이력에서 제외 (보안)
                if (field.getName().contains("ApiKey")) {
                    continue;
                }

                if (oldValue != null && !oldValue.equals(newValue) &&
                        !field.getName().equals("id") &&
                        !field.getName().equals("createdAt") &&
                        !field.getName().equals("updatedAt")) {

                    ConfigHistory history = new ConfigHistory();
                    history.setConfigId(oldConfig.getId());
                    history.setFieldName(field.getName());
                    history.setOldValue(String.valueOf(oldValue));
                    history.setNewValue(String.valueOf(newValue));
                    history.setChangedBy(updatedBy);

                    historyRepo.save(history);
                }
            }
        } catch (Exception e) {
            log.error("Failed to record config changes: {}", e.getMessage());
        }
    }

    public List<ConfigHistory> getHistory() {
        return historyRepo.findByConfigIdOrderByChangedAtDesc(1L);
    }

    public List<ConfigHistory> getFieldHistory(String fieldName) {
        return historyRepo.findByConfigIdAndFieldNameOrderByChangedAtDesc(1L, fieldName);
    }

    public void reloadConfig() {
        List<RagConfig> configs = configRepo.findAll();
        if (configs.isEmpty()) {
            throw new RuntimeException("No configuration found in database");
        }
        this.cachedConfig = configs.get(0);
        log.info("Configuration cache reloaded");
        log.info("Loaded configuration from database ({})", configs.get(0));
    }
}
