package com.ragassistant.provider.metadata;

import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * MetadataBuilder
 * 
 * .env 설정(METADATA_STRATEGY)에 따라 적절한 MetadataProvider를 선택하여 사용합니다.
 * 
 * 지원하는 전략:
 * - RULE_BASED: 규칙 기반 메타데이터 추출
 * - OPENAI_BASED: OpenAI GPT 모델 사용
 * - LMSTUDIO_BASED: LM Studio 모델 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MetadataBuilder {
    private final IngestionConfig config;
    private final RuleBasedMetadataProvider ruleBasedProvider;
    private final OpenAiMetadataProvider openAiProvider;
    private final LMStudioMetadataProvider lmStudioProvider;

    public DocumentChunk.ChunkMetadata extract(String filePath, String content, String filename) {
        String strategy = config.getMetadataStrategy().toUpperCase();
        MetadataProvider provider;

        switch (strategy) {
            case "OPENAI_BASED":
                log.info("Using OPENAI_BASED Metadata Extraction Strategy with model: {}",
                        config.getMetadataAiModel());
                provider = openAiProvider;
                break;
            case "LMSTUDIO_BASED":
                log.info("Using LMSTUDIO_BASED Metadata Extraction Strategy with model: {}",
                        config.getMetadataAiModel());
                provider = lmStudioProvider;
                break;
            case "RULE_BASED":
            default:
                log.info("Using RULE_BASED Metadata Extraction Strategy");
                provider = ruleBasedProvider;
                break;
        }

        return provider.extract(filePath, content, filename);
    }
}
