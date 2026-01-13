import { DocType, DocVersion, Permission } from './raw-document';

/**
 * =========================
 * 1. LLM 출력 전용 메타데이터
 * =========================
 * - OpenAI Structured Outputs(json_schema)와 1:1 대응
 * - "AI가 추론해서 낼 수 있는 값"만 포함
 */
export interface AiDocumentMetadata {
    title: string;             // 문서 제목
    docType: DocType;           // 문서 종류
    permission: Permission[];   // 접근 권한
    summary?: string;           // 문서 요약 (선택)
}

/**
 * =========================
 * 2. 최종 Chunk 메타데이터
 * =========================
 * - 파이프라인 전체를 거친 뒤
 * - 벡터 DB에 저장되는 "완성본 메타데이터"
 */
export interface ChunkMetadata extends AiDocumentMetadata {
    version: DocVersion;       // 'current' | 'old'
    updatedAt: string;         // 파일 수정일 (YYYY‑MM‑DD)
    sectionTitle: string;      // 현재 청크가 속한 섹션(헤더)
    filePath: string;          // 원본 파일 절대 경로
    chunkIndex: number;        // 청크 순번 (0,1,2,…)
    embedding?: number[];      // OpenAI 등에서 반환된 임베딩 배열
}


/**
 * =========================
 * 3. 실제 벡터 단위 문서
 * =========================
 * - 벡터 DB에 저장되는 최소 단위
 */
export interface DocumentChunk {
    id: string;                // 고유 ID : `${filePath}#${sectionTitle}#${chunkIndex}`
    text: string;              // 청크 본문
    metadata: ChunkMetadata;    // 위에서 정의한 메타데이터
}