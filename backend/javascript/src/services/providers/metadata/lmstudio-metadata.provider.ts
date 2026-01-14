import { Injectable, Logger } from "@nestjs/common";
import { MetadataProvider } from "./metadata.provider";
import OpenAI from "openai";
import { IngestionConfig } from "src/services/config/ingestion.config";
import { ChunkMetadata } from "src/services/models/document-chunk";
import path from "path";
import { AiDocumentMetadataSchema } from "./openai-metadata.schema";

@Injectable()
export class LMStudioMetadataProvider extends MetadataProvider {

    private readonly logger = new Logger(LMStudioMetadataProvider.name);
    private readonly client: OpenAI;

    constructor(private readonly config: IngestionConfig) {
        super();
        this.client = new OpenAI({
            apiKey: 'lm-studio-api-key', // 로컬이라 api key 상관 없음
            baseURL: this.config.lmStudioApiUrl,
        });
    }

    async extract(filePath: string, rawText: string, filename?: string): Promise<Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>> {
        const leafName = filename || path.basename(filePath);
        this.logger.log(`[LM Studio Metadata] Analyzing with local model: ${leafName}`);

        try {
            // 로컬 모델에게 메타데이터 추출 요청 (Qwen의 경우 시스템 프롬프트를 잘 따릅니다)
            const response = await this.client.chat.completions.create({
                model: this.config.metadataAiModel,
                messages: [
                    {
                        role: "system",
                        content: this.config.metadataSystemPrompt
                    },
                    {
                        role: "user",
                        content: `Document Content: (First 2000 chars):\n${rawText.substring(0, 2000)}`
                    }
                ],
                // 모델이 JSON만 반환하도록 강제 (지원되는 모델인 경우)
                response_format: { type: "json_schema", json_schema: AiDocumentMetadataSchema }
            });

            const content = response.choices[0].message.content || '{}';
            const data = JSON.parse(content);
            return {
                title: data.title || leafName.replace(/\.md$/, ''),
                docType: data.docType || 'manual',
                permission: data.permission || ['USER'],
                summary: data.summary,
                version: 'current',
                updatedAt: new Date().toISOString().split('T')[0],
                filePath,
            };
        } catch (error) {
            this.logger.error(`LM Studio Metadata fail: ${error.message}`);
            // 에러 발생 시 기본값 반환
            return {
                title: leafName.replace(/\.md$/, ''),
                docType: 'manual',
                permission: ['USER'],
                version: 'current',
                updatedAt: new Date().toISOString().split('T')[0],
                filePath
            };
        }
    }
}