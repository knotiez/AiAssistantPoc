package com.ragassistant.controller;

import com.ragassistant.model.ConfigHistory;
import com.ragassistant.model.RagConfig;
import com.ragassistant.service.ConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {
    private final ConfigService configService;

    /**
     * GET /api/config
     * 현재 활성 설정 조회
     */
    @GetMapping
    public ResponseEntity<RagConfig> getConfig() {
        return ResponseEntity.ok(configService.getConfig());
    }

    /**
     * PUT /api/config
     * 설정 업데이트
     */
    @PutMapping
    public ResponseEntity<?> updateConfig(
            @RequestBody RagConfig newConfig,
            @RequestParam(name = "updatedBy", defaultValue = "admin") String updatedBy) {
        try {
            configService.updateConfig(newConfig, updatedBy);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Configuration updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Validation failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to update configuration: " + e.getMessage()));
        }
    }

    /**
     * GET /api/config/history
     * 설정 변경 이력 조회
     */
    @GetMapping("/history")
    public ResponseEntity<List<ConfigHistory>> getHistory() {
        return ResponseEntity.ok(configService.getHistory());
    }

    /**
     * GET /api/config/history/{fieldName}
     * 특정 필드의 변경 이력 조회
     */
    @GetMapping("/history/{fieldName}")
    public ResponseEntity<List<ConfigHistory>> getFieldHistory(@PathVariable String fieldName) {
        return ResponseEntity.ok(configService.getFieldHistory(fieldName));
    }

    /**
     * POST /api/config/reload
     * 설정 캐시 리로드 (개발/디버깅용)
     */
    @PostMapping("/reload")
    public ResponseEntity<?> reloadConfig() {
        try {
            configService.reloadConfig();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Configuration cache reloaded"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}
