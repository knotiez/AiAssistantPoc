import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { IngestionService } from './ingestion.service';
import { FileSystemLoader } from './loaders/file-system.loader';
import { MetadataBuilder } from './processors/metadata.builder';
import { Chunker } from './processors/chunker';
import { IngestionConfig } from '../config/ingestion.config';
import { EmbeddingProvider } from '../providers/embeddings/embedding.provider';
import { FakeEmbeddingProvider } from '../providers/embeddings/fake-embedding.provider';
import { VectorStore } from '../providers/vectorstore/vector-store';
import { MemoryVectorStore } from '../providers/vectorstore/memory.store';
import { DocTypeClassifier } from './processors/doc-type.classifier';
import * as path from 'path';

describe('IngestionService (e2e)', () => {
    let service: IngestionService;
    let vectorStore: VectorStore;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../../.env'
            })],
            providers: [
                IngestionService,
                FileSystemLoader,
                DocTypeClassifier,
                MetadataBuilder,
                Chunker,
                IngestionConfig,
                { provide: EmbeddingProvider, useClass: FakeEmbeddingProvider },
                { provide: VectorStore, useClass: MemoryVectorStore },
            ],
        }).compile();

        service = module.get<IngestionService>(IngestionService);
        vectorStore = module.get<VectorStore>(VectorStore);
    });

    it('should process docs end‑to‑end', async () => {
        // Use path.resolve to find the docs directory
        const docsPath = path.resolve(__dirname, '../../../../docs/runbook');
        await service.run(docsPath);

        // Verify that at least one chunk was stored in the in‑memory vector store
        const storedCount = (vectorStore as any).store.size;
        expect(storedCount).toBeGreaterThan(0);
    });
});