package com.ragassistant.provider.metadata;

import com.ragassistant.model.DocumentChunk;
import com.ragassistant.service.DocTypeClassifier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleBasedMetadataProvider implements MetadataProvider {
    private final DocTypeClassifier classifier;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
            .withZone(ZoneId.systemDefault());

    @Override
    public DocumentChunk.ChunkMetadata extract(String filePath, String rawText, String filename) {
        File file = new File(filePath);
        String leafName = (filename != null) ? filename : file.getName();
        String title = leafName.replace(".md", "");

        String classificationPath = (filename != null) ? "/manual/" + filename : filePath;
        String docType = classifier.classify(classificationPath);

        String updatedAt = formatter.format(Instant.ofEpochMilli(file.lastModified()));
        String version = leafName.contains("_old") ? "old" : "current";
        List<String> permissions = mapPermissions(docType);

        return DocumentChunk.ChunkMetadata.builder()
                .title(title)
                .docType(docType)
                .version(version)
                .updatedAt(updatedAt)
                .filePath(filePath)
                .permission(permissions)
                .build();
    }

    private List<String> mapPermissions(String docType) {
        List<String> permissions = new ArrayList<>();
        switch (docType) {
            case "runbook":
                permissions.add("MANAGER");
                permissions.add("ADMIN");
                break;
            case "adr":
                permissions.add("USER");
                permissions.add("MANAGER");
                permissions.add("ADMIN");
                break;
            default:
                permissions.add("USER");
                break;
        }
        return permissions;
    }
}
