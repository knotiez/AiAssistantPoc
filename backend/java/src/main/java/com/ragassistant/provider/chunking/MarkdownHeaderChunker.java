package com.ragassistant.provider.chunking;

import com.ragassistant.model.DocumentChunk;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MarkdownHeaderChunker implements ChunkingProvider {

    @Override
    public List<DocumentChunk> splitDocument(String rawText, DocumentChunk.ChunkMetadata commonMeta) {
        String[] lines = rawText.split("\n");
        List<DocumentChunk> chunks = new ArrayList<>();

        String currentSectionTitle = "Root";
        List<String> currentContent = new ArrayList<>();
        int chunkIndex = 0;

        for (String line : lines) {
            if (line.startsWith("## ") || line.startsWith("### ")) {
                if (!currentContent.isEmpty()) {
                    addChunk(chunks, currentContent, currentSectionTitle, chunkIndex++, commonMeta);
                    currentContent = new ArrayList<>();
                }
                currentSectionTitle = line.replace("#", "").trim();
            }
            currentContent.add(line);
        }

        if (!currentContent.isEmpty()) {
            addChunk(chunks, currentContent, currentSectionTitle, chunkIndex++, commonMeta);
        }

        return chunks;
    }

    private void addChunk(List<DocumentChunk> chunks, List<String> content, String sectionTitle, int chunkIndex,
            DocumentChunk.ChunkMetadata commonMeta) {
        String text = String.join("\n", content).trim();
        if (text.isEmpty())
            return;

        String id = String.format("%s#%s#%d", commonMeta.getFilePath(), sectionTitle, chunkIndex);

        // Create a copy of commonMeta
        DocumentChunk.ChunkMetadata meta = DocumentChunk.ChunkMetadata.builder()
                .title(commonMeta.getTitle())
                .filePath(commonMeta.getFilePath())
                .docType(commonMeta.getDocType())
                .updatedAt(commonMeta.getUpdatedAt())
                .version(commonMeta.getVersion())
                .summary(commonMeta.getSummary())
                .permission(commonMeta.getPermission())
                .sectionTitle(sectionTitle)
                .chunkIndex(chunkIndex)
                .build();

        chunks.add(DocumentChunk.builder()
                .id(id)
                .text(text)
                .metadata(meta)
                .build());
    }
}
