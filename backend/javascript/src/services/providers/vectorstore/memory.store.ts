import { Injectable, Logger } from '@nestjs/common';
import { DocumentChunk } from "../../models/document-chunk";
import { SearchResult, VectorStore } from './vector-store';
import * as fs from 'fs';

/**
 * [인메모리 벡터 저장소 구현체]
 * 
 * 실제 DB 연동 대신 서버 메모리(Map)에 데이터를 저장하는 방식입니다.
 * 서버가 종료되면 데이터가 사라지므로, 테스트나 프로토타이핑 용도로 적합합니다.
 */
@Injectable()
export class MemoryVectorStore extends VectorStore {
    private readonly logger = new Logger(MemoryVectorStore.name);

    /**
     * 데이터 저장소: Key는 청크 ID, Value는 DocumentChunk입니다.
     */
    private store: Map<string, DocumentChunk> = new Map();

    /**
     * 단일 청크 저장 로직
     */
    async storeChunk(chunk: DocumentChunk): Promise<void> {
        if (!chunk.metadata.embedding) {
            this.logger.warn(`Chunk ${chunk.id} has no embedding. Skipping storage.`);
            return;
        }
        this.store.set(chunk.id, chunk);
    }

    /**
     * 대량 청크 일괄 저장 로직
     */
    async storeChunks(chunks: DocumentChunk[]): Promise<void> {
        for (const c of chunks) {
            await this.storeChunk(c);
        }
    }

    /**
    * [검색 로직]
    * 모든 저장된 조각들을 돌면서 사용자의 질문과 얼마나 닮았는지 계산합니다.
    */
    async search(
        queryVector: number[],
        topK: number,
    ): Promise<SearchResult[]> {

        this.logger.log(`Searching for top ${topK} similar chunks...`);

        const results: SearchResult[] = [];

        // 1. 저장된 모든 청크를 하나씩 꺼내어 비교합니다.
        for (const chunk of this.store.values()) {
            const similarity = this.cosineSimilarity(queryVector, chunk.metadata.embedding!);
            results.push({ chunk, score: similarity });
        }

        // 2. 유사도(score)가 높은 순서대로 정렬하고 상위 topK개만 반환합니다.
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
    * [수학적 헬퍼: 코사인 유사도]
    * 두 벡터 사이의 유사도를 -1 ~ 1 사이의 값으로 계산합니다.
    * (보통 임베딩 값은 양수이므로 0~1 사이의 값이 나옵니다)
    */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let mA = 0;
        let mB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            mA += vecA[i] * vecA[i];
            mB += vecB[i] * vecB[i];
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        if (mA === 0 || mB === 0) return 0;
        return dotProduct / (mA * mB);
    }

    /**
     * [저장] 현재 메모리에 있는 데이터를 JSON 파일로 저장합니다.
     */
    saveToFile(filePath: string): void {
        // Map 객체는 바로 JSON화가 안 되므로 배열로 변환해서 저장합니다.
        const data = Array.from(this.store.entries());
        fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
        this.logger.log(`Vector Store saved to: ${filePath}`);
    }

    /**
     * [로드] JSON 파일에서 데이터를 읽어와 메모리에 올립니다.
     */
    loadFromFile(filePath: string): void {
        if (!fs.existsSync(filePath)) return;

        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);
        // 저장했던 배열을 다시 Map으로 복구합니다.
        this.store = new Map(data);
        this.logger.log(`Vector Store loaded from: ${filePath} (${this.store.size} chunks)`);
    }

    /**
     * 저장된 파일 목록 조회
     */
    async getStoredFiles(): Promise<import('./vector-store').StoredFileInfo[]> {
        const fileMap = new Map<string, {
            title: string;
            docType: string;
            updatedAt: string;
            count: number;
        }>();

        // 모든 청크를 순회하며 파일별로 그룹화
        for (const chunk of this.store.values()) {
            const filePath = chunk.metadata.filePath;
            if (!filePath) continue;

            if (fileMap.has(filePath)) {
                fileMap.get(filePath)!.count++;
            } else {
                fileMap.set(filePath, {
                    title: chunk.metadata.title || 'Untitled',
                    docType: chunk.metadata.docType || 'unknown',
                    updatedAt: chunk.metadata.updatedAt || '',
                    count: 1
                });
            }
        }

        // Map을 배열로 변환
        const files = Array.from(fileMap.entries()).map(([filePath, info]) => ({
            filePath,
            title: info.title,
            docType: info.docType,
            updatedAt: info.updatedAt,
            chunkCount: info.count
        }));

        this.logger.log(`Retrieved ${files.length} unique files from memory store`);
        return files;
    }

    /**
     * 모든 데이터 삭제
     */
    async clearAll(): Promise<void> {
        this.store.clear();
    }
}

