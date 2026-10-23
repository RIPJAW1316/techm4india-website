import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as express from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const host = configService.get<string>('HOST', '0.0.0.0');
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/v1/docs');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // 1. Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Body Parser Limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. CORS Configuration
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.split(',').map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 4. API Prefix
  app.setGlobalPrefix(apiPrefix);

  // 5. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 6. Global Exception Filter & Interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(),
  );

  // 7. Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('TechM4India ERP Platform — Central Backend')
    .setDescription(
      'Enterprise Resource Planning Central API Foundation.\n' +
        'Provides shared identity, authentication, unified application access, and core health monitoring.\n' +
        'Serves as the central backbone for HRMS, Finance ERP, and Central Dashboard applications.',
    )
    .setVersion('1.0.0')
    .addTag('Health & Monitoring', 'Liveness and database readiness probes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT bearer token for authenticated Phase 2 endpoints',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
    customSiteTitle: 'TechM4India ERP API Docs',
  });

  // 8. Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // 9. Start Server
  await app.listen(port, host);
  logger.log(`====================================================`);
  logger.log(`🚀 TechM4India ERP Backend running in [${nodeEnv}] mode`);
  logger.log(`📡 Server listening on: http://${host}:${port}/${apiPrefix}`);
  logger.log(`📚 Swagger documentation at: http://${host}:${port}/${swaggerPath}`);
  logger.log(`🩺 Health check at: http://${host}:${port}/${apiPrefix}/health`);
  logger.log(`🩺 Readiness check at: http://${host}:${port}/${apiPrefix}/health/ready`);
  logger.log(`====================================================`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
