import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS 설정 - 프론트엔드에서 접근 가능하게
    app.enableCors({
        origin: 'http://localhost:5173', // Vite 개발 서버
        credentials: true,
    });

    // API 응답을 위한 /api 접두사 추가
    app.setGlobalPrefix('api');

    await app.listen(3000);
    console.log(`🚀 API Server is running on: http://localhost:3000/api`);
}
bootstrap();
