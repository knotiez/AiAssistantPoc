// 문서의 종류를 미리 정해둡니다. (오타 방지)
export type DocType = 'runbook' | 'adr' | 'policy' | 'api' | 'ingestion' | 'manual';
export type DocVersion = 'current' | 'old';
export type Permission = 'ADMIN' | 'MANAGER' | 'USER';
// 원본 문서의 생김새(Interface) 정의
export interface RawDocument {
    filePath: string; // 파일이 어디 있는지
    rawText: string;  // 파일 안에 무슨 내용이 있는지 (전체 텍스트)
}