package com.ragassistant.provider.embedding;

import com.ragassistant.model.DocumentChunk;
import java.util.List;

public interface EmbeddingProvider {
    List<DocumentChunk> embed(List<DocumentChunk> chunks);
}
