import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * [인제션 설정 관리 서비스]
 * 
 * 환경 변수(.env)에서 인제션 프로세스에 필요한 값들을 가져오는 역할을 담당합니다.
 */
@Injectable()
export class IngestionConfig {
    constructor(private readonly configService: ConfigService) { }

    // --- API KEY 관련 ---
    get openAiApiKey(): string {
        return this.configService.get<string>('OPENAI_API_KEY') || '';
    }

    get embeddingModel(): string {
        return this.configService.get<string>('EMBEDDING_MODEL') || 'text-embedding-ada-002';
    }

    get unstructuredApiKey(): string {
        return this.configService.get<string>('UNSTRUCTURED_API_KEY') || '';
    }

    get unstructuredApiUrl(): string {
        return this.configService.get<string>('UNSTRUCTURED_API_URL') || 'https://api.unstructuredapp.io';
    }


    // -- 청킹 방식선택( MARKDOWN | UNSTRUCTURED )
    get chunkingStrategy(): string {
        return this.configService.get<string>('CHUNKING_STRATEGY') || 'MARKDOWN';
    }

    // -- 벡터 저장소선택( MEMORY | CHROMA )
    get vectorStoreStrategy(): string {
        return this.configService.get<string>('VECTOR_STORE_STRATEGY') || 'MEMORY';
    }

    get chromaUrl(): string {
        return this.configService.get<string>('CHROMA_URL') || 'http://localhost:8000';
    }

    get chromaCollectionName(): string {
        return this.configService.get<string>('CHROMA_COLLECTION_NAME') || 'rag_collection';
    }

    // -- 메타데이터 추출 방식( OPENAI_BASED | RULE_BASED )
    get metadataStrategy(): string {
        return this.configService.get<string>('METADATA_STRATEGY') || 'RULE';
    }

    get metadataAiModel(): string {
        return this.configService.get<string>('METADATA_AI_MODEL') || 'gpt-4o-mini';
    }

    // -- 메타데이터 추출용 AI 프롬프트 설정
    get metadataSystemPrompt(): string {
        return this.configService.get<string>('METADATA_SYSTEM_PROMPT') || 'Extract metadata in JSON format.';
    }

    // -- 채팅(RAG)용 모델 및 파라미터
    get chatAiModel(): string {
        return this.configService.get<string>('CHAT_AI_MODEL') || 'gpt-4o-mini';
    }

    get chatTemperature(): number {
        return Number(this.configService.get<string>('CHAT_TEMPERATURE')) || 0;
    }

    get maxContextLength(): number {
        return Number(this.configService.get<string>('MAX_CONTEXT_LENGTH')) || 0;
    }

    // -- 채팅(RAG)용 AI 프롬프트 설정
    get chatSystemPrompt(): string {
        return this.configService.get<string>('CHAT_SYSTEM_PROMPT') || 'You are a helpful assistant.';
    }
}