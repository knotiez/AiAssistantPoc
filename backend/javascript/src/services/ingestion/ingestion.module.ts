import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IngestionService } from "./ingestion.service";
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
import { SearchService } from "../search/search.service";
import { ChatService } from "../chat/chat.service";
import { MarkdownHeaderChunker } from "./processors/markdown-header-chunker";
import { UnstructuredChunkingProvider } from "./processors/unstructured-chunker";
import { RuleMetadataProvider } from "../providers/metadata/rule-metadata.provider";
import { AiMetadataProvider } from "../providers/metadata/openai-metadata.provider";
import { EmbeddingBuilder } from "./processors/embedding.builder";
import { VectorStoreManager } from "../providers/vectorstore/vector-store-manager";


@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '../../../.env' // 워크스페이스 루트의 .env 파일을 가리킴
    })],
    providers: [
        IngestionService,
        FileSystemLoader,
        DocTypeClassifier,
        MetadataBuilder,
        Chunker,
        MarkdownHeaderChunker,
        UnstructuredChunkingProvider,
        IngestionConfig,
        SearchService,
        ChatService,
        MemoryVectorStore,
        ChromaVectorStore,
        RuleMetadataProvider,
        AiMetadataProvider,
        OpenAIEmbeddingProvider,
        // Managed Orchestrators
        EmbeddingBuilder,
        VectorStoreManager,
        // Map abstract tokens to orchestrators
        { provide: EmbeddingProvider, useClass: EmbeddingBuilder },
        { provide: VectorStore, useClass: VectorStoreManager },
    ],
    exports: [IngestionService, VectorStore, ChatService],
})

export class IngestionModule { }