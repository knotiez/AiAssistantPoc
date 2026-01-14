package com.ragassistant.provider.metadata;

import com.ragassistant.model.DocumentChunk;

public interface MetadataProvider {
    DocumentChunk.ChunkMetadata extract(String filePath, String rawText, String filename);
}
