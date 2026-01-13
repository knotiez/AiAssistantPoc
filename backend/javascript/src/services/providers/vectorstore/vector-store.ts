import { DocumentChunk } from "../../models/document-chunk";

/**
 * [벡터 저장소 추상 클래스]
 * 
 * 임베딩된 데이터(좌표 데이터)를 저장하고 검색하는 모든 저장소 구현체는
 * 이 규격(Interface)을 준수해야 합니다.
 * 추후에 Memory 방식에서 Pinecone, Weaviate 등으로 교체 가능하게 설계되었습니다.
 */

/**
 * 검색 결과의 구조를 정의합니다.
 */
export interface SearchResult {
    chunk: DocumentChunk; // 찾은 지식 조각
    score: number;       // 유사도 점수 (1에 가까울수록 정답에 가까움)
}

/**
 * 저장된 파일 정보
 */
export interface StoredFileInfo {
    filePath: string;    // 파일 경로
    title: string;       // 문서 제목
    docType: string;     // 문서 종류
    updatedAt: string;   // 수정일
    chunkCount: number;  // 청크 개수
}

export abstract class VectorStore {
    /**
     * 문서를 조각 하나씩 저장소에 밀어 넣습니다.
     * @param chunk - 좌표 데이터가 포함된 문서 조각
     */
    abstract storeChunk(chunk: DocumentChunk): Promise<void>;

    /**
     * 여러 개의 문서 조각을 일괄적으로 저장합니다 (성능 최적화용).
     * @param chunks - 저장할 청크 배열
     */
    abstract storeChunks(chunks: DocumentChunk[]): Promise<void>;

    /**
     * 사용자의 질문(임베딩된 좌표)과 가장 '의미적으로 가까운' 문서를 찾아옵니다.
     * @param queryVector - 사용자의 질문을 임베딩한 숫자 배열
     * @param topK - 가져올 결과의 개수 (기본값 5)
     */
    abstract search(
        queryVector: number[],
        topK?: number,
    ): Promise<SearchResult[]>;

    /**
     * 저장된 파일 목록을 조회합니다.
     * @returns 고유한 파일 경로 목록과 메타데이터
     */
    abstract getStoredFiles(): Promise<StoredFileInfo[]>;

    /**
     * 벡터 저장소의 모든 데이터를 삭제합니다.
     */
    abstract clearAll(): Promise<void>;
}
