import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IngestionService } from "./ingestion.service";
import { IngestionCommand } from "./ingestion.command";
import { FileSystemLoader } from "./loaders/file-system.loader";
import { DocTypeClassifier } from "./processors/doc-type.classifier";
import { MetadataBuilder } from "./processors/metadata.builder";
import { Chunker } from "./processors/chunker";
import { IngestionConfig } from "../config/ingestion.config";
import { EmbeddingProvider } from "../providers/embeddings/embedding.provider";
import { OpenAIEmbeddingProvider } from "../providers/embeddings/openai-embedding.provider";
import { VectorStore } from "../providers/vectorstore/vector-store";
import { MemoryVectorStore } from "../providers/vectorstore/memory.store";
import { ChromaVectorStore } from "../providers/vectorstore/chroma.store";
import { SearchCommand } from "../search/search.command";
import { SearchService } from "../search/search.service";
import { ChatService } from "../chat/chat.service";
import { ChatCommand } from "../chat/chat.command";
import { MarkdownHeaderChunker } from "./processors/markdown-header-chunker";
import { UnstructuredChunkingProvider } from "./processors/unstructured-chunker";
import { RuleMetadataProvider } from "../providers/metadata/rule-metadata.provider";
import { AiMetadataProvider } from "../providers/metadata/openai-metadata.provider";


@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '../../../.env' // 워크스페이스 루트의 .env 파일을 가리킴
    })],
    // 여기에 "명령어(Command)" 등록
    providers: [
        IngestionCommand, // 명령어 등록
        IngestionService, // 서비스 등록
        FileSystemLoader,
        DocTypeClassifier,
        MetadataBuilder,
        Chunker,
        MarkdownHeaderChunker,
        UnstructuredChunkingProvider,
        IngestionConfig,
        SearchService,
        SearchCommand,
        ChatService,
        ChatCommand,
        MemoryVectorStore,
        ChromaVectorStore,
        RuleMetadataProvider,
        AiMetadataProvider,
        { provide: EmbeddingProvider, useClass: OpenAIEmbeddingProvider },
        // VectorStore를 설정에 따라 변환
        {
            provide: VectorStore,
            useFactory: (config: IngestionConfig, memory: MemoryVectorStore, chroma: ChromaVectorStore) => {
                const strategy = config.vectorStoreStrategy.toUpperCase();
                if (strategy === 'CHROMA') {
                    return chroma;
                }
                return memory; // 기본값은 메모리 방식
            },
            inject: [IngestionConfig, MemoryVectorStore, ChromaVectorStore]
        }
    ],
    exports: [IngestionService],
})

export class IngestionModule { }