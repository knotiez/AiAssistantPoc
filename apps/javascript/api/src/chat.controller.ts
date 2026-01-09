import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from '../../worker/src/chat/chat.service';
import { MemoryVectorStore } from '../../worker/src/providers/vectorstore/memory.store';
import { VectorStore } from '../../worker/src/providers/vectorstore/vector-store';
import * as path from 'path';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly vectorStore: VectorStore,
    ) {
        // 서버 시작 시 DB 로드
        const dbPath = path.resolve(process.cwd(), '../worker/vector-store.json');
        (this.vectorStore as MemoryVectorStore).loadFromFile(dbPath);
    }

    @Post()
    async ask(@Body('query') query: string) {
        if (!query) return { error: 'Query is required' };

        console.log(`[API] Received query: ${query}`);
        const answer = await this.chatService.ask(query);

        return {
            query,
            answer,
        };
    }
}