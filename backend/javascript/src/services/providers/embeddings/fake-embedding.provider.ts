import { Injectable } from '@nestjs/common';
import { DocumentChunk } from "../../models/document-chunk";
import { EmbeddingProvider } from './embedding.provider';

/**
 * [테스트용 가짜 임베딩 프로바이더]
 * 
 * 실제 OpenAI API를 호출하지 않고, 모든 청크에 대해 
 * 고정된 더미 벡터([0, 0, 0, 0, 0])를 생성합니다.
 * API 비용 발생을 방지하고 로직 검증에만 집중할 때 사용합니다.
 */
@Injectable()
export class FakeEmbeddingProvider extends EmbeddingProvider {
    /**
     * 실제로 API를 호출하는 대신, 즉시 더미 데이터를 채워 응답합니다.
     */
    async embed(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
        for (const chunk of chunks) {
            // 모든 청크에 동일한 5차원 제로 벡터를 할당
            chunk.metadata.embedding = [0, 0, 0, 0, 0];
        }
        return chunks;
    }
}
