import { ChunkMetadata } from "../../models/document-chunk";

/**
 * [메타데이터 프로바이더 추상 클래스]
 * 모든 메타데이터 추출 로직(규칙형, AI형 등)은 이 클래스를 상속받아야 합니다.
 */
export abstract class MetadataProvider {
    /**
     * 파일 경로와 원문 텍스트를 분석하여 초기 메타데이터를 반환합니다.
     */
    abstract extract(
        filePath: string,
        rawText: string
    ): Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'> | Promise<Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>>;
}