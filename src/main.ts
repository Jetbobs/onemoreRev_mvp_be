import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as session from 'express-session';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // BigInt 직렬화 처리
  (BigInt.prototype as any).toJSON = function() {
    return this.toString();
  };

  // temp 디렉토리 생성 (이미지 변환용)
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('📁 temp 디렉토리가 생성되었습니다.');
    } else {
      console.log('📁 temp 디렉토리가 이미 존재합니다.');
    }
  } catch (error) {
    console.warn('⚠️ temp 디렉토리 생성 중 오류:', error.message);
  }

  const app = await NestFactory.create(AppModule);

  // Body parser 설정 (50MB 제한)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 세션 설정
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'onemoreRev-secret-key',
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
    .setTitle('OneMoreRev API')
    .setDescription('OneMoreRev Backend API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 17px !important; }
      .swagger-ui .info .description { font-size: 10px !important; }
      .swagger-ui .opblock-tag { font-size: 16px !important; }
      .swagger-ui .opblock-tag small { font-size: 14px !important; }
      .swagger-ui .opblock .opblock-summary-description { font-size: 8px !important; }
      .swagger-ui .opblock .opblock-summary-path { font-size: 9px !important; }
      .swagger-ui .opblock-description-wrapper p { font-size: 8px !important; }
      .swagger-ui .parameter__name { font-size: 8px !important; }
      .swagger-ui .parameter__type { font-size: 8px !important; }
      .swagger-ui .response-col_description { font-size: 8px !important; }
      .swagger-ui .model-title { font-size: 8px !important; }
      .swagger-ui .model .property { font-size: 8px !important; }
      .swagger-ui .btn { font-size: 8px !important; padding: 1px 3px !important; }
      .swagger-ui .btn.try-out__btn { font-size: 10px !important; padding: 2px 4px !important; min-width: 60px !important; }
      .swagger-ui .opblock .opblock-summary .opblock-summary-path { font-size: 9px !important; }
      .swagger-ui .opblock .opblock-summary .opblock-summary-path .opblock-summary-path__copy { font-size: 7px !important; padding: 1px 2px !important; }
      .swagger-ui .opblock .opblock-summary .opblock-summary-method { padding: 1px 3px !important; min-width: 35px !important; width: auto !important; font-size: 8px !important; }
      .swagger-ui .scheme-container .schemes { font-size: 8px !important; }
      .swagger-ui .wrapper { font-size: 8px !important; }
      .swagger-ui .opblock { margin: 5px 0 !important; }
      .swagger-ui .opblock .opblock-summary { padding: 5px 10px !important; }
      .swagger-ui .opblock .opblock-body { padding: 10px !important; }
      .swagger-ui .opblock .opblock-section-header { padding: 5px 10px !important; }
      .swagger-ui .parameter { padding: 3px 0 !important; }
      .swagger-ui .response-col_status { padding: 3px !important; }
      .swagger-ui .model-container { padding: 5px !important; }
      .swagger-ui .info { margin: 10px 0 !important; padding: 10px !important; }
      .swagger-ui .scheme-container { padding: 5px 10px !important; }
    `,
    customSiteTitle: 'OneMoreRev API Docs'
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 OneMoreRev Backend Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
