import { DocType, DocVersion, Permission } from './raw-document';

export interface ChunkMetadata {
    docType: DocType;          // 문서 종류 (runbook, adr, …)
    version: DocVersion;       // 'current' | 'old'
    permission: Permission[];  // 접근 권한 배열
    updatedAt: string;         // 파일 수정일 (YYYY‑MM‑DD)
    title: string;             // 파일명(확장자 제외) → 문서 제목
    sectionTitle: string;      // 현재 청크가 속한 섹션(헤더)
    filePath: string;          // 원본 파일 절대 경로
    chunkIndex: number;        // 청크 순번 (0,1,2,…)
    embedding?: number[];      // OpenAI 등에서 반환된 임베딩 배열
    summary?: string;          // AI가 생성한 요약 정보 (Optional 필드)   
}

export interface DocumentChunk {
    id: string;                // 고유 ID : `${filePath}#${sectionTitle}#${chunkIndex}`
    text: string;              // 청크 본문
    metadata: ChunkMetadata;    // 위에서 정의한 메타데이터
}