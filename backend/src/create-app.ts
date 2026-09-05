import "reflect-metadata";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import {
  DocumentBuilder,
  SwaggerModule,
} from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import helmet from "helmet";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

export async function createConfiguredApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigins = configService.get<string[]>("corsOrigins") ?? [];
  const trustProxy = configService.get<boolean>("trustProxy") ?? false;

  if (trustProxy) {
    app.getHttpAdapter().getInstance().set("trust proxy", 1);
  }

  app.setGlobalPrefix("api/v1");
  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true, limit: "1mb" }));
  app.enableCors({
    credentials: true,
    origin: corsOrigins,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("TechM4India ERP API")
    .setDescription(
      "TechM4India ERP API authentication and authorization foundation.",
    )
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  return app;
}
