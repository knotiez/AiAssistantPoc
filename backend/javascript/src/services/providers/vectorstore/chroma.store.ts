import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChromaClient, Collection } from 'chromadb';
import { DocumentChunk } from "../../models/document-chunk";
import { SearchResult, VectorStore } from './vector-store';
import { IngestionConfig } from '../../config/ingestion.config';
import { traceable } from 'langsmith/traceable';

/**
 * [ChromaDB 벡터 저장소 구현체]
 * 
 * 실무 스타일: 
 * 1. Interface(추상 클래스)를 구현하여 언제든 교체 가능하게 함.
 * 2. OnModuleInit을 통해 서버 시작 시 컬렉션을 자동으로 초기화/연결함.
 */
@Injectable()
export class ChromaVectorStore extends VectorStore implements OnModuleInit {
    private readonly logger = new Logger(ChromaVectorStore.name);
    private client: ChromaClient;
    private collection!: Collection;

    constructor(private readonly config: IngestionConfig) {
        super();
        // [실무 팁] 최신 크로마 DB 라이브러리는 'path' 대신 host/port 사용을 권장합니다.
        const url = new URL(this.config.chromaUrl);
        this.client = new ChromaClient({
            host: url.hostname,
            port: url.port ? parseInt(url.port) : 8000
        });
    }

    /**
     * NestJS 라이프사이클 훅: 모듈이 시작될 때 컬렉션을 준비합니다.
     */
    async onModuleInit() {
        try {
            this.collection = await this.client.getOrCreateCollection({
                name: this.config.chromaCollectionName,
            });
            this.logger.log(`ChromaDB Connection established. Collection: ${this.config.chromaCollectionName}`);
        } catch (error: any) {
            this.logger.error(`Failed to connect to ChromaDB: ${error.message}`);
        }
    }

    /**
     * 단일 청크 저장
     */
    storeChunk = traceable(
        async (
            chunk: DocumentChunk
        ): Promise<void> => {
            if (!chunk.metadata.embedding) return;

            const { embedding, permission, ...rest } = chunk.metadata;
            await this.collection.upsert({
                ids: [chunk.id],
                embeddings: [chunk.metadata.embedding],
                metadatas: [{
                    ...rest,
                    permission: permission.join(','),
                } as any],
                documents: [chunk.text]
            });
        },
        { name: "chroma-store" }
    )

    /**
     * 대량 청크 일괄 저장 (Batching - 실무 필수)
     */
    storeChunks = traceable(
        async (
            chunks: DocumentChunk[]
        ): Promise<void> => {
            const validChunks = chunks.filter(c => c.metadata.embedding);
            if (validChunks.length === 0) return;

            await this.collection.upsert({
                ids: validChunks.map(c => c.id),
                embeddings: validChunks.map(c => c.metadata.embedding!),
                metadatas: validChunks.map(c => {
                    // [실무 팁] ChromaDB 메타데이터는 객체/배열 등을 저장할 수 없습니다.
                    // 따라서 복잡한 데이터는 제거하거나 문자열로 변환해야 합니다.
                    const { embedding, permission, ...rest } = c.metadata;
                    return {
                        ...rest,
                        permission: permission.join(','), // 배열을 문자열로 변환
                    } as any;
                }),
                documents: validChunks.map(c => c.text)
            });
            this.logger.log(`Stored ${validChunks.length} chunks to ChromaDB.`);
        },
        { name: "chroma-store" }
    )

    /**
     * 유사도 검색
     */
    async search(queryVector: number[], topK: number = 5): Promise<SearchResult[]> {
        const response = await this.collection.query({
            queryEmbeddings: [queryVector],
            nResults: topK,
        });

        const results: SearchResult[] = [];
        // ChromaDB 검색 결과를 우리 프로젝트의 SearchResult 형식으로 변환
        if (response.ids.length > 0) {
            for (let i = 0; i < response.ids[0].length; i++) {
                results.push({
                    chunk: {
                        id: response.ids[0][i],
                        text: response.documents[0][i] || '',
                        metadata: response.metadatas[0][i] as any,
                    },
                    score: 1 - ((response.distances as number[][])?.[0][i] ?? 0)
                });
            }
        }
        return results;
    }

    /**
     * 저장된 파일 목록 조회
     */
    async getStoredFiles(): Promise<import('./vector-store').StoredFileInfo[]> {
        try {
            // ChromaDB에서 모든 문서 조회
            const response = await this.collection.get();

            // filePath 기준으로 그룹화
            const fileMap = new Map<string, {
                title: string;
                docType: string;
                updatedAt: string;
                count: number;
            }>();

            // 메타데이터에서 파일 정보 추출
            if (response.metadatas) {
                response.metadatas.forEach((metadata: any) => {
                    const filePath = metadata.filePath;
                    if (!filePath) return;

                    if (fileMap.has(filePath)) {
                        // 이미 존재하는 파일이면 카운트만 증가
                        fileMap.get(filePath)!.count++;
                    } else {
                        // 새 파일이면 추가
                        fileMap.set(filePath, {
                            title: metadata.title || 'Untitled',
                            docType: metadata.docType || 'unknown',
                            updatedAt: metadata.updatedAt || '',
                            count: 1
                        });
                    }
                });
            }

            // Map을 배열로 변환
            const files = Array.from(fileMap.entries()).map(([filePath, info]) => ({
                filePath,
                title: info.title,
                docType: info.docType,
                updatedAt: info.updatedAt,
                chunkCount: info.count
            }));

            this.logger.log(`Retrieved ${files.length} unique files from ChromaDB`);
            return files;
        } catch (error: any) {
            this.logger.error(`Failed to get stored files: ${error.message}`);
            return [];
        }
    }

    /**
     * 모든 데이터 삭제
     */
    async clearAll(): Promise<void> {
        try {
            this.logger.log('Clearing all data from ChromaDB collection...');
            // ChromaDB의 모든 문서를 삭제하려면 where 조건 없이 delete 호출
            const response = await this.collection.get();
            if (response.ids.length > 0) {
                await this.collection.delete({ ids: response.ids });
                this.logger.log(`Successfully cleared ${response.ids.length} documents from ChromaDB`);
            } else {
                this.logger.log('ChromaDB collection is already empty');
            }
        } catch (error: any) {
            this.logger.error(`Failed to clear ChromaDB: ${error.message}`);
            throw error;
        }
    }
}