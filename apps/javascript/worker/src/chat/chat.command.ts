import { Command, CommandRunner, Option } from 'nest-commander';
import { ChatService } from './chat.service';
import { MemoryVectorStore } from '../providers/vectorstore/memory.store';
import { VectorStore } from '../providers/vectorstore/vector-store';
import * as path from 'path';

@Command({ name: 'chat', description: 'Ask context-aware questions' })
export class ChatCommand extends CommandRunner {
    constructor(private readonly chatService: ChatService, private readonly vectorStore: VectorStore) {
        super();
    }

    async run(passedParams: string[], options?: any): Promise<void> {
        const query = options.query;
        if (!query) return;

        // DB 로드 (사용하는 저장소 전략이 MEMORY일 경우에만 파일에서 로드)
        if (this.vectorStore instanceof MemoryVectorStore) {
            this.vectorStore.loadFromFile(path.resolve(process.cwd(), 'vector-store.json'));
        }

        console.log(`\n🤔 고민 중...`);
        const answer = await this.chatService.ask(query);
        console.log(`\n🤖 AI 답변:\n------------------\n${answer}\n------------------\n`);
    }

    @Option({ flags: '-q, --query <string>' })
    parseQuery(val: string): string { return val; }
}