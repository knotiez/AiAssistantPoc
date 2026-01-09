import { Injectable } from "@nestjs/common";
import { RawDocument } from "../../models/raw-document";
import * as path from 'path';
import { glob } from 'glob';
import * as fs from 'fs/promises';


@Injectable()
export class FileSystemLoader {
    // 주어진 경로(docsRoot) 아래의 모든 md 파일을 찾아서 읽어옵니다.
    async loadAllDocs(docsRoot: string): Promise<RawDocument[]> {
        // 1. glob 패턴 만들기 (예: docs/**/*.md)
        // 윈도우 역슬래시(\) 문제를 피하기 위해 /로 바꿔줍니다.
        const pattern = path.join(docsRoot, '**/*.md').replace(/\\/g, '/');

        // 2. 파일 목록 찾기
        const files = await glob(pattern);

        // 3. 파일 내용 읽기
        const docs: RawDocument[] = [];
        for (const filePath of files) {
            const rawText = await fs.readFile(filePath, 'utf-8');
            docs.push({ filePath, rawText });
        }

        return docs;
    }
}