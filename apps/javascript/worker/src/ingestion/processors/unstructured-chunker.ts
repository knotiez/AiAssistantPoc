import { Injectable, Logger } from '@nestjs/common';
import { DocumentChunk, ChunkMetadata } from "../../models/document-chunk";
import { ChunkingProvider } from './chunking.provider';
import { IngestionConfig } from '../../config/ingestion.config';
import * as path from 'path';

@Injectable()
export class UnstructuredChunkingProvider extends ChunkingProvider {
    private readonly logger = new Logger(UnstructuredChunkingProvider.name);

    constructor(private readonly config: IngestionConfig) {
        super();
    }

    async splitDocument(
        rawText: string,
        commonMeta: Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>
    ): Promise<DocumentChunk[]> {
        this.logger.log(`[Unstructured] Processing file: ${commonMeta.filePath}`);

        try {
            // 1. Unstructured.io API 호출 (multipart/form-data 방식)
            const formData = new FormData();

            // 텍스트를 Blob으로 변환하여 파일처럼 전송합니다.
            const blob = new Blob([rawText], { type: 'text/markdown' });
            formData.append('files', blob, path.basename(commonMeta.filePath));

            // 옵션 추가
            formData.append('strategy', 'fast');
            formData.append('chunking_strategy', 'by_title');
            formData.append('max_characters', '1000');
            formData.append('overlap', '200');

            const response = await fetch(`${this.config.unstructuredApiUrl}/general/v0/general`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'unstructured-api-key': this.config.unstructuredApiKey,
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Unstructured API error (${response.status}): ${errorText}`);
            }

            const elements = (await response.json()) as any[];

            return elements.map((el, index) => {
                // 부모 ID가 없으면 'General'로 설정
                const sectionTitle = el.metadata?.parent_id || 'General';

                return {
                    id: `${commonMeta.filePath}#${sectionTitle}#${index}`,
                    text: el.text || '',
                    metadata: {
                        ...commonMeta,
                        sectionTitle: sectionTitle,
                        chunkIndex: index
                    }
                };
            });

        } catch (error: any) {
            this.logger.error(`[Error] Unstructured chunking failed: ${error.message}`);
            return [];
        }
    }
}