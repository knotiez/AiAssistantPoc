import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { DocumentChunk } from "../../models/document-chunk";
import { EmbeddingProvider } from './embedding.provider';
import { IngestionConfig } from '../../config/ingestion.config';

/**
 * [OpenAI 임베딩 프로바이더]
 * 
 * 부모 클래스(EmbeddingProvider)의 약속을 받아서 
 * 실제로 OpenAI의 'text-embedding-ada-002' 모델 등을 사용해 
 * 텍스트를 숫자로 이루어진 벡터 값으로 변환합니다.
 */
@Injectable()
export class OpenAIEmbeddingProvider extends EmbeddingProvider {
    private readonly logger = new Logger(OpenAIEmbeddingProvider.name);
    private readonly client: OpenAI;

    constructor(private readonly config: IngestionConfig) {
        super();
        // 1. 설정 클레스에서 API 키를 가져와 OpenAI 클라이언트를 초기화합니다.
        this.client = new OpenAI({ apiKey: this.config.openAiApiKey });
    }

    /**
     * 실제로 여러 개의 텍스트 조각을 받아서 한꺼번에 임베딩 작업을 수행합니다.
     */
    async embed(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
        for (const chunk of chunks) {
            try {
                // 2. OpenAI API를 호출하여 텍스트의 의미적 좌표(Embedding Vector)를 생성합니다.
                const resp = await this.client.embeddings.create({
                    model: this.config.embeddingModel,
                    input: chunk.text,
                });

                // 3. 성공 시, 반환된 숫자 배열([0.123, -0.456, ...])을 청크의 메타데이터에 기록합니다.
                chunk.metadata.embedding = resp.data[0].embedding;

            } catch (err: any) {
                // 실패 시 에러 내용을 출력하고, 다음 청크로 넘어갑니다 (중단되지 않음).
                this.logger.error(`[Error] Embedding failed for chunk ${chunk.id}: ${err.message}`);
            }
        }

        return chunks;
    }
}
