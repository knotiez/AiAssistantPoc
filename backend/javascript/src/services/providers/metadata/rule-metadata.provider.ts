import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { MetadataProvider } from './metadata.provider';
import { ChunkMetadata } from "../../models/document-chunk";
import { DocTypeClassifier } from '../../ingestion/processors/doc-type.classifier';
import { DocVersion, Permission, DocType } from "../../models/raw-document";

/**
 * [규칙 기반 메타데이터 추출기]
 * 파일 경로, 폴더명, 파일명 등 정해진 규칙에 따라 메타데이터를 생성합니다. (기존 로직)
 */
@Injectable()
export class RuleMetadataProvider extends MetadataProvider {
    constructor(private readonly classifier: DocTypeClassifier) {
        super();
    }

    extract(filePath: string, rawText: string, filename?: string): Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'> {
        const leafName = filename || path.basename(filePath);
        const title = leafName.replace(/\.md$/, '');

        // 1. 폴더 경로 기반 타입 분류 (Runbook, ADR 등)
        // filename이 제공되면 filename도 분류에 활용 (단, filePath가 uploads인 경우에만 유용)
        const classificationPath = filename ? `/manual/${filename}` : filePath;
        const docType = this.classifier.classify(classificationPath);

        // 2. 파일 정보 기반 수정일 및 버전 결정
        const stats = fs.statSync(filePath);
        const updatedAt = stats.mtime.toISOString().split('T')[0];
        const version: DocVersion = leafName.includes('_old') ? 'old' : 'current';

        // 3. 타입에 따른 권한 매핑
        const permission = this.mapPermission(docType);

        return {
            docType,
            version,
            permission,
            updatedAt,
            title,
            filePath
        };
    }

    private mapPermission(docType: DocType): Permission[] {
        switch (docType) {
            case 'runbook': return ['MANAGER', 'ADMIN'];
            case 'adr': return ['USER', 'MANAGER', 'ADMIN'];
            default: return ['USER'];
        }
    }
}