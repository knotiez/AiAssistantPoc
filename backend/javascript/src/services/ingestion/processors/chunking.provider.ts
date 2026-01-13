import { DocumentChunk, ChunkMetadata } from "../../models/document-chunk";

/**
 * [청킹 프로바이더 추상 클래스]
 * 
 * 모든 청킹 엔진은 이 클래스를 상속받아 'splitDocument'를 구현해야 합니다.
 * 이렇게 하면 나중에 새로운 청킹 API를 추가하더라도 
 * 이를 사용하는 쪽(Chunker)의 코드를 거의 바꾸지 않아도 됩니다.
 */
export abstract class ChunkingProvider {
    /**
     * @param rawText - 처리할 전체 텍스트
     * @param commonMeta - 파일 경로, 수정일 등 공통 메타데이터
     * @returns - 분할된 청크 배열
     */
    abstract splitDocument(
        rawText: string,
        commonMeta: Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>
    ): DocumentChunk[] | Promise<DocumentChunk[]>;
}