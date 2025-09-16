import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 세션 설정
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'sharemelon-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // HTTPS에서는 true로 설정
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24시간
      },
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // API 버전 설정
  app.enableVersioning();

  // Swagger API 문서 설정
  const config = new DocumentBuilder()
    .setTitle('ShareMelon API')
    .setDescription('ShareMelon Backend API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 ShareMelon Backend Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
