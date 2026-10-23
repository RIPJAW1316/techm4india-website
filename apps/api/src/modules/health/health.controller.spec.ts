import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../../database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            isHealthy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getLiveness', () => {
    it('should return liveness status ok with timestamp and version', () => {
      const result = controller.getLiveness();
      expect(result.status).toBe('ok');
      expect(result.version).toBe('1.0.0');
      expect(typeof result.uptime).toBe('number');
      expect(typeof result.timestamp).toBe('string');
    });
  });

  describe('getReadiness', () => {
    it('should return readiness ok when database is healthy', async () => {
      jest.spyOn(prismaService, 'isHealthy').mockResolvedValue({
        isHealthy: true,
        latencyMs: 5,
      });

      const result = await controller.getReadiness();
      expect(result.status).toBe('ok');
      expect(result.database.status).toBe('up');
      expect(result.database.latencyMs).toBe(5);
    });

    it('should throw ServiceUnavailableException when database is down', async () => {
      jest.spyOn(prismaService, 'isHealthy').mockResolvedValue({
        isHealthy: false,
        latencyMs: 12,
        error: 'Database connection failed',
      });

      await expect(controller.getReadiness()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
