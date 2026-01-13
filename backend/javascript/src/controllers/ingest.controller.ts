import { Controller, Get, Post, Delete, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { IngestionService } from '../services/ingestion/ingestion.service';
import { VectorStore } from '../services/providers/vectorstore/vector-store';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs/promises';

/**
 * IngestController - 파일 업로드 및 RAG 처리 API
 * 
 * 프론트엔드에서 파일을 받아서 IngestionService를 통해 RAG 처리
 */
@Controller('ingest')
export class IngestController {
    constructor(
        private readonly ingestionService: IngestionService,
        private readonly vectorStore: VectorStore
    ) { }

    /**
     * POST /api/ingest
     * 
     * 여러 파일을 업로드 받아서 RAG 시스템에 추가
     * FormData로 'files' 키에 여러 파일 전송
     */
    @Post()
    @UseInterceptors(
        FilesInterceptor('files', 100, {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    // 원본 파일명 유지 (중복 방지를 위해 타임스탬프 추가)
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
                },
            }),
        }),
    )
    async uploadFiles(@UploadedFiles() files: any[]) {
        try {
            console.log(`[Ingest API] Received ${files.length} files`);

            // 각 파일을 개별적으로 처리
            const results = await Promise.all(
                files.map(async (file) => {
                    try {
                        console.log(`[Ingest API] Processing: ${file.originalname}`);

                        // 파일 내용 읽기
                        const fileContent = await fs.readFile(file.path, 'utf-8');

                        // IngestionService를 통해 개별 파일 처리
                        // 원본 파일명과 내용을 전달
                        const result = await this.ingestionService.processFile(file.originalname, fileContent, file.path);

                        // 처리 완료 후 임시 파일 삭제
                        await fs.unlink(file.path).catch(() => { });

                        return {
                            success: true,
                            filename: file.originalname,
                            ...result  // 파일 정보 포함
                        };
                    } catch (error) {
                        console.error(`[Ingest API] Failed to process ${file.originalname}:`, error);
                        // 실패한 파일도 임시 파일 삭제 시도
                        await fs.unlink(file.path).catch(() => { });
                        return { success: false, filename: file.originalname, error: error.message };
                    }
                })
            );

            const successCount = results.filter(r => r.success).length;
            const failedFiles = results.filter(r => !r.success);
            const successfulFiles = results.filter(r => r.success && 'filePath' in r);

            return {
                success: failedFiles.length === 0,
                message: `${successCount}/${files.length} files processed successfully`,
                filesProcessed: successCount,
                totalFiles: files.length,
                failedFiles: failedFiles.length > 0 ? failedFiles : undefined,
                processedFiles: successfulFiles.map(f => ({
                    filename: f.filename,
                    filePath: (f as any).filePath,
                    chunkCount: (f as any).chunkCount,
                    title: (f as any).title,
                    docType: (f as any).docType,
                    updatedAt: (f as any).updatedAt
                }))
            };
        } catch (error) {
            console.error('[Ingest API] Error:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * GET /api/ingest/sources
     * 
     * Vector DB에 저장된 파일 목록 조회
     */
    @Get('sources')
    async getStoredSources() {
        try {
            const files = await this.vectorStore.getStoredFiles();
            return {
                success: true,
                sources: files,
                totalFiles: files.length
            };
        } catch (error: any) {
            console.error('[Ingest API] Failed to get sources:', error);
            return {
                success: false,
                error: error.message,
                sources: [],
                totalFiles: 0
            };
        }
    }

    /**
     * DELETE /api/ingest/DeleteAll
     * 
     * Vector DB에 저장된 파일 전체 삭제
     */
    @Delete('DeleteAll')
    async clearAll() {
        try {
            await this.vectorStore.clearAll();
            return {
                success: true,
                message: 'All data cleared successfully'
            };
        } catch (error: any) {
            console.error('[Ingest API] Failed to clear all data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
