import { Command, CommandRunner, Option } from 'nest-commander';
import { SearchService } from './search.service';
import { MemoryVectorStore } from '../providers/vectorstore/memory.store';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import { VectorStore } from '../providers/vectorstore/vector-store';

@Command({ name: 'search', description: 'Search for relevant documents' })
export class SearchCommand extends CommandRunner {
    private readonly logger = new Logger(SearchCommand.name);

    constructor(private readonly searchService: SearchService, private readonly vectorStore: VectorStore) {
        super();
    }

    async run(passedParams: string[], options?: any): Promise<void> {
        const query = options.query;
        if (!query) {
            this.logger.error('Query is required. Use -q or --query');
            return;
        }

        // 1. 기존에 인제션했던 데이터를 파일에서 불러옵니다. (MEMORY 전략일 때만)
        if (this.vectorStore instanceof MemoryVectorStore) {
            const dbPath = path.resolve(process.cwd(), 'vector-store.json');
            this.vectorStore.loadFromFile(dbPath);
        }

        // 2. 검색 실행
        const results = await this.searchService.execute(query);

        // 3. 결과 출력
        console.log('\n=== Search Results ===');
        results.forEach((res: any, i: number) => {
            console.log(`\n[${i + 1}] Score: ${res.score.toFixed(4)}`);
            console.log(`Source: ${res.chunk.metadata.title} > ${res.chunk.metadata.sectionTitle}`);
            console.log(`Content: ${res.chunk.text.substring(0, 200)}...`);
        });
    }

    @Option({ flags: '-q, --query <string>', description: 'Search query' })
    parseQuery(val: string): string { return val; }
}