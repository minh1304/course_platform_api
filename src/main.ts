import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }))
  app.enableCors({
    origin: 'http://localhost:3000', // Allow frontend URL
    credentials: true, // Allow cookies & authentication headers
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
