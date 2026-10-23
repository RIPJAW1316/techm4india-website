import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return isHealthy: true when database query succeeds', async () => {
    jest.spyOn(service, '$queryRaw').mockResolvedValue([{ '?column?': 1 }] as any);

    const result = await service.isHealthy();
    expect(result.isHealthy).toBe(true);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeUndefined();
  });

  it('should return isHealthy: false when database query fails', async () => {
    jest.spyOn(service, '$queryRaw').mockRejectedValue(new Error('Connection timeout') as any);

    const result = await service.isHealthy();
    expect(result.isHealthy).toBe(false);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBe('Connection timeout');
  });
});
