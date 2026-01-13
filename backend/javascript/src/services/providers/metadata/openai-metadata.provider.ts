import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as path from 'path';
import { traceable } from 'langsmith/traceable'

import { MetadataProvider } from './metadata.provider';
import { IngestionConfig } from '../../config/ingestion.config';
import { AiDocumentMetadata, ChunkMetadata } from "../../models/document-chunk";
import { AiDocumentMetadataSchema } from './openai-metadata.schema';

/**
 * [AI 기반 메타데이터 추출기]
 * LLM(OpenAI)을 사용하여 문서 본문을 분석하고 지능형 메타데이터를 추출합니다.
 */
@Injectable()
export class AiMetadataProvider extends MetadataProvider {
    private readonly logger = new Logger(AiMetadataProvider.name);
    private readonly client: OpenAI;

    constructor(private readonly config: IngestionConfig) {
        super();
        this.client = new OpenAI({ apiKey: this.config.openAiApiKey });
    }

    extract = traceable(
        async (
            filePath: string,
            rawText: string,
            filename?: string
        ): Promise<Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>> => {
            const leafName = filename || path.basename(filePath);
            const titleFromPath = leafName.replace(/\.md$/, '');
            this.logger.log(`[AI Metadata] Analyzing content for: ${leafName}`);

            try {
                const response = await this.client.chat.completions.create({
                    model: this.config.metadataAiModel,
                    messages: [
                        {
                            role: "system",
                            content: this.config.metadataSystemPrompt
                        },
                        {
                            role: "user",
                            content: `Document Content (First 2000 chars):\n${rawText.substring(0, 2000)}`
                        }
                    ],
                    response_format: { type: "json_schema", json_schema: AiDocumentMetadataSchema }
                });

                const message = response.choices[0].message;
                if (!message.content) {
                    throw new Error("AI metadata response content is null");
                }

                const aiData = JSON.parse(message.content) as AiDocumentMetadata;

                return {
                    title: aiData.title ?? titleFromPath,
                    docType: aiData.docType,
                    permission: aiData.permission,
                    summary: aiData.summary,
                    version: 'current',
                    updatedAt: new Date().toISOString().split('T')[0],
                    filePath,
                };

            } catch (error: any) {
                this.logger.error(`AI Metadata extraction failed: ${error.message}`);
                // 실패 시 기본값 반환
                return {
                    title: titleFromPath,
                    docType: 'manual',
                    permission: ['USER'],
                    version: 'current',
                    updatedAt: new Date().toISOString().split('T')[0],
                    filePath
                };
            }
        },
        { name: "ai-metadata-extract", }
    );
}