package com.ragassistant.service;

import com.ragassistant.model.HealthCheckRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthService {

    private final ConfigService configService;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(3, TimeUnit.SECONDS)
            .readTimeout(3, TimeUnit.SECONDS)
            .build();

    public Map<String, String> checkMetadataProviders(HealthCheckRequest request) {
        Map<String, String> results = new HashMap<>();

        // 1. RULE_BASED (Always OK)
        results.put("RULE_BASED", "OK");

        // 2. OPENAI_BASED
        String openAiKey = configService.getOpenAiApiKey();
        if (openAiKey == null || openAiKey.isEmpty()) {
            results.put("OPENAI_BASED", "FAIL: No API Key");
        } else {
            try {
                Request req = new Request.Builder()
                        .url("https://api.openai.com/v1/models")
                        .header("Authorization", "Bearer " + openAiKey)
                        .get()
                        .build();
                try (Response response = httpClient.newCall(req).execute()) {
                    if (response.isSuccessful()) {
                        results.put("OPENAI_BASED", "OK");
                    } else {
                        results.put("OPENAI_BASED", "FAIL: " + response.code());
                    }
                }
            } catch (Exception e) {
                results.put("OPENAI_BASED", "FAIL: " + e.getMessage());
            }
        }

        // 3. LMSTUDIO_BASED
        String lmUrl = request.getLmStudioUrl();
        // If not provided in request, use DB config
        if (lmUrl == null || lmUrl.isEmpty()) {
            lmUrl = configService.getConfig().getLmStudioApiUrl();
        }

        if (lmUrl == null || lmUrl.isEmpty()) {
            results.put("LMSTUDIO_BASED", "FAIL: No URL");
        } else {
            try {
                // Construct URL. Ideally assume standard OpenAI-compatible endpoint structure
                // If url is "http://localhost:1234/v1", target is
                // "http://localhost:1234/v1/models"
                String checkUrl;
                if (lmUrl.endsWith("/")) {
                    checkUrl = lmUrl + "models";
                } else {
                    checkUrl = lmUrl + "/models";
                }

                Request req = new Request.Builder()
                        .url(checkUrl)
                        .get()
                        .build();
                try (Response response = httpClient.newCall(req).execute()) {
                    if (response.isSuccessful()) {
                        results.put("LMSTUDIO_BASED", "OK");
                    } else {
                        results.put("LMSTUDIO_BASED", "FAIL: " + response.code());
                    }
                }
            } catch (Exception e) {
                results.put("LMSTUDIO_BASED", "FAIL: " + e.getMessage());
            }
        }

        return results;
    }
}
