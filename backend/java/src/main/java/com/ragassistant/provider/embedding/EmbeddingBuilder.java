package com.ragassistant.provider.embedding;

import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbeddingBuilder {
    private final IngestionConfig config;
    private final OpenAIEmbeddingProvider openAiProvider;
    private final LMStudioEmbeddingProvider lmStudioProvider;

    public List<DocumentChunk> embed(List<DocumentChunk> chunks) {
        String strategy = config.getEmbeddingStrategy().toUpperCase();
        EmbeddingProvider provider;

        if ("LMSTUDIO".equals(strategy)) {
            log.info("Using LMSTUDIO Embedding with model: {}", config.getEmbeddingModel());
            provider = lmStudioProvider;
        } else {
            log.info("Using OPENAI Embedding with model: {}", config.getEmbeddingModel());
            provider = openAiProvider;
        }

        return provider.embed(chunks);
    }
}
