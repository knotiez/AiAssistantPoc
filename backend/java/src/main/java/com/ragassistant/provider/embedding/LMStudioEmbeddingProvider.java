package com.ragassistant.provider.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LMStudioEmbeddingProvider implements EmbeddingProvider {
    private final IngestionConfig config;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<DocumentChunk> embed(List<DocumentChunk> chunks) {
        for (DocumentChunk chunk : chunks) {
            log.info("[LM Studio Embed] Starting embedding for chunk: {}", chunk.getId());

            try {
                String payload = objectMapper.writeValueAsString(Map.of(
                        "model", config.getEmbeddingModel(),
                        "input", chunk.getText()));

                RequestBody body = RequestBody.create(
                        payload,
                        MediaType.parse("application/json; charset=utf-8"));

                Request request = new Request.Builder()
                        .url(config.getLmStudioApiUrl() + "/embeddings")
                        .post(body)
                        .build();

                try (Response response = httpClient.newCall(request).execute()) {
                    if (!response.isSuccessful()) {
                        log.error("[LM Studio Embed Error] HTTP Status: {}", response.code());
                        continue;
                    }

                    JsonNode root = objectMapper.readTree(response.body().string());
                    JsonNode embeddingNode = root.path("data").get(0).path("embedding");

                    List<Double> vector = new ArrayList<>();
                    if (embeddingNode.isArray()) {
                        for (JsonNode val : embeddingNode) {
                            vector.add(val.asDouble());
                        }
                    }

                    chunk.getMetadata().setEmbedding(vector);
                    log.info("[LM Studio Embed] Success. Vector length: {}", vector.size());
                }
            } catch (IOException e) {
                log.error("[LM Studio Embed Error] {}", e.getMessage());
            }
        }
        return chunks;
    }
}
