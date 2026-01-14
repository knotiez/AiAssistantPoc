package com.ragassistant.controller;

import com.ragassistant.service.IngestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ingest")
@RequiredArgsConstructor
public class IngestController {
    private final IngestionService ingestionService;

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        try {
            // Save temporary file (mimicking disk storage in NestJS)
            String tempDir = System.getProperty("java.io.tmpdir");
            Path tempPath = Paths.get(tempDir, file.getOriginalFilename());
            file.transferTo(tempPath.toFile());

            String content = new String(file.getBytes(), StandardCharsets.UTF_8);

            IngestionService.ProcessResult result = ingestionService.processFile(
                    file.getOriginalFilename(),
                    content,
                    tempPath.toAbsolutePath().toString());

            // Clean up temp file
            Files.deleteIfExists(tempPath);

            return ResponseEntity.ok(result);
        } catch (IOException e) {
            log.error("File upload error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/sources")
    public ResponseEntity<?> getSources() {
        // To be implemented via vectorStore.getStoredFiles()
        return ResponseEntity.ok(Map.of("message", "Not implemented yet"));
    }
}
