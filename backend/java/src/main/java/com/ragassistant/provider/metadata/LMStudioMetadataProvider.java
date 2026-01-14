package com.ragassistant.provider.metadata;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.AiDocumentMetadata;
import com.ragassistant.model.DocumentChunk;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;
import com.ragassistant.model.AiDocumentMetadata;
import com.ragassistant.model.DocumentChunk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.Arrays;

/**
 * LM Studio 로컬 모델 기반 메타데이터 추출기
 * 로컬에서 실행되는 LLM을 사용하여 문서 내용을 분석합니다.
 */
@Slf4j
@Service("lmStudioMetadataProvider")
public class LMStudioMetadataProvider implements MetadataProvider {

        private final IngestionConfig config;
        private final ObjectMapper objectMapper;
        private final OkHttpClient httpClient;

        public LMStudioMetadataProvider(IngestionConfig config) {
                this.config = config;
                this.objectMapper = new ObjectMapper();
                this.httpClient = new OkHttpClient();
        }

        @Override
        public DocumentChunk.ChunkMetadata extract(String filePath, String rawText, String filename) {
                File file = new File(filePath);
                String leafName = (filename != null) ? filename : file.getName();
                String titleFromPath = leafName.replace(".md", "");

                log.info("[LM Studio Metadata] Analyzing with local model: {}", leafName);

                try {
                        // 문서 내용의 첫 2000자만 전송
                        String contentPreview = rawText.length() > 2000
                                        ? rawText.substring(0, 2000)
                                        : rawText;

                        ObjectNode payload = objectMapper.createObjectNode();
                        payload.put("model", config.getMetadataAiModel());
                        payload.put("temperature", 0.0);

                        ArrayNode messages = payload.putArray("messages");

                        ObjectNode systemMsg = messages.addObject();
                        systemMsg.put("role", "system");
                        systemMsg.put("content", config.getMetadataSystemPrompt());

                        ObjectNode userMsg = messages.addObject();
                        userMsg.put("role", "user");
                        userMsg.put("content", "Document Content (First 2000 chars):\n" + contentPreview);

                        // Response format for JSON (supported by newer LM Studio versions)
                        ObjectNode responseFormat = payload.putObject("response_format");
                        responseFormat.put("type", "json_schema");

                        Request request = new Request.Builder()
                                        .url(config.getLmStudioApiUrl() + "/chat/completions")
                                        .post(RequestBody.create(objectMapper.writeValueAsString(payload),
                                                        MediaType.parse("application/json")))
                                        .build();

                        try (Response response = httpClient.newCall(request).execute()) {
                                if (!response.isSuccessful()) {
                                        String errorBody = response.body() != null ? response.body().string()
                                                        : "Unknown error";
                                        log.error("[LM Studio Metadata] Request failed: {} - {}", response.code(),
                                                        errorBody);
                                        throw new RuntimeException("LM Studio API Error: " + response.code());
                                }

                                String respBody = response.body().string();
                                JsonNode root = objectMapper.readTree(respBody);
                                String content = root.path("choices").get(0).path("message").path("content")
                                                .asText("{}");

                                AiDocumentMetadata aiData = objectMapper.readValue(content, AiDocumentMetadata.class);

                                log.info("[LM Studio Metadata] Successfully extracted metadata for: {}", leafName);

                                return DocumentChunk.ChunkMetadata.builder()
                                                .title(aiData.getTitle() != null ? aiData.getTitle() : titleFromPath)
                                                .docType(aiData.getDocType() != null ? aiData.getDocType() : "manual")
                                                .permission(aiData.getPermission() != null ? aiData.getPermission()
                                                                : Arrays.asList("USER"))
                                                .summary(aiData.getSummary())
                                                .version("current")
                                                .updatedAt(LocalDate.now().toString())
                                                .filePath(filePath)
                                                .build();
                        }

                } catch (Exception e) {
                        log.error("[LM Studio Metadata] Extraction failed for {}: {}", leafName, e.getMessage());
                        // 실패 시 기본값 반환
                        return DocumentChunk.ChunkMetadata.builder()
                                        .title(titleFromPath)
                                        .docType("manual")
                                        .permission(Arrays.asList("USER"))
                                        .version("current")
                                        .updatedAt(LocalDate.now().toString())
                                        .filePath(filePath)
                                        .build();
                }
        }
}
