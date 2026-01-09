import { Command, CommandRunner, Option } from "nest-commander";
import { IngestionService } from "./ingestion.service";

interface IngestionCommandOptions {
    docsRoot: string;
}

@Command({ name: 'ingest', description: 'Ingest docs into vector store' })
export class IngestionCommand extends CommandRunner {
    // IngestionService 주입
    constructor(private readonly ingestionService: IngestionService) {
        super();
    }

    // 커맨드 실행 시 run() 매서드 호출
    async run(inputs: string[], options: IngestionCommandOptions): Promise<void> {
        // service에 사용자가 정의한 run 함수 실행
        await this.ingestionService.run(options.docsRoot);
    }

    @Option({
        flags: '-d, --docsRoot <docsRoot>',
        description: 'Docs root directory path',
        required: true,
    })
    parseDocsRoot(docsRoot: string): string {
        return docsRoot;
    }

}