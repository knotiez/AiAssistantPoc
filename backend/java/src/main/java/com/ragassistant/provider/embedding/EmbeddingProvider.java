package com.ragassistant.provider.embedding;

import com.ragassistant.model.DocumentChunk;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface EmbeddingProvider {
    List<DocumentChunk> embed(List<DocumentChunk> chunks);
}
