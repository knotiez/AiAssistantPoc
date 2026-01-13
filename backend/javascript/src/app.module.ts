import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestionModule } from './services/ingestion/ingestion.module';
import { IngestController } from './controllers/ingest.controller';
import { ChatController } from './controllers/chat.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env', // 워크스페이스 루트의 .env 공유
        }),
        IngestionModule,
    ],
    controllers: [IngestController, ChatController],
    providers: [],
})
export class AppModule { }
