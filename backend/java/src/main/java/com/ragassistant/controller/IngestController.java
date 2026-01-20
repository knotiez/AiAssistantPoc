package com.ragassistant.controller;

import com.ragassistant.service.IngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
public class IngestController {
    private final IngestionService ingestionService;

    @PostMapping
    public ResponseEntity<?> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "No files provided"));
        }

        int totalFiles = files.length;
        int filesProcessed = 0;
        java.util.List<Map<String, String>> failedFiles = new java.util.ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                failedFiles.add(Map.of(
                        "filename", file.getOriginalFilename(),
                        "error", "File is empty"));
                continue;
            }

            try {
                // Read file content FIRST (before transferTo which exhausts the stream)
                String content = new String(file.getBytes(), StandardCharsets.UTF_8);

                // Save temporary file - create parent directories if needed
                String tempDir = System.getProperty("java.io.tmpdir");
                Path tempPath = Paths.get(tempDir, file.getOriginalFilename());

                // Create parent directories if they don't exist
                if (tempPath.getParent() != null) {
                    Files.createDirectories(tempPath.getParent());
                }

                file.transferTo(tempPath.toFile());

                IngestionService.ProcessResult result = ingestionService.processFile(
                        file.getOriginalFilename(),
                        content,
                        tempPath.toAbsolutePath().toString());

                // Clean up temp file
                Files.deleteIfExists(tempPath);

                filesProcessed++;
                log.info("Successfully processed file: {}", file.getOriginalFilename());
            } catch (Exception e) {
                log.error("File processing error for {}: {}", file.getOriginalFilename(), e.getMessage());
                failedFiles.add(Map.of(
                        "filename", file.getOriginalFilename(),
                        "error", e.getMessage()));
            }
        }

        boolean allSuccess = filesProcessed == totalFiles;
        return ResponseEntity.ok(Map.of(
                "success", allSuccess,
                "message", allSuccess
                        ? "All files processed successfully"
                        : String.format("Processed %d/%d files", filesProcessed, totalFiles),
                "totalFiles", totalFiles,
                "filesProcessed", filesProcessed,
                "failedFiles", failedFiles));
    }

    @GetMapping("/sources")
    public ResponseEntity<?> getSources() {
        try {
            List<com.ragassistant.model.entity.SourceDocument> sources = ingestionService.getAllSources();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "sources", sources));
        } catch (Exception e) {
            log.error("Failed to fetch sources: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to fetch sources: " + e.getMessage()));
        }
    }

    @DeleteMapping("/DeleteAll")
    public ResponseEntity<?> deleteAllSources() {
        try {
            ingestionService.deleteAllSources();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "All sources deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete sources: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to delete sources: " + e.getMessage()));
        }
    }
}
