import cookieParser from "cookie-parser";
import { INestApplication, ValidationPipe, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";

describe("Attendance, leave and holiday protection", () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true, transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });
  afterAll(async () => { await app.close(); });

  it("keeps attendance and leave APIs behind authentication", async () => {
    await request(app.getHttpServer()).get("/api/v2/attendance/me/today").expect(401);
    await request(app.getHttpServer()).get("/api/v2/leave/me/balances").expect(401);
    await request(app.getHttpServer()).get("/api/v2/holidays").expect(401);
  });
});
