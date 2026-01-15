package com.ragassistant.provider.chunking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UnstructuredChunkingProvider implements ChunkingProvider {
    private final IngestionConfig config;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<DocumentChunk> splitDocument(String rawText, DocumentChunk.ChunkMetadata commonMeta) {
        log.info("[Unstructured] Processing content for file: {} (Size: {} chars)", commonMeta.getFilePath(),
                rawText.length());

        try {
            // Unstructured API expects a file. Since we have rawText, we need to create a
            // temporary file or in-memory file.
            // Using OkHttp's RequestBody.create with byte array/string is easier.

            // Build Multipart Body
            MultipartBody.Builder builder = new MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("files", new File(commonMeta.getFilePath()).getName(),
                            RequestBody.create(rawText.getBytes(StandardCharsets.UTF_8),
                                    MediaType.parse("text/markdown")));
            // Removed strategy=fast and chunking_strategy=by_title to get RAW elements.
            // This avoids potential data loss or over-agglomeration issues.
            // These are now handled by the `max_characters` and `overlap` parameters.
            builder.addFormDataPart("max_characters", "1000")
                    .addFormDataPart("overlap", "200");

            String url = config.getUnstructuredApiUrl() + "/general/v0/general";
            log.info("[Unstructured] Calling API URL: {}", url);

            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Accept", "application/json")
                    .addHeader("unstructured-api-key", config.getUnstructuredApiKey())
                    .post(builder.build())
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                    throw new IOException("Unstructured API error (" + response.code() + "): " + errorBody);
                }

                String responseBody = response.body().string();
                JsonNode elements = objectMapper.readTree(responseBody);

                List<DocumentChunk> chunks = new ArrayList<>();
                int index = 0;

                if (elements.isArray()) {
                    log.info("[Unstructured] Received {} elements from API", elements.size());
                    for (JsonNode el : elements) {
                        String text = el.path("text").asText("");
                        if (text.isEmpty())
                            continue;

                        String parentId = el.path("metadata").path("parent_id").asText("General");
                        String sectionTitle = parentId; // Unstructured usually returns hierarchy id, not title
                                                        // directly, simplified mapping here.

                        // Debug log for first few elements
                        if (index < 3) {
                            log.info("[Unstructured] Element {}: Type={}, TextPrefix={}",
                                    index, el.path("type").asText(), text.substring(0, Math.min(text.length(), 50)));
                        }

                        String id = String.format("%s#%s#%d", commonMeta.getFilePath(), sectionTitle, index);

                        DocumentChunk.ChunkMetadata meta = DocumentChunk.ChunkMetadata.builder()
                                .title(commonMeta.getTitle())
                                .filePath(commonMeta.getFilePath())
                                .docType(commonMeta.getDocType())
                                .updatedAt(commonMeta.getUpdatedAt())
                                .version(commonMeta.getVersion())
                                .summary(commonMeta.getSummary())
                                .permission(commonMeta.getPermission())
                                .sectionTitle(sectionTitle)
                                .chunkIndex(index)
                                .build();

                        chunks.add(DocumentChunk.builder()
                                .id(id)
                                .text(text)
                                .metadata(meta)
                                .build());
                        index++;
                    }
                } else {
                    log.warn("[Unstructured] Response is not an array!");
                }
                return chunks;
            }

        } catch (Exception e) {
            log.error("[Error] Unstructured chunking failed: {}", e.getMessage());
            // Fallback or rethrow?
            // For now, return empty list or throw to let service handle failure.
            throw new RuntimeException("Unstructured chunking failed", e);
        }
    }
}
