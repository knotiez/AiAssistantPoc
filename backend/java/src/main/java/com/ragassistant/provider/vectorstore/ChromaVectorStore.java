package com.ragassistant.provider.vectorstore;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ragassistant.config.IngestionConfig;
import com.ragassistant.model.DocumentChunk;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChromaVectorStore implements VectorStore {
    private final IngestionConfig config;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private String collectionId;

    @PostConstruct
    public void init() {
        try {
            collectionId = getOrCreateCollection(config.getChromaCollectionName());
            log.info("Connected to ChromaDB Collection: {} (ID: {})", config.getChromaCollectionName(), collectionId);
        } catch (Exception e) {
            log.error("Failed to connect to ChromaDB: {}", e.getMessage());
        }
    }

    private String getOrCreateCollection(String name) throws IOException {
        // 1. Get collection by name (using default tenant/database)
        Request getRequest = new Request.Builder()
                .url(config.getChromaUrl() + "/api/v2/tenants/default_tenant/databases/default_database/collections/"
                        + name)
                .get()
                .build();

        try (Response response = httpClient.newCall(getRequest).execute()) {
            if (response.isSuccessful()) {
                JsonNode node = objectMapper.readTree(response.body().string());
                return node.get("id").asText();
            }
        }

        // 2. Create if not exists
        String payload = objectMapper.writeValueAsString(Map.of("name", name));
        Request createRequest = new Request.Builder()
                .url(config.getChromaUrl() + "/api/v2/tenants/default_tenant/databases/default_database/collections")
                .post(RequestBody.create(payload, MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(createRequest).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to create collection: " + response.body().string());
            }
            JsonNode node = objectMapper.readTree(response.body().string());
            return node.get("id").asText();
        }
    }

    @Override
    public void storeChunk(DocumentChunk chunk) {
        storeChunks(Collections.singletonList(chunk));
    }

    @Override
    public void storeChunks(List<DocumentChunk> chunks) {
        if (collectionId == null || chunks.isEmpty())
            return;

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            ArrayNode ids = payload.putArray("ids");
            ArrayNode embeddings = payload.putArray("embeddings");
            ArrayNode metadatas = payload.putArray("metadatas");
            ArrayNode documents = payload.putArray("documents");

            for (DocumentChunk chunk : chunks) {
                if (chunk.getMetadata().getEmbedding() == null)
                    continue;

                ids.add(chunk.getId());

                ArrayNode vecNode = embeddings.addArray();
                for (Double d : chunk.getMetadata().getEmbedding())
                    vecNode.add(d);

                ObjectNode meta = metadatas.addObject();
                meta.put("title", chunk.getMetadata().getTitle());
                meta.put("filePath", chunk.getMetadata().getFilePath());
                meta.put("docType", chunk.getMetadata().getDocType());
                meta.put("updatedAt", chunk.getMetadata().getUpdatedAt());
                meta.put("version", chunk.getMetadata().getVersion());
                meta.put("sectionTitle", chunk.getMetadata().getSectionTitle());
                meta.put("chunkIndex", chunk.getMetadata().getChunkIndex());
                meta.put("permission", String.join(",", chunk.getMetadata().getPermission()));

                documents.add(chunk.getText());
            }

            Request request = new Request.Builder()
                    .url(config.getChromaUrl()
                            + "/api/v2/tenants/default_tenant/databases/default_database/collections/" + collectionId
                            + "/upsert")
                    .post(RequestBody.create(objectMapper.writeValueAsString(payload),
                            MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Failed to upsert to ChromaDB: {}", response.body().string());
                } else {
                    log.info("Stored {} chunks to ChromaDB", chunks.size());
                }
            }
        } catch (IOException e) {
            log.error("Error storing chunks: {}", e.getMessage());
        }
    }

    @Override
    public List<SearchResult> search(List<Double> queryVector, int topK) {
        if (collectionId == null)
            return Collections.emptyList();

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            ArrayNode vecArray = payload.putArray("query_embeddings");
            ArrayNode vec = vecArray.addArray();
            for (Double d : queryVector)
                vec.add(d);
            payload.put("n_results", topK);

            Request request = new Request.Builder()
                    .url(config.getChromaUrl()
                            + "/api/v2/tenants/default_tenant/databases/default_database/collections/" + collectionId
                            + "/query")
                    .post(RequestBody.create(objectMapper.writeValueAsString(payload),
                            MediaType.parse("application/json")))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode root = objectMapper.readTree(response.body().string());
                List<SearchResult> results = new ArrayList<>();

                JsonNode ids = root.path("ids").get(0);
                JsonNode distances = root.path("distances").get(0);
                JsonNode metadatas = root.path("metadatas").get(0);
                JsonNode documents = root.path("documents").get(0);

                if (ids != null) {
                    for (int i = 0; i < ids.size(); i++) {
                        double dist = distances.get(i).asDouble();
                        DocumentChunk.ChunkMetadata meta = DocumentChunk.ChunkMetadata.builder()
                                .title(metadatas.get(i).path("title").asText())
                                .filePath(metadatas.get(i).path("filePath").asText())
                                .docType(metadatas.get(i).path("docType").asText())
                                .updatedAt(metadatas.get(i).path("updatedAt").asText())
                                .version(metadatas.get(i).path("version").asText())
                                .sectionTitle(metadatas.get(i).path("sectionTitle").asText())
                                .permission(Arrays.asList(metadatas.get(i).path("permission").asText().split(",")))
                                .build();

                        results.add(SearchResult.builder()
                                .chunk(DocumentChunk.builder()
                                        .id(ids.get(i).asText())
                                        .text(documents.get(i).asText())
                                        .metadata(meta)
                                        .build())
                                .score(1.0 - dist)
                                .build());
                    }
                }
                return results;
            }
        } catch (IOException e) {
            log.error("Search error: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<StoredFileInfo> getStoredFiles() {
        // Implementation for listing files (similar to JS)
        return Collections.emptyList(); // Simplified for now
    }

    @Override
    public void clearAll() {
        try {
            Request deleteRequest = new Request.Builder()
                    .url(config.getChromaUrl()
                            + "/api/v2/tenants/default_tenant/databases/default_database/collections/"
                            + config.getChromaCollectionName())
                    .delete()
                    .build();
            httpClient.newCall(deleteRequest).execute();
            init(); // Re-create
        } catch (IOException e) {
            log.error("Clear error: {}", e.getMessage());
        }
    }
}
