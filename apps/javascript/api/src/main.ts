import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // API 응답을 위한 /api 접두사 추가 (선택사항)
    app.setGlobalPrefix('api');

    await app.listen(3000);
    console.log(`🚀 API Server is running on: http://localhost:3000/api`);
}
bootstrap();