import { Injectable, Logger } from "@nestjs/common";
import { EmbeddingProvider } from "./embedding.provider";
import { IngestionConfig } from "src/services/config/ingestion.config";
import OpenAI from "openai";
import { DocumentChunk } from "src/services/models/document-chunk";

@Injectable()
export class LMStudioEmbeddingProvider extends EmbeddingProvider {
    private readonly logger = new Logger(LMStudioEmbeddingProvider.name);
    private readonly client: OpenAI;

    constructor(private readonly config: IngestionConfig) {
        super();
        this.client = new OpenAI({
            apiKey: 'lm-studio-api-key', // 로컬이라 api key 상관 없음
            baseURL: this.config.lmStudioApiUrl,
        });
    }

    async embed(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
        for (const chunk of chunks) {

            this.logger.log(`[LM Studio Embed] Starting embedding for ${chunks.length} chunks...`);
            this.logger.log(`[LM Studio Embed] Using model: ${this.config.embeddingModel}`);

            try {
                const response = await fetch(`${this.config.lmStudioApiUrl}/embeddings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: this.config.embeddingModel,
                        input: chunk.text
                    })
                });

                if (!response.ok) {
                    throw new Error(`LM Studio API Error: ${response.statusText}`);
                }

                const data: any = await response.json();
                const embedding = data.data[0].embedding;
                chunk.metadata.embedding = embedding;

            } catch (err: any) {
                this.logger.error(`[LM Studio Embed Error] Chunk ID: ${chunk.id}`);
                this.logger.error(`Error Message: ${err.message}`);

                // 만약 API 응답 자체가 있다면 그것도 출력
                if (err.response) {
                    this.logger.error(`Response Data: ${JSON.stringify(err.response.data)}`);
                }
            }
        }
        return chunks;
    }
}