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

import java.io.File;
import java.time.LocalDate;
import java.util.Arrays;

/**
 * OpenAI 기반 메타데이터 추출기
 * GPT 모델을 사용하여 문서 내용을 분석하고 지능형 메타데이터를 추출합니다.
 * Structured Output (json_schema)를 사용하여 정확한 JSON 응답을 보장합니다.
 */
@Slf4j
@Service("openAiMetadataProvider")
public class OpenAiMetadataProvider implements MetadataProvider {

        private final IngestionConfig config;
        private final ObjectMapper objectMapper;
        private final OkHttpClient httpClient;

        public OpenAiMetadataProvider(IngestionConfig config) {
                this.config = config;
                this.objectMapper = new ObjectMapper();
                this.httpClient = new OkHttpClient();
        }

        @Override
        public DocumentChunk.ChunkMetadata extract(String filePath, String rawText, String filename) {
                File file = new File(filePath);
                String leafName = (filename != null) ? filename : file.getName();
                String titleFromPath = leafName.replace(".md", "");

                log.info("[AI Metadata] Analyzing content for: {}", leafName);

                try {
                        // 문서 내용의 첫 2000자만 전송 (비용 절감 및 속도 향상)
                        String contentPreview = rawText.length() > 2000
                                        ? rawText.substring(0, 2000)
                                        : rawText;

                        // JSON 페이로드 구성
                        ObjectNode payload = objectMapper.createObjectNode();
                        payload.put("model", config.getMetadataAiModel());

                        // 메시지 배열 구성
                        ArrayNode messages = payload.putArray("messages");

                        ObjectNode systemMsg = messages.addObject();
                        systemMsg.put("role", "system");
                        systemMsg.put("content", config.getMetadataSystemPrompt());

                        ObjectNode userMsg = messages.addObject();
                        userMsg.put("role", "user");
                        userMsg.put("content", "Document Content (First 2000 chars):\n" + contentPreview);

                        // Structured Output - json_schema 사용
                        ObjectNode responseFormat = payload.putObject("response_format");
                        responseFormat.put("type", "json_schema");
                        ObjectNode jsonSchema = responseFormat.putObject("json_schema");
                        jsonSchema.put("name", "ai_document_metadata");
                        jsonSchema.put("strict", true);

                        // 스키마 정의
                        ObjectNode schema = jsonSchema.putObject("schema");
                        schema.put("type", "object");
                        schema.put("additionalProperties", false);

                        // Required 필드
                        ArrayNode required = schema.putArray("required");
                        required.add("title");
                        required.add("docType");
                        required.add("permission");
                        required.add("summary");

                        // Properties 정의
                        ObjectNode properties = schema.putObject("properties");

                        properties.putObject("title").put("type", "string");

                        ObjectNode docType = properties.putObject("docType");
                        docType.put("type", "string");
                        ArrayNode docTypeEnum = docType.putArray("enum");
                        docTypeEnum.add("runbook");
                        docTypeEnum.add("adr");
                        docTypeEnum.add("manual");
                        docTypeEnum.add("law");

                        ObjectNode permission = properties.putObject("permission");
                        permission.put("type", "array");
                        ObjectNode permissionItems = permission.putObject("items");
                        permissionItems.put("type", "string");
                        ArrayNode permissionEnum = permissionItems.putArray("enum");
                        permissionEnum.add("USER");
                        permissionEnum.add("ADMIN");

                        properties.putObject("summary").put("type", "string");

                        // API 호출
                        Request request = new Request.Builder()
                                        .url("https://api.openai.com/v1/chat/completions")
                                        .header("Authorization", "Bearer " + config.getOpenAiApiKey())
                                        .post(RequestBody.create(objectMapper.writeValueAsString(payload),
                                                        MediaType.parse("application/json")))
                                        .build();

                        try (Response response = httpClient.newCall(request).execute()) {
                                if (!response.isSuccessful()) {
                                        String errorBody = response.body() != null ? response.body().string()
                                                        : "Unknown error";
                                        log.error("[AI Metadata] Request failed: {} - {}", response.code(), errorBody);
                                        throw new RuntimeException("OpenAI API Error: " + response.code());
                                }

                                String respBody = response.body().string();
                                JsonNode root = objectMapper.readTree(respBody);
                                String content = root.path("choices").get(0).path("message").path("content")
                                                .asText("{}");

                                AiDocumentMetadata aiData = objectMapper.readValue(content, AiDocumentMetadata.class);

                                log.info("[AI Metadata] Successfully extracted metadata for: {}", leafName);

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
                        log.error("[AI Metadata] Extraction failed for {}: {}", leafName, e.getMessage());
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
