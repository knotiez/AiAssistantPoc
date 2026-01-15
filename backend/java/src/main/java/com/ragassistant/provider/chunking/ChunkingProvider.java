package com.ragassistant.provider.chunking;

import com.ragassistant.model.DocumentChunk;
import java.util.List;

public interface ChunkingProvider {
    List<DocumentChunk> splitDocument(String content, DocumentChunk.ChunkMetadata meta);
}
