import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IngestionModule } from '../../worker/src/ingestion/ingestion.module';
import { ChatController } from './chat.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../../.env', // 워크스페이스 루트의 .env 공유
        }),
        IngestionModule,
    ],
    controllers: [ChatController],
    providers: [],
})
export class AppModule { }