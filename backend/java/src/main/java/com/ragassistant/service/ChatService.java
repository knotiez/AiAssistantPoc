package com.ragassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.provider.vectorstore.VectorStore;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    private final IngestionConfig config;
    private final SearchService searchService;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse ask(String query) {
        // 1. Semantic Search
        List<VectorStore.SearchResult> allResults = searchService.execute(query, config.getChatRetrievalCount());

        // 2. Filter by threshold
        List<VectorStore.SearchResult> filteredResults = allResults.stream()
                .filter(res -> res.getScore() >= config.getChatSimilarityThreshold())
                .collect(Collectors.toList());

        // 3. Build context
        StringBuilder contextBuilder = new StringBuilder();
        if (!filteredResults.isEmpty()) {
            for (VectorStore.SearchResult res : filteredResults) {
                String fragment = String.format("[출처: %s] %s\n\n",
                        res.getChunk().getMetadata().getTitle(),
                        res.getChunk().getText());

                if (contextBuilder.length() + fragment.length() > config.getMaxContextLength()) {
                    log.warn("Context limit reached. Truncating results.");
                    break;
                }
                contextBuilder.append(fragment);
            }
        }

        String context = contextBuilder.toString();
        String systemPrompt = !context.isEmpty()
                ? String.format("%s\n\n[지식]\n%s", config.getChatSystemPrompt(), context)
                : String.format("%s\n\n(참고할 지식이 없습니다. 해당 내용은 없다고 대답하세요.)", config.getChatSystemPrompt());

        // 4. Generate AI Response
        String answer = callOpenAI(systemPrompt, query);

        // 5. Build Response Object
        return ChatResponse.builder()
                .answer(answer)
                .chunks(filteredResults)
                .fullPrompt(String.format("--- SYSTEM PROMPT ---\n%s\n\n--- USER QUERY ---\n%s", systemPrompt, query))
                .pipelineInfo(Map.of(
                        "embeddingStrategy", config.getEmbeddingStrategy(),
                        "chatModel", config.getChatAiModel()))
                .build();
    }

    private String callOpenAI(String systemPrompt, String userQuery) {
        try {
            Map<String, Object> payload = Map.of(
                    "model", config.getChatAiModel(),
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userQuery)),
                    "temperature", config.getChatTemperature());

            RequestBody body = RequestBody.create(
                    objectMapper.writeValueAsString(payload),
                    MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/chat/completions")
                    .header("Authorization", "Bearer " + config.getOpenAiApiKey())
                    .post(body)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    return "AI Error: " + response.code();
                }
                JsonNode root = objectMapper.readTree(response.body().string());
                return root.path("choices").get(0).path("message").path("content").asText();
            }
        } catch (IOException e) {
            log.error("OpenAI call failed: {}", e.getMessage());
            return "AI Error: " + e.getMessage();
        }
    }

    @Data
    @Builder
    public static class ChatResponse {
        private String answer;
        private List<VectorStore.SearchResult> chunks;
        private String fullPrompt;
        private Map<String, Object> pipelineInfo;
    }
}
