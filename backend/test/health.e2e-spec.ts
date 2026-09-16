import { INestApplication, VersioningType } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { HealthController } from "../src/health/health.controller";
import { HealthService } from "../src/health/health.service";

describe("Health endpoint", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            getStatus: jest.fn().mockResolvedValue({
              status: "ok",
              service: "techm4india-erp-api",
              database: "connected",
              timestamp: "2026-01-01T00:00:00.000Z",
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    app.enableVersioning({ defaultVersion: "1", type: VersioningType.URI });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns the API health payload", async () => {
    await request(app.getHttpServer()).get("/api/v1/health").expect(200).expect({
      status: "ok",
      service: "techm4india-erp-api",
      database: "connected",
      timestamp: "2026-01-01T00:00:00.000Z",
    });
  });
});
