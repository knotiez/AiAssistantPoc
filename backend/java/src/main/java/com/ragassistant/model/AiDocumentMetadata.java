package com.ragassistant.model;

import lombok.Data;
import java.util.List;

/**
 * AI 메타데이터 응답 DTO
 * OpenAI/LM Studio API로부터 받은 JSON 응답을 매핑
 */
@Data
public class AiDocumentMetadata {
    private String title;
    private String docType;
    private List<String> permission;
    private String summary;
}
