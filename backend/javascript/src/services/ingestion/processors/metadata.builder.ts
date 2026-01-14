import { Injectable, Logger } from '@nestjs/common';
import { IngestionConfig } from '../../config/ingestion.config';
import { ChunkMetadata } from "../../models/document-chunk";
import { MetadataProvider } from '../../providers/metadata/metadata.provider';
import { RuleMetadataProvider } from '../../providers/metadata/rule-metadata.provider';
import { AiMetadataProvider } from '../../providers/metadata/openai-metadata.provider';
import { LMStudioMetadataProvider } from 'src/services/providers/metadata/lmstudio-metadata.provider';

@Injectable()
export class MetadataBuilder {
    private readonly logger = new Logger(MetadataBuilder.name);

    constructor(
        private readonly config: IngestionConfig,
        private readonly ruleProvider: RuleMetadataProvider,
        private readonly aiProvider: AiMetadataProvider,
        private readonly lmStudioProvider: LMStudioMetadataProvider,
    ) { }

    async build(filePath: string, rawText: string, filename?: string): Promise<Omit<ChunkMetadata, 'chunkIndex' | 'sectionTitle'>> {
        const strategy = this.config.metadataStrategy.toUpperCase();
        let provider: MetadataProvider;

        if (strategy === "OPENAI_BASED") {
            this.logger.log(`Using OPENAI_BASED Metadata Extraction Strategy (${strategy})...`);
            provider = this.aiProvider;
        } else if (strategy === "RULE_BASED") {
            this.logger.log(`Using RULE_BASED Metadata Extraction Strategy (${strategy})...`);
            provider = this.ruleProvider;
        } else if (strategy === "LMSTUDIO_BASED") { // [추가]
            provider = this.lmStudioProvider;
        } else {
            throw new Error(`Invalid metadata strategy: ${strategy}`);
        }

        return provider.extract(filePath, rawText, filename);
    }
}