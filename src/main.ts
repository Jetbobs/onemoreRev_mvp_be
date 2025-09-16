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
  SwaggerModule.setup('api/docs', app, document, {
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 17px !important; }
      .swagger-ui .info .description { font-size: 10px !important; }
      .swagger-ui .opblock .opblock-summary-description { font-size: 8px !important; }
      .swagger-ui .opblock .opblock-summary-path { font-size: 9px !important; }
      .swagger-ui .opblock-description-wrapper p { font-size: 8px !important; }
      .swagger-ui .parameter__name { font-size: 8px !important; }
      .swagger-ui .parameter__type { font-size: 8px !important; }
      .swagger-ui .response-col_description { font-size: 8px !important; }
      .swagger-ui .model-title { font-size: 8px !important; }
      .swagger-ui .model .property { font-size: 8px !important; }
      .swagger-ui .btn { font-size: 8px !important; padding: 2px 6px !important; }
      .swagger-ui .btn.try-out__btn { font-size: 10px !important; padding: 4px 8px !important; min-width: 60px !important; }
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
    customSiteTitle: 'ShareMelon API Docs'
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 ShareMelon Backend Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
