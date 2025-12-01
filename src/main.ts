import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser for WorkOS sessions
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('directoris API')
    .setDescription('The director OS for AI-powered storytelling')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('wos_session')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   directoris - the director OS for AI-powered        ║
  ║   storytelling                                       ║
  ║                                                      ║
  ║   Server running on http://localhost:${port}            ║
  ║   Swagger docs: http://localhost:${port}/api/docs       ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
}
bootstrap();
