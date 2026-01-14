package com.ragassistant.service;

import org.springframework.stereotype.Component;

@Component
public class DocTypeClassifier {
    public String classify(String filePath) {
        String p = filePath.toLowerCase().replace("\\", "/");

        if (p.contains("/runbook/"))
            return "runbook";
        if (p.contains("/adr/"))
            return "adr";
        if (p.contains("/api/"))
            return "api";
        if (p.contains("/policy/"))
            return "policy";
        if (p.contains("/ingestion/"))
            return "ingestion";
        if (p.contains("/manual/"))
            return "manual";

        return "manual";
    }
}
