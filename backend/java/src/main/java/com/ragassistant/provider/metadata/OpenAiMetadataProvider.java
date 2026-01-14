package com.ragassistant.provider.metadata;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.*;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.AiDocumentMetadata;
import com.ragassistant.model.DocumentChunk;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDate;
import java.util.Arrays;

/**
 * OpenAI 기반 메타데이터 추출기
 * GPT 모델을 사용하여 문서 내용을 분석하고 지능형 메타데이터를 추출합니다.
 */
@Slf4j
@Service("openAiMetadataProvider")
public class OpenAiMetadataProvider implements MetadataProvider {

        private final OpenAIClient client;
        private final IngestionConfig config;
        private final ObjectMapper objectMapper;

        public OpenAiMetadataProvider(IngestionConfig config) {
                this.config = config;
                this.client = OpenAIOkHttpClient.builder()
                                .apiKey(config.getOpenAiApiKey())
                                .build();
                this.objectMapper = new ObjectMapper();
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

                        ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                                        .model(config.getMetadataAiModel())
                                        .addMessage(ChatCompletionMessageParam.ofChatCompletionSystemMessageParam(
                                                        ChatCompletionSystemMessageParam.builder()
                                                                        .content(ChatCompletionSystemMessageParam.Content
                                                                                        .ofTextContent(
                                                                                                        config.getMetadataSystemPrompt()))
                                                                        .build()))
                                        .addMessage(ChatCompletionMessageParam.ofChatCompletionUserMessageParam(
                                                        ChatCompletionUserMessageParam.builder()
                                                                        .content(ChatCompletionUserMessageParam.Content
                                                                                        .ofTextContent(
                                                                                                        "Document Content (First 2000 chars):\n"
                                                                                                                        + contentPreview))
                                                                        .build()))
                                        .responseFormat(ChatCompletionCreateParams.ResponseFormat
                                                        .ofResponseFormatJsonObject(
                                                                        ResponseFormatJsonObject.builder()
                                                                                        .type(ResponseFormatJsonObject.Type.JSON_OBJECT)
                                                                                        .build()))
                                        .build();

                        ChatCompletion response = client.chat().completions().create(params);

                        String content = response.choices().get(0).message().content().orElse("{}");
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
