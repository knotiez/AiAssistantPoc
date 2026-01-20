package com.ragassistant.provider.chunking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class LMStudioChunkingProvider implements ChunkingProvider {

    private final IngestionConfig config;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();

    @Override
    public List<DocumentChunk> splitDocument(String content, DocumentChunk.ChunkMetadata metadata) {
        log.info("[LM Studio Chunking] Processing document: {} (Length: {})", metadata.getTitle(), content.length());

        // 너무 긴 문서는 1차적으로 문단 단위로 나누거나 제한을 두어야 하지만,
        // 여기서는 예시로 전체를 보내거나 앞부분만 잘라서 보냅니다.
        // LLM 컨텍스트 윈도우를 고려해야 합니다.
        String textToProcess = content;
        if (content.length() > 10000) {
            log.warn("[LM Studio Chunking] Content too long ({}), truncating to 10000 chars for semantic chunking.",
                    content.length());
            textToProcess = content.substring(0, 10000);
        }

        try {
            List<String> textChunks = callLmStudioForChunking(textToProcess);

            List<DocumentChunk> chunks = new ArrayList<>();
            for (int i = 0; i < textChunks.size(); i++) {
                chunks.add(DocumentChunk.builder()
                        .id(UUID.randomUUID().toString())
                        .text(textChunks.get(i))
                        .metadata(metadata)
                        // .chunkIndex(i) // Feature stub
                        .build());
            }

            log.info("[LM Studio Chunking] Successfully created {} chunks", chunks.size());
            return chunks;

        } catch (Exception e) {
            log.error("[LM Studio Chunking] Failed to chunk document: {}", e.getMessage());
            // Fallback: Simple paragraph split or return whole
            log.info("[LM Studio Chunking] Falling back to simple paragraph split");
            return fallbackSplit(content, metadata);
        }
    }

    private List<String> callLmStudioForChunking(String text) throws IOException {
        String model = config.getChunkingLmStudioModel();
        // 모델이 설정되지 않았을 경우 기본값
        if (model == null || model.isEmpty()) {
            model = "qwen2.5-7b-instruct-1m";
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", model);
        payload.put("temperature", 0.0);

        ArrayNode messages = payload.putArray("messages");

        // System Prompt
        ObjectNode systemMsg = messages.addObject();
        systemMsg.put("role", "system");
        systemMsg.put("content",
                "You are a semantic chunking assistant. Split the following text into logical, semantic chunks properly. \n"
                        +
                        "Return the response strictly as a JSON object with a key 'chunks' containing an array of strings. \n"
                        +
                        "Example: {\"chunks\": [\"chunk 1 text...\", \"chunk 2 text...\"]}");

        // User Prompt
        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", text);

        // JSON 모드 강제 (지원하는 모델인 경우)
        ObjectNode responseFormat = payload.putObject("response_format");
        responseFormat.put("type", "json_object");

        String url = config.getLmStudioApiUrl() + "/chat/completions";

        RequestBody body = RequestBody.create(
                objectMapper.writeValueAsString(payload),
                MediaType.parse("application/json"));

        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            String respBody = response.body().string();
            JsonNode root = objectMapper.readTree(respBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();

            // Parse JSON content
            JsonNode jsonContent = objectMapper.readTree(content);
            List<String> chunks = new ArrayList<>();
            if (jsonContent.has("chunks")) {
                jsonContent.get("chunks").forEach(node -> chunks.add(node.asText()));
            } else {
                // 혹시 포맷이 안 맞을 경우 전체를 하나로 보거나 에러 처리
                chunks.add(content);
            }
            return chunks;
        }
    }

    private List<DocumentChunk> fallbackSplit(String content, DocumentChunk.ChunkMetadata metadata) {
        // 간단하게 줄바꿈 2번으로 분리
        String[] parts = content.split("\n\n");
        List<DocumentChunk> chunks = new ArrayList<>();
        int index = 0;
        for (String part : parts) {
            if (part.trim().isEmpty())
                continue;
            chunks.add(DocumentChunk.builder()
                    .id(UUID.randomUUID().toString())
                    .text(part.trim())
                    .metadata(metadata)
                    // .chunkIndex(index++)
                    .build());
        }
        return chunks;
    }
}
