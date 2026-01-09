import { Injectable, Logger } from "@nestjs/common";
import { FileSystemLoader } from "./loaders/file-system.loader";
import { MetadataBuilder } from "./processors/metadata.builder";
import { Chunker } from "./processors/chunker";
import { EmbeddingProvider } from "../providers/embeddings/embedding.provider";
import { VectorStore } from "../providers/vectorstore/vector-store";

/**
 * [인제션 오케스트레이터 서비스]
 * 
 * 로드 → 분류 → 분할 → 임베딩 → 저장의 전체 '인제션 파이프라인'을
 * 총괄 지휘하는 메인 서비스 클래스입니다.
 */
@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);

    constructor(
        private readonly loader: FileSystemLoader,
        private readonly metadataBuilder: MetadataBuilder,
        private readonly chunker: Chunker,
        private readonly embeddingProvider: EmbeddingProvider,
        private readonly vectorStore: VectorStore,
    ) { }

    /**
     * 지정된 경로의 모든 문서를 처리하여 벡터 저장소에 쌓습니다.
     * 
     * @param docsRoot - 처리할 문서들이 담긴 최상위 폴더 경로
     */
    async run(docsRoot: string): Promise<void> {
        this.logger.log(`>>> Ingestion Started: [${docsRoot}]`);

        // 1. 문서 로드 (FileSystem I/O)
        const rawDocs = await this.loader.loadAllDocs(docsRoot);
        this.logger.log(`Step 1: Found ${rawDocs.length} files to process.`);

        // 파일 병렬 처리
        // 너무 많은 파일 동시에 처리 시 API 할당량 초과(Rate Limit) 날 수 있음
        // Promise.all을 사용해 모든 작업을 동시에 던짐( 파일이 수천 개라면 10개씩 끊어서 처리하는 'Batching' 로직 추가 필요 )
        const processResults = await Promise.all(rawDocs.map(async (doc) => {
            try {
                // 2-1. 메타데이터 생성 (AI 분석 포함)
                const meta = await this.metadataBuilder.build(doc.filePath, doc.rawText);
                // 2-2. 청킹 (의미 기반 텍스트 분할)
                const chunks = await this.chunker.splitDocument(doc.rawText, meta);
                // 2-3. 임베딩 (AI 좌표 추출)
                const embedded = await this.embeddingProvider.embed(chunks);
                // 2-4. 벡터 저장소 저장
                await this.vectorStore.storeChunks(embedded);
                return chunks.length; // 성공한 청크 수 반환
            } catch (error: any) {
                this.logger.error(`Failed to process ${doc.filePath}: ${error.message}`);
                return 0; // 실패 시 0개
            }
        }));
        // 총 처리된 청크 수 합산
        const totalChunksCount = processResults.reduce((acc, count) => acc + count, 0);
        this.logger.log(`>>> Ingestion Finished. Total: ${rawDocs.length} files / ${totalChunksCount} chunks processed.`);
    }
}