package com.ragassistant.controller;

import com.ragassistant.model.HealthCheckRequest;
import com.ragassistant.service.HealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final HealthService healthService;

    @PostMapping("/metadata")
    public ResponseEntity<Map<String, String>> checkMetadataHealth(@RequestBody HealthCheckRequest request) {
        Map<String, String> results = healthService.checkMetadataProviders(request);
        return ResponseEntity.ok(results);
    }
}
