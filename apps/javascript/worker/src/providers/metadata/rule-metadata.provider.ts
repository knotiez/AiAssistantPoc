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

    extract(filePath: string, rawText: string): Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'> {
        const fileName = path.basename(filePath);
        const title = fileName.replace(/\.md$/, '');

        // 1. 폴더 경로 기반 타입 분류 (Runbook, ADR 등)
        const docType = this.classifier.classify(filePath);

        // 2. 파일 정보 기반 수정일 및 버전 결정
        const stats = fs.statSync(filePath);
        const updatedAt = stats.mtime.toISOString().split('T')[0];
        const version: DocVersion = fileName.includes('_old') ? 'old' : 'current';

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