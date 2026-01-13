import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from '../services/chat/chat.service';
import { MemoryVectorStore } from '../services/providers/vectorstore/memory.store';
import { VectorStore } from '../services/providers/vectorstore/vector-store';
import * as path from 'path';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly vectorStore: VectorStore,
    ) {
        // 서버 시작 시 DB 로드 (메모리 저장소만 해당)
        if (this.vectorStore instanceof MemoryVectorStore) {
            const dbPath = path.resolve(process.cwd(), 'vector-store.json');
            this.vectorStore.loadFromFile(dbPath);
        }
    }

    @Post()
    async ask(@Body('message') query: string) {
        if (!query) return { error: 'Query is required' };

        console.log(`[API] Received query: ${query}`);
        const result = await this.chatService.ask(query);

        return {
            query,
            ...result
        };
    }
}