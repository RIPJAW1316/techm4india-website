import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OidcService } from './oidc.service';
import { PrismaService } from '../../database/prisma.service';

describe('OidcService (PKCE S256 SSO Engine)', () => {
  let service: OidcService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  const mockUser = {
    id: 'user-oidc-123',
    email: 'engineer@techm4india.com',
    firstName: 'Aarav',
    lastName: 'Sharma',
    isActive: true,
    organizationId: 'TECHM4INDIA',
    userRoles: [
      {
        role: {
          code: 'EMPLOYEE',
          permissions: [
            { permission: { code: 'hrms:access' } },
            { permission: { code: 'hrms:leave:apply' } },
          ],
        },
      },
    ],
  };

  const mockClient = {
    id: 'client-1',
    clientId: 'hrms-app-client',
    clientName: 'TechM4India HRMS Portal',
    redirectUris: ['https://techm4india.com/hrms/auth/callback'],
    isActive: true,
    requirePkce: true,
  };

  beforeEach(async () => {
    prisma = {
      oidcClient: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      oidcAuthorizationCode: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    configService = {
      get: jest.fn((key: string, def?: any) => def || 'test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OidcService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<OidcService>(OidcService);
  });

  describe('Authorization Code Generation', () => {
    it('should reject unregistered redirect URIs', async () => {
      prisma.oidcClient.findUnique.mockResolvedValue(mockClient);

      await expect(
        service.authorize(mockUser.id, {
          client_id: 'hrms-app-client',
          redirect_uri: 'https://attacker.com/evil-callback',
          response_type: 'code',
          code_challenge: 'challenge-val',
          code_challenge_method: 'S256',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should generate a 60-second authorization code for valid client & redirect URI', async () => {
      prisma.oidcClient.findUnique.mockResolvedValue(mockClient);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.oidcAuthorizationCode.create.mockResolvedValue({});

      const res = await service.authorize(mockUser.id, {
        client_id: 'hrms-app-client',
        redirect_uri: 'https://techm4india.com/hrms/auth/callback',
        response_type: 'code',
        code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
        code_challenge_method: 'S256',
        state: 'state-xyz-123',
      });

      expect(res.code).toBeDefined();
      expect(res.redirectUrl).toContain('https://techm4india.com/hrms/auth/callback?code=');
      expect(res.redirectUrl).toContain('&state=state-xyz-123');
      expect(prisma.oidcAuthorizationCode.create).toHaveBeenCalled();
    });
  });

  describe('PKCE S256 Code Exchange', () => {
    it('should successfully verify S256 PKCE code_verifier and exchange for tokens', async () => {
      // Create actual RFC 7636 PKCE pair:
      const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

      const mockAuthCodeRecord = {
        id: 'code-id-1',
        clientId: 'hrms-app-client',
        userId: mockUser.id,
        redirectUri: 'https://techm4india.com/hrms/auth/callback',
        codeChallenge,
        codeChallengeMethod: 'S256',
        isUsed: false,
        expiresAt: new Date(Date.now() + 30000), // active
        scope: 'openid profile email',
        user: mockUser,
      };

      prisma.oidcAuthorizationCode.findUnique.mockResolvedValue(mockAuthCodeRecord);
      prisma.oidcAuthorizationCode.update.mockResolvedValue({ ...mockAuthCodeRecord, isUsed: true });

      const tokens = await service.exchangeCodeForToken({
        grant_type: 'authorization_code',
        client_id: 'hrms-app-client',
        redirect_uri: 'https://techm4india.com/hrms/auth/callback',
        code: 'valid-auth-code',
        code_verifier: codeVerifier,
      });

      expect(tokens.access_token).toBe('mock.jwt.token');
      expect(tokens.id_token).toBe('mock.jwt.token');
      expect(tokens.token_type).toBe('Bearer');
      expect(prisma.oidcAuthorizationCode.update).toHaveBeenCalledWith({
        where: { id: 'code-id-1' },
        data: expect.objectContaining({ isUsed: true }),
      });
    });

    it('should reject invalid code_verifier mismatching S256 challenge', async () => {
      const mockAuthCodeRecord = {
        id: 'code-id-2',
        clientId: 'hrms-app-client',
        redirectUri: 'https://techm4india.com/hrms/auth/callback',
        codeChallenge: 'correct-challenge-value',
        isUsed: false,
        expiresAt: new Date(Date.now() + 30000),
        user: mockUser,
      };

      prisma.oidcAuthorizationCode.findUnique.mockResolvedValue(mockAuthCodeRecord);

      await expect(
        service.exchangeCodeForToken({
          grant_type: 'authorization_code',
          client_id: 'hrms-app-client',
          redirect_uri: 'https://techm4india.com/hrms/auth/callback',
          code: 'valid-auth-code',
          code_verifier: 'wrong-verifier',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should prevent replay attack if authorization code has already been redeemed', async () => {
      const mockReplayedCode = {
        id: 'code-id-3',
        clientId: 'hrms-app-client',
        isUsed: true, // Already redeemed
        expiresAt: new Date(Date.now() + 30000),
        user: mockUser,
      };

      prisma.oidcAuthorizationCode.findUnique.mockResolvedValue(mockReplayedCode);

      await expect(
        service.exchangeCodeForToken({
          grant_type: 'authorization_code',
          client_id: 'hrms-app-client',
          redirect_uri: 'https://techm4india.com/hrms/auth/callback',
          code: 'replayed-code',
          code_verifier: 'any-verifier',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
