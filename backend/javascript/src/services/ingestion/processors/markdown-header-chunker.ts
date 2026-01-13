import { Injectable, Logger } from '@nestjs/common';
import { DocumentChunk, ChunkMetadata } from "../../models/document-chunk";
import { ChunkingProvider } from './chunking.provider';

/**
 * [마크다운 헤더 기반 청커]
 */
@Injectable()
export class MarkdownHeaderChunker extends ChunkingProvider {
    private readonly logger = new Logger(MarkdownHeaderChunker.name);

    splitDocument(
        rawText: string,
        commonMeta: Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>
    ): DocumentChunk[] {
        const lines = rawText.split('\n');
        const chunks: DocumentChunk[] = [];

        let currentSectionTitle = 'Root';
        let currentContent: string[] = [];
        let chunkIndex = 0;

        for (const line of lines) {
            if (line.startsWith('## ') || line.startsWith('### ')) {
                if (currentContent.length > 0) {
                    this.addChunk(chunks, currentContent, currentSectionTitle, chunkIndex++, commonMeta);
                    currentContent = [];
                }
                currentSectionTitle = line.replace(/#/g, '').trim();
            }
            currentContent.push(line);
        }

        if (currentContent.length > 0) {
            this.addChunk(chunks, currentContent, currentSectionTitle, chunkIndex++, commonMeta);
        }

        return chunks;
    }

    private addChunk(
        chunks: DocumentChunk[],
        content: string[],
        sectionTitle: string,
        chunkIndex: number,
        commonMeta: Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>
    ) {
        const text = content.join('\n').trim();
        if (!text) return;

        const id = `${commonMeta.filePath}#${sectionTitle}#${chunkIndex}`;

        chunks.push({
            id,
            text,
            metadata: {
                ...commonMeta,
                sectionTitle,
                chunkIndex
            }
        });
    }
}